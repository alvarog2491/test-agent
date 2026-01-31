import { bedrock } from '@cdklabs/generative-ai-cdk-constructs';
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3_assets from 'aws-cdk-lib/aws-s3-assets';
import { Construct } from 'constructs';
import * as fs from 'fs';
import * as path from 'path';
import { AppSettings } from '../../config-manager';
import { LAMBDA_PYTHON_RUNTIME } from '../../constants';

export interface LeadCollectionConstructProps {
    readonly leadTableArn: string;
    readonly leadTableName: string;
    readonly config: AppSettings;
}

// Construct that defines the lead collection logic via Lambda and Bedrock Action Group
export class LeadCollectionConstruct extends Construct {
    public readonly actionGroup: bedrock.AgentActionGroup;
    public readonly leadCollectionFunction: lambda.Function;

    constructor(scope: Construct, id: string, props: LeadCollectionConstructProps) {
        super(scope, id);

        // Loads the API schema asset for the lead collection action group
        const leadSchemaAsset = this.loadSchemaAsset();
        // References the DynamoDB table where leads will be stored
        const leadsTable = dynamodb.Table.fromTableAttributes(this, 'ImportedLeadTable', {
            tableArn: props.leadTableArn,
        });

        const { config } = props;

        // Provisions the Lambda function that processes lead collection requests
        this.leadCollectionFunction = new lambda.Function(this, 'LeadCollectionFunction', {

            runtime: LAMBDA_PYTHON_RUNTIME,
            architecture: lambda.Architecture.ARM_64,
            code: lambda.Code.fromAsset(path.join(__dirname, '../../../src/lambda/lead-collector'), {
                bundling: {
                    image: LAMBDA_PYTHON_RUNTIME.bundlingImage,
                    command: [
                        'bash', '-c',
                        'pip install -r requirements.txt -t /asset-output && cp -au . /asset-output',
                    ],
                },
            }),
            handler: 'index.handler',
            timeout: cdk.Duration.seconds(60),
            tracing: lambda.Tracing.ACTIVE,
            environment: {
                LEADS_TABLE_NAME: props.leadTableName,
            },
        });

        // Publish a new version of the Lambda function
        const version = this.leadCollectionFunction.currentVersion;

        // Create or update alias for the current environment
        const alias = new lambda.Alias(this, 'LeadCollectionAlias', {
            aliasName: config.stage,
            version: version,
            description: `${config.stage} environment alias - Version ${config.version}`,
        });

        // Creates the Bedrock Action Group for lead collection with schema and executor
        // Uses the alias ARN instead of function ARN for production-grade deployments
        this.actionGroup = new bedrock.AgentActionGroup({
            name: 'lead-collection',
            enabled: true,
            description: 'Collects and manages user leads.',
            apiSchema: bedrock.ApiSchema.fromS3File(leadSchemaAsset.bucket, leadSchemaAsset.s3ObjectKey),
            executor: bedrock.ActionGroupExecutor.fromlambdaFunction(alias),
        });

        // Grants the Lambda function permission to write data to the leads table
        leadsTable.grantWriteData(alias);
    }

    private loadSchemaAsset(): s3_assets.Asset {
        const assetsPath = path.join(__dirname, '../../../assets/api-schema/lead-collection.json');
        if (!fs.existsSync(assetsPath)) {
            throw new Error(`Lead collection schema not found at ${assetsPath}`);
        }

        // Creates an S3 asset from the local API schema file
        return new s3_assets.Asset(this, 'LeadSchemaAsset', {
            path: assetsPath,
        });
    }
}
