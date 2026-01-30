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
exports.RagasEvaluationEngine = void 0;
const generative_ai_cdk_constructs_1 = require("@cdklabs/generative-ai-cdk-constructs");
const cdk = __importStar(require("aws-cdk-lib"));
const ecs = __importStar(require("aws-cdk-lib/aws-ecs"));
const iam = __importStar(require("aws-cdk-lib/aws-iam"));
const logs = __importStar(require("aws-cdk-lib/aws-logs"));
const constructs_1 = require("constructs");
const path = __importStar(require("path"));
const config_manager_1 = require("../../config-manager");
/**
 * RagasEvaluationEngine Construct
 * Encapsulates the compute resources and security logic for AI model auditing.
 */
// Construct that defines the ECS Fargate task for running RAGAS evaluations
class RagasEvaluationEngine extends constructs_1.Construct {
    taskDefinition;
    constructor(scope, id, props) {
        super(scope, id);
        const config = config_manager_1.ConfigManager.getInstance().config;
        // Provisions the Fargate task definition with ARM64 architecture for performance
        this.taskDefinition = new ecs.FargateTaskDefinition(this, 'RagasTaskDef', {
            memoryLimitMiB: 4096,
            cpu: 2048,
            runtimePlatform: {
                operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
                cpuArchitecture: ecs.CpuArchitecture.ARM64,
            },
        });
        const logGroup = new logs.LogGroup(this, 'RagasLogGroup', {
            logGroupName: '/aws/ecs/ragas-evaluation-engine',
            retention: config.logRetention,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });
        // Adds the evaluation container using logic from the local evaluation job directory
        this.taskDefinition.addContainer('RagasContainer', {
            image: ecs.ContainerImage.fromAsset(path.join(__dirname, '../../../src/jobs/evaluation')),
            logging: ecs.LogDrivers.awsLogs({
                logGroup: logGroup,
                streamPrefix: 'RagasEval'
            }),
            environment: {
                AGENT_ID: props.agent.agentId,
                AGENT_ALIAS_ID: props.agentAlias.aliasId,
                EVAL_DATA_BUCKET: props.resultsBucket.bucketName,
                RESULTS_BUCKET: props.resultsBucket.bucketName,
                EVAL_DATA_KEY: 'test_sets/golden_set.jsonl',
                JUDGE_MODEL_ID: config.evaluationJudgeModel,
                EMBEDDING_MODEL_ID: config.embeddingModel,
                LANGFUSE_SECRET_KEY: config.langfuse.secretKey,
                LANGFUSE_PUBLIC_KEY: config.langfuse.publicKey,
                LANGFUSE_BASE_URL: config.langfuse.baseUrl,
            },
        });
        // Configures necessary IAM roles and permissions for the evaluation task
        this.configurePermissions(props, config.evaluationJudgeModel, config.embeddingModel);
    }
    /**
     * Orchestrates all Identity and Access Management for the auditor task.
     * Keeps the constructor focused on resource declaration.
     */
    configurePermissions(props, judgeModelId, embeddingModelId) {
        const role = this.taskDefinition.taskRole;
        const stack = cdk.Stack.of(this);
        // Foundation Model Permission (Any Region)
        // This covers the routing target (e.g., us-east-2)
        const foundationModelArn = `arn:aws:bedrock:*::foundation-model/${judgeModelId}`;
        // Inference Profile Permission (Any Region)
        // This allows the initial call to be regionalized or shifted
        const inferenceProfileArn = `arn:aws:bedrock:*:${stack.account}:inference-profile/us.${judgeModelId}`;
        iam.Grant.addToPrincipal({
            grantee: role,
            actions: [
                'bedrock:InvokeModel',
                'bedrock:InvokeModelWithResponseStream',
                'bedrock:GetInferenceProfile'
            ],
            resourceArns: [foundationModelArn, inferenceProfileArn],
        });
        // Don't forget the embedding model (usually regional)
        const embeddingModel = new generative_ai_cdk_constructs_1.bedrock.BedrockFoundationModel(embeddingModelId);
        embeddingModel.grantInvoke(role);
        props.agentAlias.grantInvoke(role);
        props.resultsBucket.grantReadWrite(role);
    }
}
exports.RagasEvaluationEngine = RagasEvaluationEngine;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFnYXMtZXZhbHVhdGlvbi1lbmdpbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJyYWdhcy1ldmFsdWF0aW9uLWVuZ2luZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx3RkFBZ0U7QUFDaEUsaURBQW1DO0FBQ25DLHlEQUEyQztBQUMzQyx5REFBMkM7QUFDM0MsMkRBQTZDO0FBRTdDLDJDQUF1QztBQUN2QywyQ0FBNkI7QUFDN0IseURBQXFEO0FBUXJEOzs7R0FHRztBQUNILDRFQUE0RTtBQUM1RSxNQUFhLHFCQUFzQixTQUFRLHNCQUFTO0lBQ2hDLGNBQWMsQ0FBNEI7SUFFMUQsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFpQztRQUN2RSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRWpCLE1BQU0sTUFBTSxHQUFHLDhCQUFhLENBQUMsV0FBVyxFQUFFLENBQUMsTUFBTSxDQUFDO1FBRWxELGlGQUFpRjtRQUNqRixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksR0FBRyxDQUFDLHFCQUFxQixDQUFDLElBQUksRUFBRSxjQUFjLEVBQUU7WUFDdEUsY0FBYyxFQUFFLElBQUk7WUFDcEIsR0FBRyxFQUFFLElBQUk7WUFDVCxlQUFlLEVBQUU7Z0JBQ2IscUJBQXFCLEVBQUUsR0FBRyxDQUFDLHFCQUFxQixDQUFDLEtBQUs7Z0JBQ3RELGVBQWUsRUFBRSxHQUFHLENBQUMsZUFBZSxDQUFDLEtBQUs7YUFDN0M7U0FDSixDQUFDLENBQUM7UUFFSCxNQUFNLFFBQVEsR0FBRyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRTtZQUN0RCxZQUFZLEVBQUUsa0NBQWtDO1lBQ2hELFNBQVMsRUFBRSxNQUFNLENBQUMsWUFBWTtZQUM5QixhQUFhLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyxPQUFPO1NBQzNDLENBQUMsQ0FBQztRQUVILG9GQUFvRjtRQUNwRixJQUFJLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsRUFBRTtZQUMvQyxLQUFLLEVBQUUsR0FBRyxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsOEJBQThCLENBQUMsQ0FBQztZQUN6RixPQUFPLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUM7Z0JBQzVCLFFBQVEsRUFBRSxRQUFRO2dCQUNsQixZQUFZLEVBQUUsV0FBVzthQUM1QixDQUFDO1lBQ0YsV0FBVyxFQUFFO2dCQUNULFFBQVEsRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU87Z0JBQzdCLGNBQWMsRUFBRSxLQUFLLENBQUMsVUFBVSxDQUFDLE9BQU87Z0JBQ3hDLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxhQUFhLENBQUMsVUFBVTtnQkFDaEQsY0FBYyxFQUFFLEtBQUssQ0FBQyxhQUFhLENBQUMsVUFBVTtnQkFDOUMsYUFBYSxFQUFFLDRCQUE0QjtnQkFDM0MsY0FBYyxFQUFFLE1BQU0sQ0FBQyxvQkFBb0I7Z0JBQzNDLGtCQUFrQixFQUFFLE1BQU0sQ0FBQyxjQUFjO2dCQUN6QyxtQkFBbUIsRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLFNBQVM7Z0JBQzlDLG1CQUFtQixFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsU0FBUztnQkFDOUMsaUJBQWlCLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPO2FBQzdDO1NBQ0osQ0FBQyxDQUFDO1FBRUgseUVBQXlFO1FBQ3pFLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLG9CQUFvQixFQUFFLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUN6RixDQUFDO0lBRUQ7OztPQUdHO0lBQ0ssb0JBQW9CLENBQUMsS0FBaUMsRUFBRSxZQUFvQixFQUFFLGdCQUF3QjtRQUMxRyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQztRQUMxQyxNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVqQywyQ0FBMkM7UUFDM0MsbURBQW1EO1FBQ25ELE1BQU0sa0JBQWtCLEdBQUcsdUNBQXVDLFlBQVksRUFBRSxDQUFDO1FBRWpGLDRDQUE0QztRQUM1Qyw2REFBNkQ7UUFDN0QsTUFBTSxtQkFBbUIsR0FBRyxxQkFBcUIsS0FBSyxDQUFDLE9BQU8seUJBQXlCLFlBQVksRUFBRSxDQUFDO1FBRXRHLEdBQUcsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDO1lBQ3JCLE9BQU8sRUFBRSxJQUFJO1lBQ2IsT0FBTyxFQUFFO2dCQUNMLHFCQUFxQjtnQkFDckIsdUNBQXVDO2dCQUN2Qyw2QkFBNkI7YUFDaEM7WUFDRCxZQUFZLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRSxtQkFBbUIsQ0FBQztTQUMxRCxDQUFDLENBQUM7UUFFSCxzREFBc0Q7UUFDdEQsTUFBTSxjQUFjLEdBQUcsSUFBSSxzQ0FBTyxDQUFDLHNCQUFzQixDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDNUUsY0FBYyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVqQyxLQUFLLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuQyxLQUFLLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM3QyxDQUFDO0NBQ0o7QUFsRkQsc0RBa0ZDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYmVkcm9jayB9IGZyb20gJ0BjZGtsYWJzL2dlbmVyYXRpdmUtYWktY2RrLWNvbnN0cnVjdHMnO1xuaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCAqIGFzIGVjcyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZWNzJztcbmltcG9ydCAqIGFzIGlhbSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcbmltcG9ydCAqIGFzIGxvZ3MgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxvZ3MnO1xuaW1wb3J0ICogYXMgczMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXMzJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IENvbmZpZ01hbmFnZXIgfSBmcm9tICcuLi8uLi9jb25maWctbWFuYWdlcic7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmFnYXNFdmFsdWF0aW9uRW5naW5lUHJvcHMge1xuICAgIHJlYWRvbmx5IGFnZW50OiBiZWRyb2NrLklBZ2VudDtcbiAgICByZWFkb25seSBhZ2VudEFsaWFzOiBiZWRyb2NrLklBZ2VudEFsaWFzO1xuICAgIHJlYWRvbmx5IHJlc3VsdHNCdWNrZXQ6IHMzLklCdWNrZXQ7XG59XG5cbi8qKlxuICogUmFnYXNFdmFsdWF0aW9uRW5naW5lIENvbnN0cnVjdFxuICogRW5jYXBzdWxhdGVzIHRoZSBjb21wdXRlIHJlc291cmNlcyBhbmQgc2VjdXJpdHkgbG9naWMgZm9yIEFJIG1vZGVsIGF1ZGl0aW5nLlxuICovXG4vLyBDb25zdHJ1Y3QgdGhhdCBkZWZpbmVzIHRoZSBFQ1MgRmFyZ2F0ZSB0YXNrIGZvciBydW5uaW5nIFJBR0FTIGV2YWx1YXRpb25zXG5leHBvcnQgY2xhc3MgUmFnYXNFdmFsdWF0aW9uRW5naW5lIGV4dGVuZHMgQ29uc3RydWN0IHtcbiAgICBwdWJsaWMgcmVhZG9ubHkgdGFza0RlZmluaXRpb246IGVjcy5GYXJnYXRlVGFza0RlZmluaXRpb247XG5cbiAgICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogUmFnYXNFdmFsdWF0aW9uRW5naW5lUHJvcHMpIHtcbiAgICAgICAgc3VwZXIoc2NvcGUsIGlkKTtcblxuICAgICAgICBjb25zdCBjb25maWcgPSBDb25maWdNYW5hZ2VyLmdldEluc3RhbmNlKCkuY29uZmlnO1xuXG4gICAgICAgIC8vIFByb3Zpc2lvbnMgdGhlIEZhcmdhdGUgdGFzayBkZWZpbml0aW9uIHdpdGggQVJNNjQgYXJjaGl0ZWN0dXJlIGZvciBwZXJmb3JtYW5jZVxuICAgICAgICB0aGlzLnRhc2tEZWZpbml0aW9uID0gbmV3IGVjcy5GYXJnYXRlVGFza0RlZmluaXRpb24odGhpcywgJ1JhZ2FzVGFza0RlZicsIHtcbiAgICAgICAgICAgIG1lbW9yeUxpbWl0TWlCOiA0MDk2LFxuICAgICAgICAgICAgY3B1OiAyMDQ4LFxuICAgICAgICAgICAgcnVudGltZVBsYXRmb3JtOiB7XG4gICAgICAgICAgICAgICAgb3BlcmF0aW5nU3lzdGVtRmFtaWx5OiBlY3MuT3BlcmF0aW5nU3lzdGVtRmFtaWx5LkxJTlVYLFxuICAgICAgICAgICAgICAgIGNwdUFyY2hpdGVjdHVyZTogZWNzLkNwdUFyY2hpdGVjdHVyZS5BUk02NCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGxvZ0dyb3VwID0gbmV3IGxvZ3MuTG9nR3JvdXAodGhpcywgJ1JhZ2FzTG9nR3JvdXAnLCB7XG4gICAgICAgICAgICBsb2dHcm91cE5hbWU6ICcvYXdzL2Vjcy9yYWdhcy1ldmFsdWF0aW9uLWVuZ2luZScsXG4gICAgICAgICAgICByZXRlbnRpb246IGNvbmZpZy5sb2dSZXRlbnRpb24sXG4gICAgICAgICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBBZGRzIHRoZSBldmFsdWF0aW9uIGNvbnRhaW5lciB1c2luZyBsb2dpYyBmcm9tIHRoZSBsb2NhbCBldmFsdWF0aW9uIGpvYiBkaXJlY3RvcnlcbiAgICAgICAgdGhpcy50YXNrRGVmaW5pdGlvbi5hZGRDb250YWluZXIoJ1JhZ2FzQ29udGFpbmVyJywge1xuICAgICAgICAgICAgaW1hZ2U6IGVjcy5Db250YWluZXJJbWFnZS5mcm9tQXNzZXQocGF0aC5qb2luKF9fZGlybmFtZSwgJy4uLy4uLy4uL3NyYy9qb2JzL2V2YWx1YXRpb24nKSksXG4gICAgICAgICAgICBsb2dnaW5nOiBlY3MuTG9nRHJpdmVycy5hd3NMb2dzKHtcbiAgICAgICAgICAgICAgICBsb2dHcm91cDogbG9nR3JvdXAsXG4gICAgICAgICAgICAgICAgc3RyZWFtUHJlZml4OiAnUmFnYXNFdmFsJ1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICAgICAgICAgIEFHRU5UX0lEOiBwcm9wcy5hZ2VudC5hZ2VudElkLFxuICAgICAgICAgICAgICAgIEFHRU5UX0FMSUFTX0lEOiBwcm9wcy5hZ2VudEFsaWFzLmFsaWFzSWQsXG4gICAgICAgICAgICAgICAgRVZBTF9EQVRBX0JVQ0tFVDogcHJvcHMucmVzdWx0c0J1Y2tldC5idWNrZXROYW1lLFxuICAgICAgICAgICAgICAgIFJFU1VMVFNfQlVDS0VUOiBwcm9wcy5yZXN1bHRzQnVja2V0LmJ1Y2tldE5hbWUsXG4gICAgICAgICAgICAgICAgRVZBTF9EQVRBX0tFWTogJ3Rlc3Rfc2V0cy9nb2xkZW5fc2V0Lmpzb25sJyxcbiAgICAgICAgICAgICAgICBKVURHRV9NT0RFTF9JRDogY29uZmlnLmV2YWx1YXRpb25KdWRnZU1vZGVsLFxuICAgICAgICAgICAgICAgIEVNQkVERElOR19NT0RFTF9JRDogY29uZmlnLmVtYmVkZGluZ01vZGVsLFxuICAgICAgICAgICAgICAgIExBTkdGVVNFX1NFQ1JFVF9LRVk6IGNvbmZpZy5sYW5nZnVzZS5zZWNyZXRLZXksXG4gICAgICAgICAgICAgICAgTEFOR0ZVU0VfUFVCTElDX0tFWTogY29uZmlnLmxhbmdmdXNlLnB1YmxpY0tleSxcbiAgICAgICAgICAgICAgICBMQU5HRlVTRV9CQVNFX1VSTDogY29uZmlnLmxhbmdmdXNlLmJhc2VVcmwsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBDb25maWd1cmVzIG5lY2Vzc2FyeSBJQU0gcm9sZXMgYW5kIHBlcm1pc3Npb25zIGZvciB0aGUgZXZhbHVhdGlvbiB0YXNrXG4gICAgICAgIHRoaXMuY29uZmlndXJlUGVybWlzc2lvbnMocHJvcHMsIGNvbmZpZy5ldmFsdWF0aW9uSnVkZ2VNb2RlbCwgY29uZmlnLmVtYmVkZGluZ01vZGVsKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBPcmNoZXN0cmF0ZXMgYWxsIElkZW50aXR5IGFuZCBBY2Nlc3MgTWFuYWdlbWVudCBmb3IgdGhlIGF1ZGl0b3IgdGFzay5cbiAgICAgKiBLZWVwcyB0aGUgY29uc3RydWN0b3IgZm9jdXNlZCBvbiByZXNvdXJjZSBkZWNsYXJhdGlvbi5cbiAgICAgKi9cbiAgICBwcml2YXRlIGNvbmZpZ3VyZVBlcm1pc3Npb25zKHByb3BzOiBSYWdhc0V2YWx1YXRpb25FbmdpbmVQcm9wcywganVkZ2VNb2RlbElkOiBzdHJpbmcsIGVtYmVkZGluZ01vZGVsSWQ6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBjb25zdCByb2xlID0gdGhpcy50YXNrRGVmaW5pdGlvbi50YXNrUm9sZTtcbiAgICAgICAgY29uc3Qgc3RhY2sgPSBjZGsuU3RhY2sub2YodGhpcyk7XG5cbiAgICAgICAgLy8gRm91bmRhdGlvbiBNb2RlbCBQZXJtaXNzaW9uIChBbnkgUmVnaW9uKVxuICAgICAgICAvLyBUaGlzIGNvdmVycyB0aGUgcm91dGluZyB0YXJnZXQgKGUuZy4sIHVzLWVhc3QtMilcbiAgICAgICAgY29uc3QgZm91bmRhdGlvbk1vZGVsQXJuID0gYGFybjphd3M6YmVkcm9jazoqOjpmb3VuZGF0aW9uLW1vZGVsLyR7anVkZ2VNb2RlbElkfWA7XG5cbiAgICAgICAgLy8gSW5mZXJlbmNlIFByb2ZpbGUgUGVybWlzc2lvbiAoQW55IFJlZ2lvbilcbiAgICAgICAgLy8gVGhpcyBhbGxvd3MgdGhlIGluaXRpYWwgY2FsbCB0byBiZSByZWdpb25hbGl6ZWQgb3Igc2hpZnRlZFxuICAgICAgICBjb25zdCBpbmZlcmVuY2VQcm9maWxlQXJuID0gYGFybjphd3M6YmVkcm9jazoqOiR7c3RhY2suYWNjb3VudH06aW5mZXJlbmNlLXByb2ZpbGUvdXMuJHtqdWRnZU1vZGVsSWR9YDtcblxuICAgICAgICBpYW0uR3JhbnQuYWRkVG9QcmluY2lwYWwoe1xuICAgICAgICAgICAgZ3JhbnRlZTogcm9sZSxcbiAgICAgICAgICAgIGFjdGlvbnM6IFtcbiAgICAgICAgICAgICAgICAnYmVkcm9jazpJbnZva2VNb2RlbCcsXG4gICAgICAgICAgICAgICAgJ2JlZHJvY2s6SW52b2tlTW9kZWxXaXRoUmVzcG9uc2VTdHJlYW0nLFxuICAgICAgICAgICAgICAgICdiZWRyb2NrOkdldEluZmVyZW5jZVByb2ZpbGUnXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgcmVzb3VyY2VBcm5zOiBbZm91bmRhdGlvbk1vZGVsQXJuLCBpbmZlcmVuY2VQcm9maWxlQXJuXSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gRG9uJ3QgZm9yZ2V0IHRoZSBlbWJlZGRpbmcgbW9kZWwgKHVzdWFsbHkgcmVnaW9uYWwpXG4gICAgICAgIGNvbnN0IGVtYmVkZGluZ01vZGVsID0gbmV3IGJlZHJvY2suQmVkcm9ja0ZvdW5kYXRpb25Nb2RlbChlbWJlZGRpbmdNb2RlbElkKTtcbiAgICAgICAgZW1iZWRkaW5nTW9kZWwuZ3JhbnRJbnZva2Uocm9sZSk7XG5cbiAgICAgICAgcHJvcHMuYWdlbnRBbGlhcy5ncmFudEludm9rZShyb2xlKTtcbiAgICAgICAgcHJvcHMucmVzdWx0c0J1Y2tldC5ncmFudFJlYWRXcml0ZShyb2xlKTtcbiAgICB9XG59Il19