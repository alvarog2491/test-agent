import { bedrock } from '@cdklabs/generative-ai-cdk-constructs';
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
export interface PersistenceStackProps extends cdk.StackProps {
}
export declare class PersistenceStack extends cdk.Stack {
    readonly knowledgeBaseBucket: s3.IBucket;
    readonly leadTable: dynamodb.ITable;
    readonly evaluationsResultsBucket: s3.IBucket;
    readonly knowledgeBase: bedrock.VectorKnowledgeBase;
    constructor(scope: Construct, id: string, props?: PersistenceStackProps);
}
