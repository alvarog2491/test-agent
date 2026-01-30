import { bedrock } from '@cdklabs/generative-ai-cdk-constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
export interface LeadCollectionConstructProps {
    readonly leadTableArn: string;
    readonly leadTableName: string;
}
export declare class LeadCollectionConstruct extends Construct {
    readonly actionGroup: bedrock.AgentActionGroup;
    readonly leadCollectionFunction: lambda.Function;
    constructor(scope: Construct, id: string, props: LeadCollectionConstructProps);
    private loadSchemaAsset;
}
