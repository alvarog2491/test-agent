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
exports.KnowledgeBaseConstruct = void 0;
const generative_ai_cdk_constructs_1 = require("@cdklabs/generative-ai-cdk-constructs");
const cdk = __importStar(require("aws-cdk-lib"));
const aws_bedrock_1 = require("aws-cdk-lib/aws-bedrock");
const lambda = __importStar(require("aws-cdk-lib/aws-lambda"));
const s3 = __importStar(require("aws-cdk-lib/aws-s3"));
const s3n = __importStar(require("aws-cdk-lib/aws-s3-notifications"));
const constructs_1 = require("constructs");
const path = __importStar(require("path"));
const config_manager_1 = require("../../config-manager");
const constants_1 = require("../../constants");
// Construct for managing the Bedrock Knowledge Base and its data source
class KnowledgeBaseConstruct extends constructs_1.Construct {
    knowledgeBase;
    constructor(scope, id, props) {
        super(scope, id);
        const config = config_manager_1.ConfigManager.getInstance().config;
        // Configures Pinecone as the vector storage for document embeddings
        const pineconecds = new generative_ai_cdk_constructs_1.pinecone.PineconeVectorStore({
            connectionString: config.vectorStore.connectionString,
            credentialsSecretArn: config.vectorStore.credentialsSecretArn,
            textField: 'text',
            metadataField: 'metadata',
        });
        // Defines the embedding model identifier from application configuration
        const modelIdentifier = new aws_bedrock_1.FoundationModelIdentifier(config.embeddingModel);
        // References the Bedrock foundation model used for generating embeddings
        const embeddingModel = generative_ai_cdk_constructs_1.bedrock.BedrockFoundationModel.fromCdkFoundationModelId(modelIdentifier, {
            supportsKnowledgeBase: true,
        });
        // Provisions the vector knowledge base combining Pinecone and Bedrock embeddings
        this.knowledgeBase = new generative_ai_cdk_constructs_1.bedrock.VectorKnowledgeBase(this, 'KnowledgeBase', {
            vectorStore: pineconecds,
            embeddingsModel: embeddingModel,
            instruction: 'Use this knowledge base to answer questions about the documents.',
        });
        // Connects the S3 bucket as a data source with semantic chunking enabled
        const dataSource = this.knowledgeBase.addS3DataSource({
            bucket: props.bucket,
            chunkingStrategy: generative_ai_cdk_constructs_1.bedrock.ChunkingStrategy.SEMANTIC,
        });
        this.setupAutoSync(props.bucket, dataSource.dataSourceId);
    }
    /**
     * Sets up the automatic synchronization mechanism by creating a Lambda function
     * triggered by S3 events (upload/delete) to start Knowledge Base ingestion jobs.
     *
     * @param bucket The S3 bucket acting as the data source
     * @param dataSourceId The ID of the Bedrock Knowledge Base data source
     */
    setupAutoSync(bucket, dataSourceId) {
        const config = config_manager_1.ConfigManager.getInstance().config;
        // Defines the Lambda function to coordinate manual syncs when files change
        const syncLambda = new lambda.Function(this, 'SyncLambda', {
            functionName: `${config.appName.toLowerCase()}-kb-sync`,
            runtime: constants_1.LAMBDA_PYTHON_RUNTIME,
            handler: 'index.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../../../src/lambda/kb-sync')),
            timeout: cdk.Duration.minutes(5),
            environment: {
                KNOWLEDGE_BASE_ID: this.knowledgeBase.knowledgeBaseId,
                DATA_SOURCE_ID: dataSourceId,
            },
        });
        // Grants permission to start ingestion jobs on the Knowledge Base
        this.knowledgeBase.grant(syncLambda, 'bedrock:StartIngestionJob', 'bedrock:AssociateThirdPartyKnowledgeBase');
        // Configures S3 event notifications to trigger the Sync Lambda
        bucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3n.LambdaDestination(syncLambda));
        bucket.addEventNotification(s3.EventType.OBJECT_REMOVED, new s3n.LambdaDestination(syncLambda));
    }
}
exports.KnowledgeBaseConstruct = KnowledgeBaseConstruct;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia25vd2xlZGdlLWJhc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJrbm93bGVkZ2UtYmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx3RkFBMEU7QUFDMUUsaURBQW1DO0FBQ25DLHlEQUFvRTtBQUNwRSwrREFBaUQ7QUFDakQsdURBQXlDO0FBQ3pDLHNFQUF3RDtBQUN4RCwyQ0FBdUM7QUFDdkMsMkNBQTZCO0FBQzdCLHlEQUFxRDtBQUNyRCwrQ0FBd0Q7QUFNeEQsd0VBQXdFO0FBQ3hFLE1BQWEsc0JBQXVCLFNBQVEsc0JBQVM7SUFDakMsYUFBYSxDQUE4QjtJQUUzRCxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQWtDO1FBQ3hFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDakIsTUFBTSxNQUFNLEdBQUcsOEJBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxNQUFNLENBQUM7UUFFbEQsb0VBQW9FO1FBQ3BFLE1BQU0sV0FBVyxHQUFHLElBQUksdUNBQVEsQ0FBQyxtQkFBbUIsQ0FBQztZQUNqRCxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsV0FBVyxDQUFDLGdCQUFnQjtZQUNyRCxvQkFBb0IsRUFBRSxNQUFNLENBQUMsV0FBVyxDQUFDLG9CQUFvQjtZQUM3RCxTQUFTLEVBQUUsTUFBTTtZQUNqQixhQUFhLEVBQUUsVUFBVTtTQUM1QixDQUFDLENBQUM7UUFFSCx3RUFBd0U7UUFDeEUsTUFBTSxlQUFlLEdBQUcsSUFBSSx1Q0FBeUIsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDN0UseUVBQXlFO1FBQ3pFLE1BQU0sY0FBYyxHQUFHLHNDQUFPLENBQUMsc0JBQXNCLENBQUMsd0JBQXdCLENBQUMsZUFBZSxFQUFFO1lBQzVGLHFCQUFxQixFQUFFLElBQUk7U0FDOUIsQ0FBQyxDQUFDO1FBRUgsaUZBQWlGO1FBQ2pGLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxzQ0FBTyxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxlQUFlLEVBQUU7WUFDeEUsV0FBVyxFQUFFLFdBQVc7WUFDeEIsZUFBZSxFQUFFLGNBQWM7WUFDL0IsV0FBVyxFQUFFLGtFQUFrRTtTQUVsRixDQUFDLENBQUM7UUFDSCx5RUFBeUU7UUFDekUsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUM7WUFDbEQsTUFBTSxFQUFFLEtBQUssQ0FBQyxNQUFNO1lBQ3BCLGdCQUFnQixFQUFFLHNDQUFPLENBQUMsZ0JBQWdCLENBQUMsUUFBUTtTQUN0RCxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzlELENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSyxhQUFhLENBQUMsTUFBa0IsRUFBRSxZQUFvQjtRQUMxRCxNQUFNLE1BQU0sR0FBRyw4QkFBYSxDQUFDLFdBQVcsRUFBRSxDQUFDLE1BQU0sQ0FBQztRQUVsRCwyRUFBMkU7UUFDM0UsTUFBTSxVQUFVLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxZQUFZLEVBQUU7WUFDdkQsWUFBWSxFQUFFLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsVUFBVTtZQUN2RCxPQUFPLEVBQUUsaUNBQXFCO1lBQzlCLE9BQU8sRUFBRSxlQUFlO1lBQ3hCLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSw2QkFBNkIsQ0FBQyxDQUFDO1lBQ2hGLE9BQU8sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDaEMsV0FBVyxFQUFFO2dCQUNULGlCQUFpQixFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZTtnQkFDckQsY0FBYyxFQUFFLFlBQVk7YUFDL0I7U0FDSixDQUFDLENBQUM7UUFFSCxrRUFBa0U7UUFDbEUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLDJCQUEyQixFQUFFLDBDQUEwQyxDQUFDLENBQUM7UUFFOUcsK0RBQStEO1FBQy9ELE1BQU0sQ0FBQyxvQkFBb0IsQ0FDdkIsRUFBRSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEVBQzNCLElBQUksR0FBRyxDQUFDLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxDQUN4QyxDQUFDO1FBQ0YsTUFBTSxDQUFDLG9CQUFvQixDQUN2QixFQUFFLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFDM0IsSUFBSSxHQUFHLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQ3hDLENBQUM7SUFDTixDQUFDO0NBQ0o7QUExRUQsd0RBMEVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYmVkcm9jaywgcGluZWNvbmUgfSBmcm9tICdAY2RrbGFicy9nZW5lcmF0aXZlLWFpLWNkay1jb25zdHJ1Y3RzJztcbmltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBGb3VuZGF0aW9uTW9kZWxJZGVudGlmaWVyIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWJlZHJvY2snO1xuaW1wb3J0ICogYXMgbGFtYmRhIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEnO1xuaW1wb3J0ICogYXMgczMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXMzJztcbmltcG9ydCAqIGFzIHMzbiBmcm9tICdhd3MtY2RrLWxpYi9hd3MtczMtbm90aWZpY2F0aW9ucyc7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBDb25maWdNYW5hZ2VyIH0gZnJvbSAnLi4vLi4vY29uZmlnLW1hbmFnZXInO1xuaW1wb3J0IHsgTEFNQkRBX1BZVEhPTl9SVU5USU1FIH0gZnJvbSAnLi4vLi4vY29uc3RhbnRzJztcblxuZXhwb3J0IGludGVyZmFjZSBLbm93bGVkZ2VCYXNlQ29uc3RydWN0UHJvcHMge1xuICAgIHJlYWRvbmx5IGJ1Y2tldDogczMuSUJ1Y2tldDtcbn1cblxuLy8gQ29uc3RydWN0IGZvciBtYW5hZ2luZyB0aGUgQmVkcm9jayBLbm93bGVkZ2UgQmFzZSBhbmQgaXRzIGRhdGEgc291cmNlXG5leHBvcnQgY2xhc3MgS25vd2xlZGdlQmFzZUNvbnN0cnVjdCBleHRlbmRzIENvbnN0cnVjdCB7XG4gICAgcHVibGljIHJlYWRvbmx5IGtub3dsZWRnZUJhc2U6IGJlZHJvY2suVmVjdG9yS25vd2xlZGdlQmFzZTtcblxuICAgIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBLbm93bGVkZ2VCYXNlQ29uc3RydWN0UHJvcHMpIHtcbiAgICAgICAgc3VwZXIoc2NvcGUsIGlkKTtcbiAgICAgICAgY29uc3QgY29uZmlnID0gQ29uZmlnTWFuYWdlci5nZXRJbnN0YW5jZSgpLmNvbmZpZztcblxuICAgICAgICAvLyBDb25maWd1cmVzIFBpbmVjb25lIGFzIHRoZSB2ZWN0b3Igc3RvcmFnZSBmb3IgZG9jdW1lbnQgZW1iZWRkaW5nc1xuICAgICAgICBjb25zdCBwaW5lY29uZWNkcyA9IG5ldyBwaW5lY29uZS5QaW5lY29uZVZlY3RvclN0b3JlKHtcbiAgICAgICAgICAgIGNvbm5lY3Rpb25TdHJpbmc6IGNvbmZpZy52ZWN0b3JTdG9yZS5jb25uZWN0aW9uU3RyaW5nLFxuICAgICAgICAgICAgY3JlZGVudGlhbHNTZWNyZXRBcm46IGNvbmZpZy52ZWN0b3JTdG9yZS5jcmVkZW50aWFsc1NlY3JldEFybixcbiAgICAgICAgICAgIHRleHRGaWVsZDogJ3RleHQnLFxuICAgICAgICAgICAgbWV0YWRhdGFGaWVsZDogJ21ldGFkYXRhJyxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gRGVmaW5lcyB0aGUgZW1iZWRkaW5nIG1vZGVsIGlkZW50aWZpZXIgZnJvbSBhcHBsaWNhdGlvbiBjb25maWd1cmF0aW9uXG4gICAgICAgIGNvbnN0IG1vZGVsSWRlbnRpZmllciA9IG5ldyBGb3VuZGF0aW9uTW9kZWxJZGVudGlmaWVyKGNvbmZpZy5lbWJlZGRpbmdNb2RlbCk7XG4gICAgICAgIC8vIFJlZmVyZW5jZXMgdGhlIEJlZHJvY2sgZm91bmRhdGlvbiBtb2RlbCB1c2VkIGZvciBnZW5lcmF0aW5nIGVtYmVkZGluZ3NcbiAgICAgICAgY29uc3QgZW1iZWRkaW5nTW9kZWwgPSBiZWRyb2NrLkJlZHJvY2tGb3VuZGF0aW9uTW9kZWwuZnJvbUNka0ZvdW5kYXRpb25Nb2RlbElkKG1vZGVsSWRlbnRpZmllciwge1xuICAgICAgICAgICAgc3VwcG9ydHNLbm93bGVkZ2VCYXNlOiB0cnVlLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBQcm92aXNpb25zIHRoZSB2ZWN0b3Iga25vd2xlZGdlIGJhc2UgY29tYmluaW5nIFBpbmVjb25lIGFuZCBCZWRyb2NrIGVtYmVkZGluZ3NcbiAgICAgICAgdGhpcy5rbm93bGVkZ2VCYXNlID0gbmV3IGJlZHJvY2suVmVjdG9yS25vd2xlZGdlQmFzZSh0aGlzLCAnS25vd2xlZGdlQmFzZScsIHtcbiAgICAgICAgICAgIHZlY3RvclN0b3JlOiBwaW5lY29uZWNkcyxcbiAgICAgICAgICAgIGVtYmVkZGluZ3NNb2RlbDogZW1iZWRkaW5nTW9kZWwsXG4gICAgICAgICAgICBpbnN0cnVjdGlvbjogJ1VzZSB0aGlzIGtub3dsZWRnZSBiYXNlIHRvIGFuc3dlciBxdWVzdGlvbnMgYWJvdXQgdGhlIGRvY3VtZW50cy4nLFxuXG4gICAgICAgIH0pO1xuICAgICAgICAvLyBDb25uZWN0cyB0aGUgUzMgYnVja2V0IGFzIGEgZGF0YSBzb3VyY2Ugd2l0aCBzZW1hbnRpYyBjaHVua2luZyBlbmFibGVkXG4gICAgICAgIGNvbnN0IGRhdGFTb3VyY2UgPSB0aGlzLmtub3dsZWRnZUJhc2UuYWRkUzNEYXRhU291cmNlKHtcbiAgICAgICAgICAgIGJ1Y2tldDogcHJvcHMuYnVja2V0LFxuICAgICAgICAgICAgY2h1bmtpbmdTdHJhdGVneTogYmVkcm9jay5DaHVua2luZ1N0cmF0ZWd5LlNFTUFOVElDLFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnNldHVwQXV0b1N5bmMocHJvcHMuYnVja2V0LCBkYXRhU291cmNlLmRhdGFTb3VyY2VJZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0cyB1cCB0aGUgYXV0b21hdGljIHN5bmNocm9uaXphdGlvbiBtZWNoYW5pc20gYnkgY3JlYXRpbmcgYSBMYW1iZGEgZnVuY3Rpb24gXG4gICAgICogdHJpZ2dlcmVkIGJ5IFMzIGV2ZW50cyAodXBsb2FkL2RlbGV0ZSkgdG8gc3RhcnQgS25vd2xlZGdlIEJhc2UgaW5nZXN0aW9uIGpvYnMuXG4gICAgICogXG4gICAgICogQHBhcmFtIGJ1Y2tldCBUaGUgUzMgYnVja2V0IGFjdGluZyBhcyB0aGUgZGF0YSBzb3VyY2VcbiAgICAgKiBAcGFyYW0gZGF0YVNvdXJjZUlkIFRoZSBJRCBvZiB0aGUgQmVkcm9jayBLbm93bGVkZ2UgQmFzZSBkYXRhIHNvdXJjZVxuICAgICAqL1xuICAgIHByaXZhdGUgc2V0dXBBdXRvU3luYyhidWNrZXQ6IHMzLklCdWNrZXQsIGRhdGFTb3VyY2VJZDogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IGNvbmZpZyA9IENvbmZpZ01hbmFnZXIuZ2V0SW5zdGFuY2UoKS5jb25maWc7XG5cbiAgICAgICAgLy8gRGVmaW5lcyB0aGUgTGFtYmRhIGZ1bmN0aW9uIHRvIGNvb3JkaW5hdGUgbWFudWFsIHN5bmNzIHdoZW4gZmlsZXMgY2hhbmdlXG4gICAgICAgIGNvbnN0IHN5bmNMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdTeW5jTGFtYmRhJywge1xuICAgICAgICAgICAgZnVuY3Rpb25OYW1lOiBgJHtjb25maWcuYXBwTmFtZS50b0xvd2VyQ2FzZSgpfS1rYi1zeW5jYCxcbiAgICAgICAgICAgIHJ1bnRpbWU6IExBTUJEQV9QWVRIT05fUlVOVElNRSxcbiAgICAgICAgICAgIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgICAgICAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldChwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vLi4vLi4vc3JjL2xhbWJkYS9rYi1zeW5jJykpLFxuICAgICAgICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLm1pbnV0ZXMoNSksXG4gICAgICAgICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICAgICAgICAgIEtOT1dMRURHRV9CQVNFX0lEOiB0aGlzLmtub3dsZWRnZUJhc2Uua25vd2xlZGdlQmFzZUlkLFxuICAgICAgICAgICAgICAgIERBVEFfU09VUkNFX0lEOiBkYXRhU291cmNlSWQsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBHcmFudHMgcGVybWlzc2lvbiB0byBzdGFydCBpbmdlc3Rpb24gam9icyBvbiB0aGUgS25vd2xlZGdlIEJhc2VcbiAgICAgICAgdGhpcy5rbm93bGVkZ2VCYXNlLmdyYW50KHN5bmNMYW1iZGEsICdiZWRyb2NrOlN0YXJ0SW5nZXN0aW9uSm9iJywgJ2JlZHJvY2s6QXNzb2NpYXRlVGhpcmRQYXJ0eUtub3dsZWRnZUJhc2UnKTtcblxuICAgICAgICAvLyBDb25maWd1cmVzIFMzIGV2ZW50IG5vdGlmaWNhdGlvbnMgdG8gdHJpZ2dlciB0aGUgU3luYyBMYW1iZGFcbiAgICAgICAgYnVja2V0LmFkZEV2ZW50Tm90aWZpY2F0aW9uKFxuICAgICAgICAgICAgczMuRXZlbnRUeXBlLk9CSkVDVF9DUkVBVEVELFxuICAgICAgICAgICAgbmV3IHMzbi5MYW1iZGFEZXN0aW5hdGlvbihzeW5jTGFtYmRhKVxuICAgICAgICApO1xuICAgICAgICBidWNrZXQuYWRkRXZlbnROb3RpZmljYXRpb24oXG4gICAgICAgICAgICBzMy5FdmVudFR5cGUuT0JKRUNUX1JFTU9WRUQsXG4gICAgICAgICAgICBuZXcgczNuLkxhbWJkYURlc3RpbmF0aW9uKHN5bmNMYW1iZGEpXG4gICAgICAgICk7XG4gICAgfVxufVxuXG4iXX0=