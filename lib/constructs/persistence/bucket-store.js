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
exports.BucketStore = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const s3 = __importStar(require("aws-cdk-lib/aws-s3"));
const constructs_1 = require("constructs");
const config_manager_1 = require("../../config-manager");
// Construct that centralizes the creation of all S3 buckets for the application
class BucketStore extends constructs_1.Construct {
    knowledgeBaseBucket;
    logsBucket;
    evaluationsResultsBucket;
    constructor(scope, id) {
        super(scope, id);
        const config = config_manager_1.ConfigManager.getInstance().config;
        const account = cdk.Stack.of(this).account;
        const appName = config.appName.toLowerCase();
        // Provisions a dedicated S3 bucket for server access logs (must be created first)
        this.logsBucket = new s3.Bucket(this, 'LogsBucket', {
            bucketName: `${appName}-logs-${account}`,
            encryption: s3.BucketEncryption.S3_MANAGED,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            enforceSSL: true,
            removalPolicy: config.removalPolicy,
            autoDeleteObjects: config.stage !== config_manager_1.Stage.PROD,
        });
        // Provisions the encrypted S3 bucket for storing knowledge base documents
        this.knowledgeBaseBucket = new s3.Bucket(this, 'knowledgeBaseBucket', {
            bucketName: `${appName}-knowledge-base-${account}`,
            encryption: s3.BucketEncryption.S3_MANAGED,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            enforceSSL: true,
            removalPolicy: config.removalPolicy,
            autoDeleteObjects: config.stage !== config_manager_1.Stage.PROD,
            versioned: true,
            serverAccessLogsBucket: this.logsBucket,
            serverAccessLogsPrefix: 'knowledge-base-bucket/',
        });
        // Provisions the S3 bucket for storing RAG evaluation results and metrics
        this.evaluationsResultsBucket = new s3.Bucket(this, 'EvaluationsBucket', {
            bucketName: `${appName}-evaluations-${account}`,
            encryption: s3.BucketEncryption.S3_MANAGED,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            enforceSSL: true,
            removalPolicy: config.removalPolicy,
            autoDeleteObjects: config.stage !== config_manager_1.Stage.PROD,
            serverAccessLogsBucket: this.logsBucket,
            serverAccessLogsPrefix: 'evaluations-bucket/',
        });
    }
}
exports.BucketStore = BucketStore;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVja2V0LXN0b3JlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYnVja2V0LXN0b3JlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlEQUFtQztBQUNuQyx1REFBeUM7QUFDekMsMkNBQXVDO0FBQ3ZDLHlEQUE0RDtBQUU1RCxnRkFBZ0Y7QUFDaEYsTUFBYSxXQUFZLFNBQVEsc0JBQVM7SUFDdEIsbUJBQW1CLENBQWE7SUFDaEMsVUFBVSxDQUFhO0lBQ3ZCLHdCQUF3QixDQUFhO0lBRXJELFlBQVksS0FBZ0IsRUFBRSxFQUFVO1FBQ3BDLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDakIsTUFBTSxNQUFNLEdBQUcsOEJBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxNQUFNLENBQUM7UUFDbEQsTUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDO1FBQzNDLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUM7UUFFN0Msa0ZBQWtGO1FBQ2xGLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxZQUFZLEVBQUU7WUFDaEQsVUFBVSxFQUFFLEdBQUcsT0FBTyxTQUFTLE9BQU8sRUFBRTtZQUN4QyxVQUFVLEVBQUUsRUFBRSxDQUFDLGdCQUFnQixDQUFDLFVBQVU7WUFDMUMsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLGlCQUFpQixDQUFDLFNBQVM7WUFDakQsVUFBVSxFQUFFLElBQUk7WUFDaEIsYUFBYSxFQUFFLE1BQU0sQ0FBQyxhQUFhO1lBQ25DLGlCQUFpQixFQUFFLE1BQU0sQ0FBQyxLQUFLLEtBQUssc0JBQUssQ0FBQyxJQUFJO1NBQ2pELENBQUMsQ0FBQztRQUVILDBFQUEwRTtRQUMxRSxJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxxQkFBcUIsRUFBRTtZQUNsRSxVQUFVLEVBQUUsR0FBRyxPQUFPLG1CQUFtQixPQUFPLEVBQUU7WUFDbEQsVUFBVSxFQUFFLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVO1lBQzFDLGlCQUFpQixFQUFFLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTO1lBQ2pELFVBQVUsRUFBRSxJQUFJO1lBQ2hCLGFBQWEsRUFBRSxNQUFNLENBQUMsYUFBYTtZQUNuQyxpQkFBaUIsRUFBRSxNQUFNLENBQUMsS0FBSyxLQUFLLHNCQUFLLENBQUMsSUFBSTtZQUM5QyxTQUFTLEVBQUUsSUFBSTtZQUNmLHNCQUFzQixFQUFFLElBQUksQ0FBQyxVQUFVO1lBQ3ZDLHNCQUFzQixFQUFFLHdCQUF3QjtTQUNuRCxDQUFDLENBQUM7UUFFSCwwRUFBMEU7UUFDMUUsSUFBSSxDQUFDLHdCQUF3QixHQUFHLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLEVBQUU7WUFDckUsVUFBVSxFQUFFLEdBQUcsT0FBTyxnQkFBZ0IsT0FBTyxFQUFFO1lBQy9DLFVBQVUsRUFBRSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsVUFBVTtZQUMxQyxpQkFBaUIsRUFBRSxFQUFFLENBQUMsaUJBQWlCLENBQUMsU0FBUztZQUNqRCxVQUFVLEVBQUUsSUFBSTtZQUNoQixhQUFhLEVBQUUsTUFBTSxDQUFDLGFBQWE7WUFDbkMsaUJBQWlCLEVBQUUsTUFBTSxDQUFDLEtBQUssS0FBSyxzQkFBSyxDQUFDLElBQUk7WUFDOUMsc0JBQXNCLEVBQUUsSUFBSSxDQUFDLFVBQVU7WUFDdkMsc0JBQXNCLEVBQUUscUJBQXFCO1NBQ2hELENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQTlDRCxrQ0E4Q0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgczMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXMzJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0IHsgQ29uZmlnTWFuYWdlciwgU3RhZ2UgfSBmcm9tICcuLi8uLi9jb25maWctbWFuYWdlcic7XG5cbi8vIENvbnN0cnVjdCB0aGF0IGNlbnRyYWxpemVzIHRoZSBjcmVhdGlvbiBvZiBhbGwgUzMgYnVja2V0cyBmb3IgdGhlIGFwcGxpY2F0aW9uXG5leHBvcnQgY2xhc3MgQnVja2V0U3RvcmUgZXh0ZW5kcyBDb25zdHJ1Y3Qge1xuICAgIHB1YmxpYyByZWFkb25seSBrbm93bGVkZ2VCYXNlQnVja2V0OiBzMy5JQnVja2V0O1xuICAgIHB1YmxpYyByZWFkb25seSBsb2dzQnVja2V0OiBzMy5JQnVja2V0O1xuICAgIHB1YmxpYyByZWFkb25seSBldmFsdWF0aW9uc1Jlc3VsdHNCdWNrZXQ6IHMzLklCdWNrZXQ7XG5cbiAgICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nKSB7XG4gICAgICAgIHN1cGVyKHNjb3BlLCBpZCk7XG4gICAgICAgIGNvbnN0IGNvbmZpZyA9IENvbmZpZ01hbmFnZXIuZ2V0SW5zdGFuY2UoKS5jb25maWc7XG4gICAgICAgIGNvbnN0IGFjY291bnQgPSBjZGsuU3RhY2sub2YodGhpcykuYWNjb3VudDtcbiAgICAgICAgY29uc3QgYXBwTmFtZSA9IGNvbmZpZy5hcHBOYW1lLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgICAgLy8gUHJvdmlzaW9ucyBhIGRlZGljYXRlZCBTMyBidWNrZXQgZm9yIHNlcnZlciBhY2Nlc3MgbG9ncyAobXVzdCBiZSBjcmVhdGVkIGZpcnN0KVxuICAgICAgICB0aGlzLmxvZ3NCdWNrZXQgPSBuZXcgczMuQnVja2V0KHRoaXMsICdMb2dzQnVja2V0Jywge1xuICAgICAgICAgICAgYnVja2V0TmFtZTogYCR7YXBwTmFtZX0tbG9ncy0ke2FjY291bnR9YCxcbiAgICAgICAgICAgIGVuY3J5cHRpb246IHMzLkJ1Y2tldEVuY3J5cHRpb24uUzNfTUFOQUdFRCxcbiAgICAgICAgICAgIGJsb2NrUHVibGljQWNjZXNzOiBzMy5CbG9ja1B1YmxpY0FjY2Vzcy5CTE9DS19BTEwsXG4gICAgICAgICAgICBlbmZvcmNlU1NMOiB0cnVlLFxuICAgICAgICAgICAgcmVtb3ZhbFBvbGljeTogY29uZmlnLnJlbW92YWxQb2xpY3ksXG4gICAgICAgICAgICBhdXRvRGVsZXRlT2JqZWN0czogY29uZmlnLnN0YWdlICE9PSBTdGFnZS5QUk9ELFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBQcm92aXNpb25zIHRoZSBlbmNyeXB0ZWQgUzMgYnVja2V0IGZvciBzdG9yaW5nIGtub3dsZWRnZSBiYXNlIGRvY3VtZW50c1xuICAgICAgICB0aGlzLmtub3dsZWRnZUJhc2VCdWNrZXQgPSBuZXcgczMuQnVja2V0KHRoaXMsICdrbm93bGVkZ2VCYXNlQnVja2V0Jywge1xuICAgICAgICAgICAgYnVja2V0TmFtZTogYCR7YXBwTmFtZX0ta25vd2xlZGdlLWJhc2UtJHthY2NvdW50fWAsXG4gICAgICAgICAgICBlbmNyeXB0aW9uOiBzMy5CdWNrZXRFbmNyeXB0aW9uLlMzX01BTkFHRUQsXG4gICAgICAgICAgICBibG9ja1B1YmxpY0FjY2VzczogczMuQmxvY2tQdWJsaWNBY2Nlc3MuQkxPQ0tfQUxMLFxuICAgICAgICAgICAgZW5mb3JjZVNTTDogdHJ1ZSxcbiAgICAgICAgICAgIHJlbW92YWxQb2xpY3k6IGNvbmZpZy5yZW1vdmFsUG9saWN5LFxuICAgICAgICAgICAgYXV0b0RlbGV0ZU9iamVjdHM6IGNvbmZpZy5zdGFnZSAhPT0gU3RhZ2UuUFJPRCxcbiAgICAgICAgICAgIHZlcnNpb25lZDogdHJ1ZSxcbiAgICAgICAgICAgIHNlcnZlckFjY2Vzc0xvZ3NCdWNrZXQ6IHRoaXMubG9nc0J1Y2tldCxcbiAgICAgICAgICAgIHNlcnZlckFjY2Vzc0xvZ3NQcmVmaXg6ICdrbm93bGVkZ2UtYmFzZS1idWNrZXQvJyxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gUHJvdmlzaW9ucyB0aGUgUzMgYnVja2V0IGZvciBzdG9yaW5nIFJBRyBldmFsdWF0aW9uIHJlc3VsdHMgYW5kIG1ldHJpY3NcbiAgICAgICAgdGhpcy5ldmFsdWF0aW9uc1Jlc3VsdHNCdWNrZXQgPSBuZXcgczMuQnVja2V0KHRoaXMsICdFdmFsdWF0aW9uc0J1Y2tldCcsIHtcbiAgICAgICAgICAgIGJ1Y2tldE5hbWU6IGAke2FwcE5hbWV9LWV2YWx1YXRpb25zLSR7YWNjb3VudH1gLFxuICAgICAgICAgICAgZW5jcnlwdGlvbjogczMuQnVja2V0RW5jcnlwdGlvbi5TM19NQU5BR0VELFxuICAgICAgICAgICAgYmxvY2tQdWJsaWNBY2Nlc3M6IHMzLkJsb2NrUHVibGljQWNjZXNzLkJMT0NLX0FMTCxcbiAgICAgICAgICAgIGVuZm9yY2VTU0w6IHRydWUsXG4gICAgICAgICAgICByZW1vdmFsUG9saWN5OiBjb25maWcucmVtb3ZhbFBvbGljeSxcbiAgICAgICAgICAgIGF1dG9EZWxldGVPYmplY3RzOiBjb25maWcuc3RhZ2UgIT09IFN0YWdlLlBST0QsXG4gICAgICAgICAgICBzZXJ2ZXJBY2Nlc3NMb2dzQnVja2V0OiB0aGlzLmxvZ3NCdWNrZXQsXG4gICAgICAgICAgICBzZXJ2ZXJBY2Nlc3NMb2dzUHJlZml4OiAnZXZhbHVhdGlvbnMtYnVja2V0LycsXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiJdfQ==