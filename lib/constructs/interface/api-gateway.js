"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiGatewayConstruct = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const apigateway = __importStar(require("aws-cdk-lib/aws-apigateway"));
const lambda = __importStar(require("aws-cdk-lib/aws-lambda"));
const logs = __importStar(require("aws-cdk-lib/aws-logs"));
const constructs_1 = require("constructs");
const path = __importStar(require("path"));
const zod_1 = require("zod");
const zod_to_json_schema_1 = require("zod-to-json-schema");
const config_manager_1 = require("../../config-manager");
const constants_1 = require("../../constants");
// Construct that sets up API Gateway to expose the Bedrock agent to external consumers
class ApiGatewayConstruct extends constructs_1.Construct {
    api;
    handler;
    constructor(scope, id, props) {
        super(scope, id);
        const config = config_manager_1.ConfigManager.getInstance().config;
        // Creates a CloudWatch log group for capturing API Gateway access logs
        const logGroup = new logs.LogGroup(this, 'ApiLogs', {
            logGroupName: '/aws/api-gateway/bedrock-agent-api',
            retention: config.logRetention,
            removalPolicy: config.removalPolicy,
        });
        // Provisions the Lambda function that invokes the Bedrock agent
        this.handler = new lambda.Function(this, 'ApiHandler', {
            functionName: `${config.appName.toLowerCase()}-agent-invoker`,
            runtime: constants_1.LAMBDA_PYTHON_RUNTIME,
            architecture: lambda.Architecture.ARM_64,
            code: lambda.Code.fromAsset(path.join(__dirname, '../../../src/lambda/agent-invoker'), {
                bundling: {
                    image: constants_1.LAMBDA_PYTHON_RUNTIME.bundlingImage,
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
                LANGFUSE_SECRET_KEY: config.langfuse.secretKey,
                LANGFUSE_PUBLIC_KEY: config.langfuse.publicKey,
                LANGFUSE_BASE_URL: config.langfuse.baseUrl,
            },
        });
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
    createRequestModel() {
        const requestSchema = zod_1.z.object({
            prompt: zod_1.z.string().min(1).max(500),
            sessionId: zod_1.z.string().optional(),
        });
        const jsonSchema = (0, zod_to_json_schema_1.zodToJsonSchema)(requestSchema, 'bedrockAgentRequest');
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
    addPostMethod(model) {
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
exports.ApiGatewayConstruct = ApiGatewayConstruct;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLWdhdGV3YXkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhcGktZ2F0ZXdheS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSxpREFBbUM7QUFDbkMsdUVBQXlEO0FBQ3pELCtEQUFpRDtBQUNqRCwyREFBNkM7QUFDN0MsMkNBQXVDO0FBQ3ZDLDJDQUE2QjtBQUM3Qiw2QkFBd0I7QUFDeEIsMkRBQXFEO0FBQ3JELHlEQUFxRDtBQUNyRCwrQ0FBd0Q7QUFReEQsdUZBQXVGO0FBQ3ZGLE1BQWEsbUJBQW9CLFNBQVEsc0JBQVM7SUFDOUIsR0FBRyxDQUFxQjtJQUN4QixPQUFPLENBQWtCO0lBRXpDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBK0I7UUFDckUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNqQixNQUFNLE1BQU0sR0FBRyw4QkFBYSxDQUFDLFdBQVcsRUFBRSxDQUFDLE1BQU0sQ0FBQztRQUVsRCx1RUFBdUU7UUFDdkUsTUFBTSxRQUFRLEdBQUcsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUU7WUFDaEQsWUFBWSxFQUFFLG9DQUFvQztZQUNsRCxTQUFTLEVBQUUsTUFBTSxDQUFDLFlBQVk7WUFDOUIsYUFBYSxFQUFFLE1BQU0sQ0FBQyxhQUFhO1NBQ3RDLENBQUMsQ0FBQztRQUVILGdFQUFnRTtRQUNoRSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQ25ELFlBQVksRUFBRSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLGdCQUFnQjtZQUM3RCxPQUFPLEVBQUUsaUNBQXFCO1lBQzlCLFlBQVksRUFBRSxNQUFNLENBQUMsWUFBWSxDQUFDLE1BQU07WUFDeEMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLG1DQUFtQyxDQUFDLEVBQUU7Z0JBQ25GLFFBQVEsRUFBRTtvQkFDTixLQUFLLEVBQUUsaUNBQXFCLENBQUMsYUFBYTtvQkFDMUMsT0FBTyxFQUFFO3dCQUNMLE1BQU0sRUFBRSxJQUFJO3dCQUNaLDRFQUE0RTtxQkFDL0U7aUJBQ0o7YUFDSixDQUFDO1lBQ0YsT0FBTyxFQUFFLGVBQWU7WUFDeEIsT0FBTyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUNqQyxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNO1lBQzlCLFdBQVcsRUFBRTtnQkFDVCxRQUFRLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPO2dCQUM3QixjQUFjLEVBQUUsS0FBSyxDQUFDLFVBQVUsQ0FBQyxPQUFPO2dCQUN4QyxlQUFlLEVBQUUsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO2dCQUNoRCxtQkFBbUIsRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLFNBQVM7Z0JBQzlDLG1CQUFtQixFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsU0FBUztnQkFDOUMsaUJBQWlCLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPO2FBQzdDO1NBQ0osQ0FBQyxDQUFDO1FBRUgsdUVBQXVFO1FBQ3ZFLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUU7WUFDaEQsV0FBVyxFQUFFLGlCQUFpQjtZQUM5QixhQUFhLEVBQUU7Z0JBQ1gsU0FBUyxFQUFFLEtBQUssQ0FBQyxLQUFLO2dCQUN0QixvQkFBb0IsRUFBRSxJQUFJLFVBQVUsQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLENBQUM7Z0JBQ3JFLGVBQWUsRUFBRSxVQUFVLENBQUMsZUFBZSxDQUFDLHNCQUFzQixFQUFFO2dCQUNwRSxZQUFZLEVBQUUsVUFBVSxDQUFDLGtCQUFrQixDQUFDLElBQUk7Z0JBQ2hELG9CQUFvQixFQUFFLEdBQUc7Z0JBQ3pCLG1CQUFtQixFQUFFLEVBQUU7Z0JBQ3ZCLGNBQWMsRUFBRSxJQUFJO2FBQ3ZCO1lBQ0QsMkJBQTJCLEVBQUU7Z0JBQ3pCLFlBQVksRUFBRSxNQUFNLENBQUMsY0FBYztnQkFDbkMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsV0FBVzthQUM1QztTQUVKLENBQUMsQ0FBQztRQUVILCtDQUErQztRQUMvQyx1REFBdUQ7UUFDdkQsNENBQTRDO1FBQzVDLEtBQUs7UUFFTCx5RUFBeUU7UUFDekUsS0FBSyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRTNDLCtEQUErRDtRQUMvRCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUUvQyxzREFBc0Q7UUFDdEQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ssa0JBQWtCO1FBQ3RCLE1BQU0sYUFBYSxHQUFHLE9BQUMsQ0FBQyxNQUFNLENBQUM7WUFDM0IsTUFBTSxFQUFFLE9BQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQztZQUNsQyxTQUFTLEVBQUUsT0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRTtTQUNuQyxDQUFDLENBQUM7UUFFSCxNQUFNLFVBQVUsR0FBUSxJQUFBLG9DQUFlLEVBQUMsYUFBb0IsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO1FBRXJGLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFO1lBQ3JDLFdBQVcsRUFBRSxrQkFBa0I7WUFDL0IsTUFBTSxFQUFFO2dCQUNKLE1BQU0sRUFBRSxVQUFVLENBQUMsaUJBQWlCLENBQUMsTUFBTTtnQkFDM0MsS0FBSyxFQUFFLHFCQUFxQjtnQkFDNUIsSUFBSSxFQUFFLFVBQVUsQ0FBQyxjQUFjLENBQUMsTUFBTTtnQkFDdEMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxVQUFVO2dCQUNqQyxRQUFRLEVBQUUsVUFBVSxDQUFDLFFBQVE7YUFDaEM7U0FDSixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQ7O09BRUc7SUFDSyxhQUFhLENBQUMsS0FBdUI7UUFDekMsMkVBQTJFO1FBQzNFLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsa0JBQWtCLEVBQUU7WUFDL0QsbUJBQW1CLEVBQUUsSUFBSTtZQUN6Qix5QkFBeUIsRUFBRSxJQUFJO1NBQ2xDLENBQUMsQ0FBQztRQUVILG9FQUFvRTtRQUNwRSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLElBQUksVUFBVSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUM1RSxhQUFhLEVBQUUsRUFBRSxrQkFBa0IsRUFBRSxLQUFLLEVBQUU7WUFDNUMsZ0JBQWdCLEVBQUUsU0FBUztTQUM5QixDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUFwSEQsa0RBb0hDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYmVkcm9jayB9IGZyb20gJ0BjZGtsYWJzL2dlbmVyYXRpdmUtYWktY2RrLWNvbnN0cnVjdHMnO1xuaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCAqIGFzIGFwaWdhdGV3YXkgZnJvbSAnYXdzLWNkay1saWIvYXdzLWFwaWdhdGV3YXknO1xuaW1wb3J0ICogYXMgbGFtYmRhIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEnO1xuaW1wb3J0ICogYXMgbG9ncyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbG9ncyc7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyB6IH0gZnJvbSAnem9kJztcbmltcG9ydCB7IHpvZFRvSnNvblNjaGVtYSB9IGZyb20gJ3pvZC10by1qc29uLXNjaGVtYSc7XG5pbXBvcnQgeyBDb25maWdNYW5hZ2VyIH0gZnJvbSAnLi4vLi4vY29uZmlnLW1hbmFnZXInO1xuaW1wb3J0IHsgTEFNQkRBX1BZVEhPTl9SVU5USU1FIH0gZnJvbSAnLi4vLi4vY29uc3RhbnRzJztcblxuZXhwb3J0IGludGVyZmFjZSBBcGlHYXRld2F5Q29uc3RydWN0UHJvcHMge1xuICAgIHJlYWRvbmx5IGFnZW50OiBiZWRyb2NrLklBZ2VudDtcbiAgICByZWFkb25seSBhZ2VudEFsaWFzOiBiZWRyb2NrLklBZ2VudEFsaWFzO1xuICAgIHJlYWRvbmx5IHN0YWdlOiBzdHJpbmc7XG59XG5cbi8vIENvbnN0cnVjdCB0aGF0IHNldHMgdXAgQVBJIEdhdGV3YXkgdG8gZXhwb3NlIHRoZSBCZWRyb2NrIGFnZW50IHRvIGV4dGVybmFsIGNvbnN1bWVyc1xuZXhwb3J0IGNsYXNzIEFwaUdhdGV3YXlDb25zdHJ1Y3QgZXh0ZW5kcyBDb25zdHJ1Y3Qge1xuICAgIHB1YmxpYyByZWFkb25seSBhcGk6IGFwaWdhdGV3YXkuUmVzdEFwaTtcbiAgICBwdWJsaWMgcmVhZG9ubHkgaGFuZGxlcjogbGFtYmRhLkZ1bmN0aW9uO1xuXG4gICAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IEFwaUdhdGV3YXlDb25zdHJ1Y3RQcm9wcykge1xuICAgICAgICBzdXBlcihzY29wZSwgaWQpO1xuICAgICAgICBjb25zdCBjb25maWcgPSBDb25maWdNYW5hZ2VyLmdldEluc3RhbmNlKCkuY29uZmlnO1xuXG4gICAgICAgIC8vIENyZWF0ZXMgYSBDbG91ZFdhdGNoIGxvZyBncm91cCBmb3IgY2FwdHVyaW5nIEFQSSBHYXRld2F5IGFjY2VzcyBsb2dzXG4gICAgICAgIGNvbnN0IGxvZ0dyb3VwID0gbmV3IGxvZ3MuTG9nR3JvdXAodGhpcywgJ0FwaUxvZ3MnLCB7XG4gICAgICAgICAgICBsb2dHcm91cE5hbWU6ICcvYXdzL2FwaS1nYXRld2F5L2JlZHJvY2stYWdlbnQtYXBpJyxcbiAgICAgICAgICAgIHJldGVudGlvbjogY29uZmlnLmxvZ1JldGVudGlvbixcbiAgICAgICAgICAgIHJlbW92YWxQb2xpY3k6IGNvbmZpZy5yZW1vdmFsUG9saWN5LFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBQcm92aXNpb25zIHRoZSBMYW1iZGEgZnVuY3Rpb24gdGhhdCBpbnZva2VzIHRoZSBCZWRyb2NrIGFnZW50XG4gICAgICAgIHRoaXMuaGFuZGxlciA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0FwaUhhbmRsZXInLCB7XG4gICAgICAgICAgICBmdW5jdGlvbk5hbWU6IGAke2NvbmZpZy5hcHBOYW1lLnRvTG93ZXJDYXNlKCl9LWFnZW50LWludm9rZXJgLFxuICAgICAgICAgICAgcnVudGltZTogTEFNQkRBX1BZVEhPTl9SVU5USU1FLFxuICAgICAgICAgICAgYXJjaGl0ZWN0dXJlOiBsYW1iZGEuQXJjaGl0ZWN0dXJlLkFSTV82NCxcbiAgICAgICAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vLi4vLi4vc3JjL2xhbWJkYS9hZ2VudC1pbnZva2VyJyksIHtcbiAgICAgICAgICAgICAgICBidW5kbGluZzoge1xuICAgICAgICAgICAgICAgICAgICBpbWFnZTogTEFNQkRBX1BZVEhPTl9SVU5USU1FLmJ1bmRsaW5nSW1hZ2UsXG4gICAgICAgICAgICAgICAgICAgIGNvbW1hbmQ6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICdiYXNoJywgJy1jJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdwaXAgaW5zdGFsbCAtciByZXF1aXJlbWVudHMudHh0IC10IC9hc3NldC1vdXRwdXQgJiYgY3AgLWF1IC4gL2Fzc2V0LW91dHB1dCcsXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoNjApLFxuICAgICAgICAgICAgdHJhY2luZzogbGFtYmRhLlRyYWNpbmcuQUNUSVZFLFxuICAgICAgICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgICAgICAgICBBR0VOVF9JRDogcHJvcHMuYWdlbnQuYWdlbnRJZCxcbiAgICAgICAgICAgICAgICBBR0VOVF9BTElBU19JRDogcHJvcHMuYWdlbnRBbGlhcy5hbGlhc0lkLFxuICAgICAgICAgICAgICAgIEFMTE9XRURfT1JJR0lOUzogY29uZmlnLmFsbG93ZWRPcmlnaW5zLmpvaW4oJywnKSxcbiAgICAgICAgICAgICAgICBMQU5HRlVTRV9TRUNSRVRfS0VZOiBjb25maWcubGFuZ2Z1c2Uuc2VjcmV0S2V5LFxuICAgICAgICAgICAgICAgIExBTkdGVVNFX1BVQkxJQ19LRVk6IGNvbmZpZy5sYW5nZnVzZS5wdWJsaWNLZXksXG4gICAgICAgICAgICAgICAgTEFOR0ZVU0VfQkFTRV9VUkw6IGNvbmZpZy5sYW5nZnVzZS5iYXNlVXJsLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gUHJvdmlzaW9ucyB0aGUgUmVzdCBBUEkgR2F0ZXdheSB3aXRoIGxvZ2dpbmcgYW5kIHN0YWdlIGNvbmZpZ3VyYXRpb25cbiAgICAgICAgdGhpcy5hcGkgPSBuZXcgYXBpZ2F0ZXdheS5SZXN0QXBpKHRoaXMsICdFbmRwb2ludCcsIHtcbiAgICAgICAgICAgIHJlc3RBcGlOYW1lOiAnQmVkcm9ja0FnZW50QXBpJyxcbiAgICAgICAgICAgIGRlcGxveU9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICBzdGFnZU5hbWU6IHByb3BzLnN0YWdlLFxuICAgICAgICAgICAgICAgIGFjY2Vzc0xvZ0Rlc3RpbmF0aW9uOiBuZXcgYXBpZ2F0ZXdheS5Mb2dHcm91cExvZ0Rlc3RpbmF0aW9uKGxvZ0dyb3VwKSxcbiAgICAgICAgICAgICAgICBhY2Nlc3NMb2dGb3JtYXQ6IGFwaWdhdGV3YXkuQWNjZXNzTG9nRm9ybWF0Lmpzb25XaXRoU3RhbmRhcmRGaWVsZHMoKSxcbiAgICAgICAgICAgICAgICBsb2dnaW5nTGV2ZWw6IGFwaWdhdGV3YXkuTWV0aG9kTG9nZ2luZ0xldmVsLklORk8sXG4gICAgICAgICAgICAgICAgdGhyb3R0bGluZ0J1cnN0TGltaXQ6IDEwMCxcbiAgICAgICAgICAgICAgICB0aHJvdHRsaW5nUmF0ZUxpbWl0OiA1MCxcbiAgICAgICAgICAgICAgICB0cmFjaW5nRW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkZWZhdWx0Q29yc1ByZWZsaWdodE9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICBhbGxvd09yaWdpbnM6IGNvbmZpZy5hbGxvd2VkT3JpZ2lucyxcbiAgICAgICAgICAgICAgICBhbGxvd01ldGhvZHM6IGFwaWdhdGV3YXkuQ29ycy5BTExfTUVUSE9EUyxcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQWRkcyBhIFdBRiBzZWN1cml0eSBsYXllciB0byB0aGUgQVBJIEdhdGV3YXlcbiAgICAgICAgLy9uZXcgV2Fmd2ViYWNsVG9BcGlHYXRld2F5KHRoaXMsICdBcGlTZWN1cml0eUxheWVyJywge1xuICAgICAgICAvLyAgICBleGlzdGluZ0FwaUdhdGV3YXlJbnRlcmZhY2U6IHRoaXMuYXBpLFxuICAgICAgICAvL30pO1xuXG4gICAgICAgIC8vIEdyYW50cyB0aGUgTGFtYmRhIGhhbmRsZXIgcGVybWlzc2lvbiB0byBpbnZva2UgdGhlIEJlZHJvY2sgYWdlbnQgYWxpYXNcbiAgICAgICAgcHJvcHMuYWdlbnRBbGlhcy5ncmFudEludm9rZSh0aGlzLmhhbmRsZXIpO1xuXG4gICAgICAgIC8vIERlZmluZXMgdGhlIEpTT04gc2NoZW1hIGZvciB2YWxpZGF0aW5nIGluY29taW5nIEFQSSByZXF1ZXN0c1xuICAgICAgICBjb25zdCByZXF1ZXN0TW9kZWwgPSB0aGlzLmNyZWF0ZVJlcXVlc3RNb2RlbCgpO1xuXG4gICAgICAgIC8vIEVuZHBvaW50OiBBdHRhY2ggdGhlIFBPU1QgbWV0aG9kIHdpdGggdGhlIHZhbGlkYXRvclxuICAgICAgICB0aGlzLmFkZFBvc3RNZXRob2QocmVxdWVzdE1vZGVsKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFbmNhcHN1bGF0ZXMgdGhlIFJlcXVlc3QgVmFsaWRhdGlvbiBsb2dpYy5cbiAgICAgKiBUaGlzIGtlZXBzIHRoZSBcIm5vaXN5XCIgWm9kLXRvLUpTT04gbWFwcGluZyBvdXQgb2YgdGhlIG1haW4gZmxvdy5cbiAgICAgKi9cbiAgICBwcml2YXRlIGNyZWF0ZVJlcXVlc3RNb2RlbCgpOiBhcGlnYXRld2F5Lk1vZGVsIHtcbiAgICAgICAgY29uc3QgcmVxdWVzdFNjaGVtYSA9IHoub2JqZWN0KHtcbiAgICAgICAgICAgIHByb21wdDogei5zdHJpbmcoKS5taW4oMSkubWF4KDUwMCksXG4gICAgICAgICAgICBzZXNzaW9uSWQ6IHouc3RyaW5nKCkub3B0aW9uYWwoKSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QganNvblNjaGVtYTogYW55ID0gem9kVG9Kc29uU2NoZW1hKHJlcXVlc3RTY2hlbWEgYXMgYW55LCAnYmVkcm9ja0FnZW50UmVxdWVzdCcpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmFwaS5hZGRNb2RlbCgnUmVxdWVzdE1vZGVsJywge1xuICAgICAgICAgICAgY29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgIHNjaGVtYToge1xuICAgICAgICAgICAgICAgIHNjaGVtYTogYXBpZ2F0ZXdheS5Kc29uU2NoZW1hVmVyc2lvbi5EUkFGVDQsXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdCZWRyb2NrQWdlbnRSZXF1ZXN0JyxcbiAgICAgICAgICAgICAgICB0eXBlOiBhcGlnYXRld2F5Lkpzb25TY2hlbWFUeXBlLk9CSkVDVCxcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiBqc29uU2NoZW1hLnByb3BlcnRpZXMsXG4gICAgICAgICAgICAgICAgcmVxdWlyZWQ6IGpzb25TY2hlbWEucmVxdWlyZWQsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb25uZWN0cyB0aGUgQVBJIHJvb3QgdG8gdGhlIExhbWJkYSBoYW5kbGVyIHdpdGggYSBzcGVjaWZpYyB2YWxpZGF0b3IuXG4gICAgICovXG4gICAgcHJpdmF0ZSBhZGRQb3N0TWV0aG9kKG1vZGVsOiBhcGlnYXRld2F5Lk1vZGVsKTogdm9pZCB7XG4gICAgICAgIC8vIENvbmZpZ3VyZXMgYSB2YWxpZGF0b3IgdG8gZW5zdXJlIHJlcXVlc3QgYm9kaWVzIG1hdGNoIHRoZSBkZWZpbmVkIHNjaGVtYVxuICAgICAgICBjb25zdCB2YWxpZGF0b3IgPSB0aGlzLmFwaS5hZGRSZXF1ZXN0VmFsaWRhdG9yKCdSZXF1ZXN0VmFsaWRhdG9yJywge1xuICAgICAgICAgICAgdmFsaWRhdGVSZXF1ZXN0Qm9keTogdHJ1ZSxcbiAgICAgICAgICAgIHZhbGlkYXRlUmVxdWVzdFBhcmFtZXRlcnM6IHRydWUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIENyZWF0ZXMgdGhlIFBPU1QgbWV0aG9kIGFuZCBpbnRlZ3JhdGVzIGl0IHdpdGggdGhlIExhbWJkYSBoYW5kbGVyXG4gICAgICAgIHRoaXMuYXBpLnJvb3QuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odGhpcy5oYW5kbGVyKSwge1xuICAgICAgICAgICAgcmVxdWVzdE1vZGVsczogeyAnYXBwbGljYXRpb24vanNvbic6IG1vZGVsIH0sXG4gICAgICAgICAgICByZXF1ZXN0VmFsaWRhdG9yOiB2YWxpZGF0b3IsXG4gICAgICAgIH0pO1xuICAgIH1cbn0iXX0=