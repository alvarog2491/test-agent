import { bedrock } from '@cdklabs/generative-ai-cdk-constructs';
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
export interface ComputeStackProps extends cdk.StackProps {
    readonly knowledgeBase: bedrock.IVectorKnowledgeBase;
    readonly leadTable: dynamodb.ITable;
}
export declare class ComputeStack extends cdk.Stack {
    readonly agent: bedrock.IAgent;
    readonly agentAlias: bedrock.IAgentAlias;
    constructor(scope: Construct, id: string, props: ComputeStackProps);
}
