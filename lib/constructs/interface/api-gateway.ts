import { bedrock } from '@cdklabs/generative-ai-cdk-constructs';
import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import * as path from 'path';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { AppSettings } from '../../config-manager';
import { LAMBDA_PYTHON_RUNTIME } from '../../constants';

export interface ApiGatewayConstructProps {
    readonly config: AppSettings;
    readonly agent: bedrock.IAgent;
    readonly agentAlias: bedrock.IAgentAlias;
    readonly stage: string;
}

// Construct that sets up API Gateway to expose the Bedrock agent to external consumers
export class ApiGatewayConstruct extends Construct {
    public readonly api: apigateway.RestApi;
    public readonly handler: lambda.Function;

    constructor(scope: Construct, id: string, props: ApiGatewayConstructProps) {
        super(scope, id);
        const { config } = props;

        // Creates a CloudWatch log group for capturing API Gateway access logs
        const logGroup = new logs.LogGroup(this, 'ApiLogs', {
            logGroupName: '/aws/api-gateway/bedrock-agent-api',
            retention: config.logRetention,
            removalPolicy: config.removalPolicy,
        });

        // Provisions the Lambda function that invokes the Bedrock agent
        this.handler = new lambda.Function(this, 'ApiHandler', {

            runtime: LAMBDA_PYTHON_RUNTIME,
            architecture: lambda.Architecture.ARM_64,
            code: lambda.Code.fromAsset(path.join(__dirname, '../../../src/lambda/agent-invoker'), {
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
                AGENT_ID: props.agent.agentId,
                AGENT_ALIAS_ID: props.agentAlias.aliasId,
                ALLOWED_ORIGINS: config.allowedOrigins.join(','),
                LANGFUSE_SECRET_ARN: config.langfuse.secretArn,
                LANGFUSE_BASE_URL: config.langfuse.baseUrl,
                AGENT_MODEL_ID: config.agentModel,
            },
        });

        // access to the secret
        const secret = secretsmanager.Secret.fromSecretCompleteArn(this, 'LangfuseSecret', config.langfuse.secretArn);
        secret.grantRead(this.handler);

        // Provisions the Rest API Gateway with logging and stage configuration
        this.api = new apigateway.RestApi(this, 'Endpoint', {
            restApiName: 'BedrockAgentApi',
            deployOptions: {
                stageName: props.stage,
                accessLogDestination: new apigateway.LogGroupLogDestination(logGroup),
                accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields(),
                loggingLevel: apigateway.MethodLoggingLevel.INFO,
                throttlingBurstLimit: 100,
                throttlingRateLimit: 50,
                tracingEnabled: true,
            },
            defaultCorsPreflightOptions: {
                allowOrigins: config.allowedOrigins,
                allowMethods: apigateway.Cors.ALL_METHODS,
            },

        });

        // Adds a WAF security layer to the API Gateway
        //new WafwebaclToApiGateway(this, 'ApiSecurityLayer', {
        //    existingApiGatewayInterface: this.api,
        //});

        // Grants the Lambda handler permission to invoke the Bedrock agent alias
        props.agentAlias.grantInvoke(this.handler);

        // Defines the JSON schema for validating incoming API requests
        const requestModel = this.createRequestModel();

        // Endpoint: Attach the POST method with the validator
        this.addPostMethod(requestModel);
    }

    /**
     * Encapsulates the Request Validation logic.
     * This keeps the "noisy" Zod-to-JSON mapping out of the main flow.
     */
    private createRequestModel(): apigateway.Model {
        const requestSchema = z.object({
            prompt: z.string().min(1).max(500),
            sessionId: z.string().optional(),
        });

        const jsonSchema: any = zodToJsonSchema(requestSchema as any, 'bedrockAgentRequest');

        return this.api.addModel('RequestModel', {
            contentType: 'application/json',
            schema: {
                schema: apigateway.JsonSchemaVersion.DRAFT4,
                title: 'BedrockAgentRequest',
                type: apigateway.JsonSchemaType.OBJECT,
                properties: jsonSchema.properties,
                required: jsonSchema.required,
            },
        });
    }

    /**
     * Connects the API root to the Lambda handler with a specific validator.
     */
    private addPostMethod(model: apigateway.Model): void {
        // Configures a validator to ensure request bodies match the defined schema
        const validator = this.api.addRequestValidator('RequestValidator', {
            validateRequestBody: true,
            validateRequestParameters: true,
        });

        // Creates the POST method and integrates it with the Lambda handler
        this.api.root.addMethod('POST', new apigateway.LambdaIntegration(this.handler), {
            requestModels: { 'application/json': model },
            requestValidator: validator,
        });
    }
}