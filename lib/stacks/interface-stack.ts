import { bedrock } from '@cdklabs/generative-ai-cdk-constructs';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AppSettings } from '../config-manager';
import { ApiGatewayConstruct } from '../constructs/interface/api-gateway';

export interface InterfaceStackProps extends cdk.StackProps {
    readonly config: AppSettings;
    readonly agent: bedrock.IAgent;
    readonly agentAlias: bedrock.IAgentAlias;
}

// Stack that exposes the Bedrock agent via API Gateway
export class InterfaceStack extends cdk.Stack {
    public readonly api: cdk.aws_apigateway.IRestApi;

    constructor(scope: Construct, id: string, props: InterfaceStackProps) {
        super(scope, id, props);
        const { config } = props;

        // Provisions API Gateway to handle agent interaction requests
        const apiGateway = new ApiGatewayConstruct(this, 'ApiGateway', {
            config,
            agent: props.agent,
            agentAlias: props.agentAlias,
            stage: config.stage,
        });

        this.api = apiGateway.api;


    }
}
