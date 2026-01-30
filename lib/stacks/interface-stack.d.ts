import { bedrock } from '@cdklabs/generative-ai-cdk-constructs';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
export interface InterfaceStackProps extends cdk.StackProps {
    readonly agent: bedrock.IAgent;
    readonly agentAlias: bedrock.IAgentAlias;
}
export declare class InterfaceStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: InterfaceStackProps);
}
