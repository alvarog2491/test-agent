import { bedrock, pinecone } from '@cdklabs/generative-ai-cdk-constructs';
import * as cdk from 'aws-cdk-lib';
import { FoundationModelIdentifier } from 'aws-cdk-lib/aws-bedrock';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import { Construct } from 'constructs';
import * as path from 'path';
import { AppSettings } from '../../config-manager';
import { LAMBDA_PYTHON_RUNTIME } from '../../constants';
export interface KnowledgeBaseConstructProps {
    readonly bucket: s3.IBucket;
    readonly config: AppSettings;
}

// Construct for managing the Bedrock Knowledge Base and its data source
export class KnowledgeBaseConstruct extends Construct {
    public readonly knowledgeBase: bedrock.VectorKnowledgeBase;

    constructor(scope: Construct, id: string, props: KnowledgeBaseConstructProps) {
        super(scope, id);
        const { config } = props;

        // Configures Pinecone as the vector storage for document embeddings
        const pineconecds = new pinecone.PineconeVectorStore({
            connectionString: config.vectorStore.connectionString,
            credentialsSecretArn: config.vectorStore.credentialsSecretArn,
            textField: 'text',
            metadataField: 'metadata',
        });

        // Defines the embedding model identifier from application configuration
        const modelIdentifier = new FoundationModelIdentifier(config.embeddingModel);
        // References the Bedrock foundation model used for generating embeddings
        const embeddingModel = bedrock.BedrockFoundationModel.fromCdkFoundationModelId(modelIdentifier, {
            supportsKnowledgeBase: true,
        });

        // Provisions the vector knowledge base combining Pinecone and Bedrock embeddings
        this.knowledgeBase = new bedrock.VectorKnowledgeBase(this, 'KnowledgeBase', {
            vectorStore: pineconecds,
            embeddingsModel: embeddingModel,
            instruction: 'Use this knowledge base to answer questions about the documents.',

        });
        // Connects the S3 bucket as a data source with semantic chunking enabled
        const dataSource = this.knowledgeBase.addS3DataSource({
            bucket: props.bucket,
            chunkingStrategy: bedrock.ChunkingStrategy.SEMANTIC,
        });

        this.setupAutoSync(props.bucket, dataSource.dataSourceId, config);
    }

    /**
     * Sets up the automatic synchronization mechanism by creating a Lambda function 
     * triggered by S3 events (upload/delete) to start Knowledge Base ingestion jobs.
     * 
     * @param bucket The S3 bucket acting as the data source
     * @param dataSourceId The ID of the Bedrock Knowledge Base data source
     */
    private setupAutoSync(bucket: s3.IBucket, dataSourceId: string, config: AppSettings) {

        // Defines the Lambda function to coordinate manual syncs when files change
        const syncLambda = new lambda.Function(this, 'SyncLambda', {

            runtime: LAMBDA_PYTHON_RUNTIME,
            handler: 'index.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../../../src/lambda/kb-sync'), {
                bundling: {
                    image: LAMBDA_PYTHON_RUNTIME.bundlingImage,
                    command: [
                        'bash', '-c',
                        'pip install -r requirements.txt -t /asset-output && cp -au . /asset-output',
                    ],
                },
            }),
            timeout: cdk.Duration.minutes(10),
            environment: {
                KNOWLEDGE_BASE_ID: this.knowledgeBase.knowledgeBaseId,
                DATA_SOURCE_ID: dataSourceId,
            },
        });

        // Grants permission to start ingestion jobs on the Knowledge Base
        this.knowledgeBase.grant(syncLambda, 'bedrock:StartIngestionJob', 'bedrock:AssociateThirdPartyKnowledgeBase');

        // Configures S3 event notifications to trigger the Sync Lambda
        bucket.addEventNotification(
            s3.EventType.OBJECT_CREATED,
            new s3n.LambdaDestination(syncLambda)
        );
        bucket.addEventNotification(
            s3.EventType.OBJECT_REMOVED,
            new s3n.LambdaDestination(syncLambda)
        );
    }
}

