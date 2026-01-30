import { bedrock } from '@cdklabs/generative-ai-cdk-constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
export interface KnowledgeBaseConstructProps {
    readonly bucket: s3.IBucket;
}
export declare class KnowledgeBaseConstruct extends Construct {
    readonly knowledgeBase: bedrock.VectorKnowledgeBase;
    constructor(scope: Construct, id: string, props: KnowledgeBaseConstructProps);
    /**
     * Sets up the automatic synchronization mechanism by creating a Lambda function
     * triggered by S3 events (upload/delete) to start Knowledge Base ingestion jobs.
     *
     * @param bucket The S3 bucket acting as the data source
     * @param dataSourceId The ID of the Bedrock Knowledge Base data source
     */
    private setupAutoSync;
}
