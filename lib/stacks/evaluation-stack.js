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
exports.EvaluationStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const ec2 = __importStar(require("aws-cdk-lib/aws-ec2"));
const ecs = __importStar(require("aws-cdk-lib/aws-ecs"));
const config_manager_1 = require("../config-manager");
const ragas_evaluation_engine_1 = require("../constructs/evaluation/ragas-evaluation-engine");
const evaluation_dashboard_1 = require("../constructs/monitoring/evaluation-dashboard");
// Stack for RAG evaluation resources using ECS Fargate in Public Subnets
class EvaluationStack extends cdk.Stack {
    evalSecurityGroup;
    constructor(scope, id, props) {
        super(scope, id, props);
        const config = config_manager_1.ConfigManager.getInstance().config;
        // Configures a public VPC for evaluation tasks with direct internet access
        const vpc = new ec2.Vpc(this, 'EvalVpc', {
            maxAzs: 2,
            natGateways: 0,
            subnetConfiguration: [{
                    name: 'Public',
                    subnetType: ec2.SubnetType.PUBLIC,
                }],
            restrictDefaultSecurityGroup: false,
        });
        // Provisions an ECS cluster for hosting the evaluation engine
        const cluster = new ecs.Cluster(this, 'EvalCluster', {
            vpc,
            containerInsights: true // Essential for monitoring Fargate performance
        });
        // Zero-Trust Security Group: No inbound traffic allowed
        // This ensures that even in a public subnet, the Fargate tasks are not reachable from the internet
        this.evalSecurityGroup = new ec2.SecurityGroup(this, 'EvalTaskSecurityGroup', {
            vpc,
            allowAllOutbound: true,
            description: 'Security group for Fargate Eval Task with NO inbound access',
        });
        // Instantiates the core RAGAS evaluation engine logic
        const ragasEvaluationEngine = new ragas_evaluation_engine_1.RagasEvaluationEngine(this, 'RagasEngine', {
            ...props,
        });
        // Creates the CloudWatch Dashboard for visualizing evaluation metrics
        new evaluation_dashboard_1.EvaluationDashboard(this, 'EvaluationDashboard', {
            agentId: props.agent.agentId,
            taskDefinition: ragasEvaluationEngine.taskDefinition,
        });
    }
}
exports.EvaluationStack = EvaluationStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZhbHVhdGlvbi1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImV2YWx1YXRpb24tc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsaURBQW1DO0FBQ25DLHlEQUEyQztBQUMzQyx5REFBMkM7QUFHM0Msc0RBQWtEO0FBQ2xELDhGQUF5RjtBQUN6Rix3RkFBb0Y7QUFRcEYseUVBQXlFO0FBQ3pFLE1BQWEsZUFBZ0IsU0FBUSxHQUFHLENBQUMsS0FBSztJQUMxQixpQkFBaUIsQ0FBb0I7SUFFckQsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUEyQjtRQUNqRSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN4QixNQUFNLE1BQU0sR0FBRyw4QkFBYSxDQUFDLFdBQVcsRUFBRSxDQUFDLE1BQU0sQ0FBQztRQUVsRCwyRUFBMkU7UUFDM0UsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUU7WUFDckMsTUFBTSxFQUFFLENBQUM7WUFDVCxXQUFXLEVBQUUsQ0FBQztZQUNkLG1CQUFtQixFQUFFLENBQUM7b0JBQ2xCLElBQUksRUFBRSxRQUFRO29CQUNkLFVBQVUsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU07aUJBQ3BDLENBQUM7WUFDRiw0QkFBNEIsRUFBRSxLQUFLO1NBQ3RDLENBQUMsQ0FBQztRQUVILDhEQUE4RDtRQUM5RCxNQUFNLE9BQU8sR0FBRyxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRTtZQUNqRCxHQUFHO1lBQ0gsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLCtDQUErQztTQUMxRSxDQUFDLENBQUM7UUFJSCx3REFBd0Q7UUFDeEQsbUdBQW1HO1FBQ25HLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLEdBQUcsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLHVCQUF1QixFQUFFO1lBQzFFLEdBQUc7WUFDSCxnQkFBZ0IsRUFBRSxJQUFJO1lBQ3RCLFdBQVcsRUFBRSw2REFBNkQ7U0FDN0UsQ0FBQyxDQUFDO1FBRUgsc0RBQXNEO1FBQ3RELE1BQU0scUJBQXFCLEdBQUcsSUFBSSwrQ0FBcUIsQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFO1lBQ3pFLEdBQUcsS0FBSztTQUNYLENBQUMsQ0FBQztRQUVILHNFQUFzRTtRQUN0RSxJQUFJLDBDQUFtQixDQUFDLElBQUksRUFBRSxxQkFBcUIsRUFBRTtZQUNqRCxPQUFPLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPO1lBQzVCLGNBQWMsRUFBRSxxQkFBcUIsQ0FBQyxjQUFjO1NBQ3ZELENBQUMsQ0FBQztJQUdQLENBQUM7Q0FDSjtBQS9DRCwwQ0ErQ0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBiZWRyb2NrIH0gZnJvbSAnQGNka2xhYnMvZ2VuZXJhdGl2ZS1haS1jZGstY29uc3RydWN0cyc7XG5pbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgZWMyIGZyb20gJ2F3cy1jZGstbGliL2F3cy1lYzInO1xuaW1wb3J0ICogYXMgZWNzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1lY3MnO1xuaW1wb3J0ICogYXMgczMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXMzJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0IHsgQ29uZmlnTWFuYWdlciB9IGZyb20gJy4uL2NvbmZpZy1tYW5hZ2VyJztcbmltcG9ydCB7IFJhZ2FzRXZhbHVhdGlvbkVuZ2luZSB9IGZyb20gJy4uL2NvbnN0cnVjdHMvZXZhbHVhdGlvbi9yYWdhcy1ldmFsdWF0aW9uLWVuZ2luZSc7XG5pbXBvcnQgeyBFdmFsdWF0aW9uRGFzaGJvYXJkIH0gZnJvbSAnLi4vY29uc3RydWN0cy9tb25pdG9yaW5nL2V2YWx1YXRpb24tZGFzaGJvYXJkJztcblxuZXhwb3J0IGludGVyZmFjZSBFdmFsdWF0aW9uU3RhY2tQcm9wcyBleHRlbmRzIGNkay5TdGFja1Byb3BzIHtcbiAgICByZWFkb25seSBhZ2VudDogYmVkcm9jay5JQWdlbnQ7XG4gICAgcmVhZG9ubHkgYWdlbnRBbGlhczogYmVkcm9jay5JQWdlbnRBbGlhcztcbiAgICByZWFkb25seSByZXN1bHRzQnVja2V0OiBzMy5JQnVja2V0O1xufVxuXG4vLyBTdGFjayBmb3IgUkFHIGV2YWx1YXRpb24gcmVzb3VyY2VzIHVzaW5nIEVDUyBGYXJnYXRlIGluIFB1YmxpYyBTdWJuZXRzXG5leHBvcnQgY2xhc3MgRXZhbHVhdGlvblN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgICBwdWJsaWMgcmVhZG9ubHkgZXZhbFNlY3VyaXR5R3JvdXA6IGVjMi5TZWN1cml0eUdyb3VwO1xuXG4gICAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IEV2YWx1YXRpb25TdGFja1Byb3BzKSB7XG4gICAgICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuICAgICAgICBjb25zdCBjb25maWcgPSBDb25maWdNYW5hZ2VyLmdldEluc3RhbmNlKCkuY29uZmlnO1xuXG4gICAgICAgIC8vIENvbmZpZ3VyZXMgYSBwdWJsaWMgVlBDIGZvciBldmFsdWF0aW9uIHRhc2tzIHdpdGggZGlyZWN0IGludGVybmV0IGFjY2Vzc1xuICAgICAgICBjb25zdCB2cGMgPSBuZXcgZWMyLlZwYyh0aGlzLCAnRXZhbFZwYycsIHtcbiAgICAgICAgICAgIG1heEF6czogMixcbiAgICAgICAgICAgIG5hdEdhdGV3YXlzOiAwLFxuICAgICAgICAgICAgc3VibmV0Q29uZmlndXJhdGlvbjogW3tcbiAgICAgICAgICAgICAgICBuYW1lOiAnUHVibGljJyxcbiAgICAgICAgICAgICAgICBzdWJuZXRUeXBlOiBlYzIuU3VibmV0VHlwZS5QVUJMSUMsXG4gICAgICAgICAgICB9XSxcbiAgICAgICAgICAgIHJlc3RyaWN0RGVmYXVsdFNlY3VyaXR5R3JvdXA6IGZhbHNlLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBQcm92aXNpb25zIGFuIEVDUyBjbHVzdGVyIGZvciBob3N0aW5nIHRoZSBldmFsdWF0aW9uIGVuZ2luZVxuICAgICAgICBjb25zdCBjbHVzdGVyID0gbmV3IGVjcy5DbHVzdGVyKHRoaXMsICdFdmFsQ2x1c3RlcicsIHtcbiAgICAgICAgICAgIHZwYyxcbiAgICAgICAgICAgIGNvbnRhaW5lckluc2lnaHRzOiB0cnVlIC8vIEVzc2VudGlhbCBmb3IgbW9uaXRvcmluZyBGYXJnYXRlIHBlcmZvcm1hbmNlXG4gICAgICAgIH0pO1xuXG5cblxuICAgICAgICAvLyBaZXJvLVRydXN0IFNlY3VyaXR5IEdyb3VwOiBObyBpbmJvdW5kIHRyYWZmaWMgYWxsb3dlZFxuICAgICAgICAvLyBUaGlzIGVuc3VyZXMgdGhhdCBldmVuIGluIGEgcHVibGljIHN1Ym5ldCwgdGhlIEZhcmdhdGUgdGFza3MgYXJlIG5vdCByZWFjaGFibGUgZnJvbSB0aGUgaW50ZXJuZXRcbiAgICAgICAgdGhpcy5ldmFsU2VjdXJpdHlHcm91cCA9IG5ldyBlYzIuU2VjdXJpdHlHcm91cCh0aGlzLCAnRXZhbFRhc2tTZWN1cml0eUdyb3VwJywge1xuICAgICAgICAgICAgdnBjLFxuICAgICAgICAgICAgYWxsb3dBbGxPdXRib3VuZDogdHJ1ZSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnU2VjdXJpdHkgZ3JvdXAgZm9yIEZhcmdhdGUgRXZhbCBUYXNrIHdpdGggTk8gaW5ib3VuZCBhY2Nlc3MnLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBJbnN0YW50aWF0ZXMgdGhlIGNvcmUgUkFHQVMgZXZhbHVhdGlvbiBlbmdpbmUgbG9naWNcbiAgICAgICAgY29uc3QgcmFnYXNFdmFsdWF0aW9uRW5naW5lID0gbmV3IFJhZ2FzRXZhbHVhdGlvbkVuZ2luZSh0aGlzLCAnUmFnYXNFbmdpbmUnLCB7XG4gICAgICAgICAgICAuLi5wcm9wcyxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQ3JlYXRlcyB0aGUgQ2xvdWRXYXRjaCBEYXNoYm9hcmQgZm9yIHZpc3VhbGl6aW5nIGV2YWx1YXRpb24gbWV0cmljc1xuICAgICAgICBuZXcgRXZhbHVhdGlvbkRhc2hib2FyZCh0aGlzLCAnRXZhbHVhdGlvbkRhc2hib2FyZCcsIHtcbiAgICAgICAgICAgIGFnZW50SWQ6IHByb3BzLmFnZW50LmFnZW50SWQsXG4gICAgICAgICAgICB0YXNrRGVmaW5pdGlvbjogcmFnYXNFdmFsdWF0aW9uRW5naW5lLnRhc2tEZWZpbml0aW9uLFxuICAgICAgICB9KTtcblxuXG4gICAgfVxufSJdfQ==