import { bedrock } from '@cdklabs/generative-ai-cdk-constructs';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
export interface EvaluationStackProps extends cdk.StackProps {
    readonly agent: bedrock.IAgent;
    readonly agentAlias: bedrock.IAgentAlias;
    readonly resultsBucket: s3.IBucket;
}
export declare class EvaluationStack extends cdk.Stack {
    readonly evalSecurityGroup: ec2.SecurityGroup;
    constructor(scope: Construct, id: string, props: EvaluationStackProps);
}
