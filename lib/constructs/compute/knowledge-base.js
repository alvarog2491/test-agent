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
        // Defines the Lambda function to coordinate manual syncs when files change
        const syncLambda = new lambda.Function(this, 'SyncLambda', {
            runtime: lambda.Runtime.PYTHON_3_12,
            handler: 'index.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../../../src/lambda/kb-sync')),
            timeout: cdk.Duration.minutes(5),
            environment: {
                KNOWLEDGE_BASE_ID: this.knowledgeBase.knowledgeBaseId,
                DATA_SOURCE_ID: dataSourceId,
            },
        });
        // Grants permission to start ingestion jobs on the Knowledge Base
        this.knowledgeBase.grant(syncLambda, 'bedrock:StartIngestionJob');
        // Configures S3 event notifications to trigger the Sync Lambda
        bucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3n.LambdaDestination(syncLambda));
        bucket.addEventNotification(s3.EventType.OBJECT_REMOVED, new s3n.LambdaDestination(syncLambda));
    }
}
exports.KnowledgeBaseConstruct = KnowledgeBaseConstruct;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia25vd2xlZGdlLWJhc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJrbm93bGVkZ2UtYmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx3RkFBMEU7QUFDMUUsaURBQW1DO0FBQ25DLHlEQUFvRTtBQUNwRSwrREFBaUQ7QUFDakQsdURBQXlDO0FBQ3pDLHNFQUF3RDtBQUN4RCwyQ0FBdUM7QUFDdkMsMkNBQTZCO0FBQzdCLHlEQUFxRDtBQU1yRCx3RUFBd0U7QUFDeEUsTUFBYSxzQkFBdUIsU0FBUSxzQkFBUztJQUNqQyxhQUFhLENBQThCO0lBRTNELFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBa0M7UUFDeEUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNqQixNQUFNLE1BQU0sR0FBRyw4QkFBYSxDQUFDLFdBQVcsRUFBRSxDQUFDLE1BQU0sQ0FBQztRQUVsRCxvRUFBb0U7UUFDcEUsTUFBTSxXQUFXLEdBQUcsSUFBSSx1Q0FBUSxDQUFDLG1CQUFtQixDQUFDO1lBQ2pELGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxXQUFXLENBQUMsZ0JBQWdCO1lBQ3JELG9CQUFvQixFQUFFLE1BQU0sQ0FBQyxXQUFXLENBQUMsb0JBQW9CO1lBQzdELFNBQVMsRUFBRSxNQUFNO1lBQ2pCLGFBQWEsRUFBRSxVQUFVO1NBQzVCLENBQUMsQ0FBQztRQUVILHdFQUF3RTtRQUN4RSxNQUFNLGVBQWUsR0FBRyxJQUFJLHVDQUF5QixDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUM3RSx5RUFBeUU7UUFDekUsTUFBTSxjQUFjLEdBQUcsc0NBQU8sQ0FBQyxzQkFBc0IsQ0FBQyx3QkFBd0IsQ0FBQyxlQUFlLEVBQUU7WUFDNUYscUJBQXFCLEVBQUUsSUFBSTtTQUM5QixDQUFDLENBQUM7UUFFSCxpRkFBaUY7UUFDakYsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLHNDQUFPLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRTtZQUN4RSxXQUFXLEVBQUUsV0FBVztZQUN4QixlQUFlLEVBQUUsY0FBYztZQUMvQixXQUFXLEVBQUUsa0VBQWtFO1NBRWxGLENBQUMsQ0FBQztRQUNILHlFQUF5RTtRQUN6RSxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQztZQUNsRCxNQUFNLEVBQUUsS0FBSyxDQUFDLE1BQU07WUFDcEIsZ0JBQWdCLEVBQUUsc0NBQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRO1NBQ3RELENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDOUQsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNLLGFBQWEsQ0FBQyxNQUFrQixFQUFFLFlBQW9CO1FBQzFELDJFQUEyRTtRQUMzRSxNQUFNLFVBQVUsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRTtZQUN2RCxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXO1lBQ25DLE9BQU8sRUFBRSxlQUFlO1lBQ3hCLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSw2QkFBNkIsQ0FBQyxDQUFDO1lBQ2hGLE9BQU8sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDaEMsV0FBVyxFQUFFO2dCQUNULGlCQUFpQixFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZTtnQkFDckQsY0FBYyxFQUFFLFlBQVk7YUFDL0I7U0FDSixDQUFDLENBQUM7UUFFSCxrRUFBa0U7UUFDbEUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLDJCQUEyQixDQUFDLENBQUM7UUFFbEUsK0RBQStEO1FBQy9ELE1BQU0sQ0FBQyxvQkFBb0IsQ0FDdkIsRUFBRSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEVBQzNCLElBQUksR0FBRyxDQUFDLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxDQUN4QyxDQUFDO1FBQ0YsTUFBTSxDQUFDLG9CQUFvQixDQUN2QixFQUFFLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFDM0IsSUFBSSxHQUFHLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQ3hDLENBQUM7SUFDTixDQUFDO0NBQ0o7QUF2RUQsd0RBdUVDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYmVkcm9jaywgcGluZWNvbmUgfSBmcm9tICdAY2RrbGFicy9nZW5lcmF0aXZlLWFpLWNkay1jb25zdHJ1Y3RzJztcbmltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBGb3VuZGF0aW9uTW9kZWxJZGVudGlmaWVyIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWJlZHJvY2snO1xuaW1wb3J0ICogYXMgbGFtYmRhIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEnO1xuaW1wb3J0ICogYXMgczMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXMzJztcbmltcG9ydCAqIGFzIHMzbiBmcm9tICdhd3MtY2RrLWxpYi9hd3MtczMtbm90aWZpY2F0aW9ucyc7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBDb25maWdNYW5hZ2VyIH0gZnJvbSAnLi4vLi4vY29uZmlnLW1hbmFnZXInO1xuXG5leHBvcnQgaW50ZXJmYWNlIEtub3dsZWRnZUJhc2VDb25zdHJ1Y3RQcm9wcyB7XG4gICAgcmVhZG9ubHkgYnVja2V0OiBzMy5JQnVja2V0O1xufVxuXG4vLyBDb25zdHJ1Y3QgZm9yIG1hbmFnaW5nIHRoZSBCZWRyb2NrIEtub3dsZWRnZSBCYXNlIGFuZCBpdHMgZGF0YSBzb3VyY2VcbmV4cG9ydCBjbGFzcyBLbm93bGVkZ2VCYXNlQ29uc3RydWN0IGV4dGVuZHMgQ29uc3RydWN0IHtcbiAgICBwdWJsaWMgcmVhZG9ubHkga25vd2xlZGdlQmFzZTogYmVkcm9jay5WZWN0b3JLbm93bGVkZ2VCYXNlO1xuXG4gICAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IEtub3dsZWRnZUJhc2VDb25zdHJ1Y3RQcm9wcykge1xuICAgICAgICBzdXBlcihzY29wZSwgaWQpO1xuICAgICAgICBjb25zdCBjb25maWcgPSBDb25maWdNYW5hZ2VyLmdldEluc3RhbmNlKCkuY29uZmlnO1xuXG4gICAgICAgIC8vIENvbmZpZ3VyZXMgUGluZWNvbmUgYXMgdGhlIHZlY3RvciBzdG9yYWdlIGZvciBkb2N1bWVudCBlbWJlZGRpbmdzXG4gICAgICAgIGNvbnN0IHBpbmVjb25lY2RzID0gbmV3IHBpbmVjb25lLlBpbmVjb25lVmVjdG9yU3RvcmUoe1xuICAgICAgICAgICAgY29ubmVjdGlvblN0cmluZzogY29uZmlnLnZlY3RvclN0b3JlLmNvbm5lY3Rpb25TdHJpbmcsXG4gICAgICAgICAgICBjcmVkZW50aWFsc1NlY3JldEFybjogY29uZmlnLnZlY3RvclN0b3JlLmNyZWRlbnRpYWxzU2VjcmV0QXJuLFxuICAgICAgICAgICAgdGV4dEZpZWxkOiAndGV4dCcsXG4gICAgICAgICAgICBtZXRhZGF0YUZpZWxkOiAnbWV0YWRhdGEnLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBEZWZpbmVzIHRoZSBlbWJlZGRpbmcgbW9kZWwgaWRlbnRpZmllciBmcm9tIGFwcGxpY2F0aW9uIGNvbmZpZ3VyYXRpb25cbiAgICAgICAgY29uc3QgbW9kZWxJZGVudGlmaWVyID0gbmV3IEZvdW5kYXRpb25Nb2RlbElkZW50aWZpZXIoY29uZmlnLmVtYmVkZGluZ01vZGVsKTtcbiAgICAgICAgLy8gUmVmZXJlbmNlcyB0aGUgQmVkcm9jayBmb3VuZGF0aW9uIG1vZGVsIHVzZWQgZm9yIGdlbmVyYXRpbmcgZW1iZWRkaW5nc1xuICAgICAgICBjb25zdCBlbWJlZGRpbmdNb2RlbCA9IGJlZHJvY2suQmVkcm9ja0ZvdW5kYXRpb25Nb2RlbC5mcm9tQ2RrRm91bmRhdGlvbk1vZGVsSWQobW9kZWxJZGVudGlmaWVyLCB7XG4gICAgICAgICAgICBzdXBwb3J0c0tub3dsZWRnZUJhc2U6IHRydWUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFByb3Zpc2lvbnMgdGhlIHZlY3RvciBrbm93bGVkZ2UgYmFzZSBjb21iaW5pbmcgUGluZWNvbmUgYW5kIEJlZHJvY2sgZW1iZWRkaW5nc1xuICAgICAgICB0aGlzLmtub3dsZWRnZUJhc2UgPSBuZXcgYmVkcm9jay5WZWN0b3JLbm93bGVkZ2VCYXNlKHRoaXMsICdLbm93bGVkZ2VCYXNlJywge1xuICAgICAgICAgICAgdmVjdG9yU3RvcmU6IHBpbmVjb25lY2RzLFxuICAgICAgICAgICAgZW1iZWRkaW5nc01vZGVsOiBlbWJlZGRpbmdNb2RlbCxcbiAgICAgICAgICAgIGluc3RydWN0aW9uOiAnVXNlIHRoaXMga25vd2xlZGdlIGJhc2UgdG8gYW5zd2VyIHF1ZXN0aW9ucyBhYm91dCB0aGUgZG9jdW1lbnRzLicsXG5cbiAgICAgICAgfSk7XG4gICAgICAgIC8vIENvbm5lY3RzIHRoZSBTMyBidWNrZXQgYXMgYSBkYXRhIHNvdXJjZSB3aXRoIHNlbWFudGljIGNodW5raW5nIGVuYWJsZWRcbiAgICAgICAgY29uc3QgZGF0YVNvdXJjZSA9IHRoaXMua25vd2xlZGdlQmFzZS5hZGRTM0RhdGFTb3VyY2Uoe1xuICAgICAgICAgICAgYnVja2V0OiBwcm9wcy5idWNrZXQsXG4gICAgICAgICAgICBjaHVua2luZ1N0cmF0ZWd5OiBiZWRyb2NrLkNodW5raW5nU3RyYXRlZ3kuU0VNQU5USUMsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuc2V0dXBBdXRvU3luYyhwcm9wcy5idWNrZXQsIGRhdGFTb3VyY2UuZGF0YVNvdXJjZUlkKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHVwIHRoZSBhdXRvbWF0aWMgc3luY2hyb25pemF0aW9uIG1lY2hhbmlzbSBieSBjcmVhdGluZyBhIExhbWJkYSBmdW5jdGlvbiBcbiAgICAgKiB0cmlnZ2VyZWQgYnkgUzMgZXZlbnRzICh1cGxvYWQvZGVsZXRlKSB0byBzdGFydCBLbm93bGVkZ2UgQmFzZSBpbmdlc3Rpb24gam9icy5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gYnVja2V0IFRoZSBTMyBidWNrZXQgYWN0aW5nIGFzIHRoZSBkYXRhIHNvdXJjZVxuICAgICAqIEBwYXJhbSBkYXRhU291cmNlSWQgVGhlIElEIG9mIHRoZSBCZWRyb2NrIEtub3dsZWRnZSBCYXNlIGRhdGEgc291cmNlXG4gICAgICovXG4gICAgcHJpdmF0ZSBzZXR1cEF1dG9TeW5jKGJ1Y2tldDogczMuSUJ1Y2tldCwgZGF0YVNvdXJjZUlkOiBzdHJpbmcpIHtcbiAgICAgICAgLy8gRGVmaW5lcyB0aGUgTGFtYmRhIGZ1bmN0aW9uIHRvIGNvb3JkaW5hdGUgbWFudWFsIHN5bmNzIHdoZW4gZmlsZXMgY2hhbmdlXG4gICAgICAgIGNvbnN0IHN5bmNMYW1iZGEgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdTeW5jTGFtYmRhJywge1xuICAgICAgICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuUFlUSE9OXzNfMTIsXG4gICAgICAgICAgICBoYW5kbGVyOiAnaW5kZXguaGFuZGxlcicsXG4gICAgICAgICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQocGF0aC5qb2luKF9fZGlybmFtZSwgJy4uLy4uLy4uL3NyYy9sYW1iZGEva2Itc3luYycpKSxcbiAgICAgICAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5taW51dGVzKDUpLFxuICAgICAgICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgICAgICAgICBLTk9XTEVER0VfQkFTRV9JRDogdGhpcy5rbm93bGVkZ2VCYXNlLmtub3dsZWRnZUJhc2VJZCxcbiAgICAgICAgICAgICAgICBEQVRBX1NPVVJDRV9JRDogZGF0YVNvdXJjZUlkLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gR3JhbnRzIHBlcm1pc3Npb24gdG8gc3RhcnQgaW5nZXN0aW9uIGpvYnMgb24gdGhlIEtub3dsZWRnZSBCYXNlXG4gICAgICAgIHRoaXMua25vd2xlZGdlQmFzZS5ncmFudChzeW5jTGFtYmRhLCAnYmVkcm9jazpTdGFydEluZ2VzdGlvbkpvYicpO1xuXG4gICAgICAgIC8vIENvbmZpZ3VyZXMgUzMgZXZlbnQgbm90aWZpY2F0aW9ucyB0byB0cmlnZ2VyIHRoZSBTeW5jIExhbWJkYVxuICAgICAgICBidWNrZXQuYWRkRXZlbnROb3RpZmljYXRpb24oXG4gICAgICAgICAgICBzMy5FdmVudFR5cGUuT0JKRUNUX0NSRUFURUQsXG4gICAgICAgICAgICBuZXcgczNuLkxhbWJkYURlc3RpbmF0aW9uKHN5bmNMYW1iZGEpXG4gICAgICAgICk7XG4gICAgICAgIGJ1Y2tldC5hZGRFdmVudE5vdGlmaWNhdGlvbihcbiAgICAgICAgICAgIHMzLkV2ZW50VHlwZS5PQkpFQ1RfUkVNT1ZFRCxcbiAgICAgICAgICAgIG5ldyBzM24uTGFtYmRhRGVzdGluYXRpb24oc3luY0xhbWJkYSlcbiAgICAgICAgKTtcbiAgICB9XG59XG5cbiJdfQ==