import { bedrock } from '@cdklabs/generative-ai-cdk-constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
export interface ApiGatewayConstructProps {
    readonly agent: bedrock.IAgent;
    readonly agentAlias: bedrock.IAgentAlias;
    readonly stage: string;
}
export declare class ApiGatewayConstruct extends Construct {
    readonly api: apigateway.RestApi;
    readonly handler: lambda.Function;
    constructor(scope: Construct, id: string, props: ApiGatewayConstructProps);
    /**
     * Encapsulates the Request Validation logic.
     * This keeps the "noisy" Zod-to-JSON mapping out of the main flow.
     */
    private createRequestModel;
    /**
     * Connects the API root to the Lambda handler with a specific validator.
     */
    private addPostMethod;
}
