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
exports.PersistenceStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const config_manager_1 = require("../config-manager");
const bucket_store_1 = require("../constructs/persistence/bucket-store");
const knowledge_base_1 = require("../constructs/persistence/knowledge-base");
const lead_table_1 = require("../constructs/persistence/lead-table");
// Stack that manages persistent storage like S3 buckets and DynamoDB tables
class PersistenceStack extends cdk.Stack {
    knowledgeBaseBucket;
    leadTable;
    evaluationsResultsBucket;
    knowledgeBase;
    constructor(scope, id, props) {
        super(scope, id, props);
        const config = config_manager_1.ConfigManager.getInstance().config;
        // Creates S3 buckets for knowledge base documents and evaluation results
        const bucketStore = new bucket_store_1.BucketStore(this, 'BucketStore');
        this.knowledgeBaseBucket = bucketStore.knowledgeBaseBucket;
        this.evaluationsResultsBucket = bucketStore.evaluationsResultsBucket;
        // Provisions DynamoDB table for lead data persistence
        const leadTable = new lead_table_1.LeadTable(this, 'LeadTable');
        this.leadTable = leadTable.table;
        // Provisions the Bedrock Knowledge Base and syncs with S3
        const knowledgeBaseConstruct = new knowledge_base_1.KnowledgeBaseConstruct(this, 'KnowledgeBase', {
            bucket: this.knowledgeBaseBucket,
        });
        this.knowledgeBase = knowledgeBaseConstruct.knowledgeBase;
    }
}
exports.PersistenceStack = PersistenceStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVyc2lzdGVuY2Utc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJwZXJzaXN0ZW5jZS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSxpREFBbUM7QUFJbkMsc0RBQWtEO0FBQ2xELHlFQUFxRTtBQUNyRSw2RUFBa0Y7QUFDbEYscUVBQWlFO0FBS2pFLDRFQUE0RTtBQUM1RSxNQUFhLGdCQUFpQixTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQzNCLG1CQUFtQixDQUFhO0lBQ2hDLFNBQVMsQ0FBa0I7SUFDM0Isd0JBQXdCLENBQWE7SUFDckMsYUFBYSxDQUE4QjtJQUUzRCxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQTZCO1FBQ25FLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3hCLE1BQU0sTUFBTSxHQUFHLDhCQUFhLENBQUMsV0FBVyxFQUFFLENBQUMsTUFBTSxDQUFDO1FBRWxELHlFQUF5RTtRQUN6RSxNQUFNLFdBQVcsR0FBRyxJQUFJLDBCQUFXLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQ3pELElBQUksQ0FBQyxtQkFBbUIsR0FBRyxXQUFXLENBQUMsbUJBQW1CLENBQUM7UUFDM0QsSUFBSSxDQUFDLHdCQUF3QixHQUFHLFdBQVcsQ0FBQyx3QkFBd0IsQ0FBQztRQUVyRSxzREFBc0Q7UUFDdEQsTUFBTSxTQUFTLEdBQUcsSUFBSSxzQkFBUyxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQztRQUNuRCxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUM7UUFFakMsMERBQTBEO1FBQzFELE1BQU0sc0JBQXNCLEdBQUcsSUFBSSx1Q0FBc0IsQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFO1lBQzdFLE1BQU0sRUFBRSxJQUFJLENBQUMsbUJBQW1CO1NBQ25DLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxhQUFhLEdBQUcsc0JBQXNCLENBQUMsYUFBYSxDQUFDO0lBRzlELENBQUM7Q0FDSjtBQTNCRCw0Q0EyQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBiZWRyb2NrIH0gZnJvbSAnQGNka2xhYnMvZ2VuZXJhdGl2ZS1haS1jZGstY29uc3RydWN0cyc7XG5pbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgZHluYW1vZGIgZnJvbSAnYXdzLWNkay1saWIvYXdzLWR5bmFtb2RiJztcbmltcG9ydCAqIGFzIHMzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1zMyc7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCB7IENvbmZpZ01hbmFnZXIgfSBmcm9tICcuLi9jb25maWctbWFuYWdlcic7XG5pbXBvcnQgeyBCdWNrZXRTdG9yZSB9IGZyb20gJy4uL2NvbnN0cnVjdHMvcGVyc2lzdGVuY2UvYnVja2V0LXN0b3JlJztcbmltcG9ydCB7IEtub3dsZWRnZUJhc2VDb25zdHJ1Y3QgfSBmcm9tICcuLi9jb25zdHJ1Y3RzL3BlcnNpc3RlbmNlL2tub3dsZWRnZS1iYXNlJztcbmltcG9ydCB7IExlYWRUYWJsZSB9IGZyb20gJy4uL2NvbnN0cnVjdHMvcGVyc2lzdGVuY2UvbGVhZC10YWJsZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGVyc2lzdGVuY2VTdGFja1Byb3BzIGV4dGVuZHMgY2RrLlN0YWNrUHJvcHMge1xufVxuXG4vLyBTdGFjayB0aGF0IG1hbmFnZXMgcGVyc2lzdGVudCBzdG9yYWdlIGxpa2UgUzMgYnVja2V0cyBhbmQgRHluYW1vREIgdGFibGVzXG5leHBvcnQgY2xhc3MgUGVyc2lzdGVuY2VTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gICAgcHVibGljIHJlYWRvbmx5IGtub3dsZWRnZUJhc2VCdWNrZXQ6IHMzLklCdWNrZXQ7XG4gICAgcHVibGljIHJlYWRvbmx5IGxlYWRUYWJsZTogZHluYW1vZGIuSVRhYmxlO1xuICAgIHB1YmxpYyByZWFkb25seSBldmFsdWF0aW9uc1Jlc3VsdHNCdWNrZXQ6IHMzLklCdWNrZXQ7XG4gICAgcHVibGljIHJlYWRvbmx5IGtub3dsZWRnZUJhc2U6IGJlZHJvY2suVmVjdG9yS25vd2xlZGdlQmFzZTtcblxuICAgIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogUGVyc2lzdGVuY2VTdGFja1Byb3BzKSB7XG4gICAgICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuICAgICAgICBjb25zdCBjb25maWcgPSBDb25maWdNYW5hZ2VyLmdldEluc3RhbmNlKCkuY29uZmlnO1xuXG4gICAgICAgIC8vIENyZWF0ZXMgUzMgYnVja2V0cyBmb3Iga25vd2xlZGdlIGJhc2UgZG9jdW1lbnRzIGFuZCBldmFsdWF0aW9uIHJlc3VsdHNcbiAgICAgICAgY29uc3QgYnVja2V0U3RvcmUgPSBuZXcgQnVja2V0U3RvcmUodGhpcywgJ0J1Y2tldFN0b3JlJyk7XG4gICAgICAgIHRoaXMua25vd2xlZGdlQmFzZUJ1Y2tldCA9IGJ1Y2tldFN0b3JlLmtub3dsZWRnZUJhc2VCdWNrZXQ7XG4gICAgICAgIHRoaXMuZXZhbHVhdGlvbnNSZXN1bHRzQnVja2V0ID0gYnVja2V0U3RvcmUuZXZhbHVhdGlvbnNSZXN1bHRzQnVja2V0O1xuXG4gICAgICAgIC8vIFByb3Zpc2lvbnMgRHluYW1vREIgdGFibGUgZm9yIGxlYWQgZGF0YSBwZXJzaXN0ZW5jZVxuICAgICAgICBjb25zdCBsZWFkVGFibGUgPSBuZXcgTGVhZFRhYmxlKHRoaXMsICdMZWFkVGFibGUnKTtcbiAgICAgICAgdGhpcy5sZWFkVGFibGUgPSBsZWFkVGFibGUudGFibGU7XG5cbiAgICAgICAgLy8gUHJvdmlzaW9ucyB0aGUgQmVkcm9jayBLbm93bGVkZ2UgQmFzZSBhbmQgc3luY3Mgd2l0aCBTM1xuICAgICAgICBjb25zdCBrbm93bGVkZ2VCYXNlQ29uc3RydWN0ID0gbmV3IEtub3dsZWRnZUJhc2VDb25zdHJ1Y3QodGhpcywgJ0tub3dsZWRnZUJhc2UnLCB7XG4gICAgICAgICAgICBidWNrZXQ6IHRoaXMua25vd2xlZGdlQmFzZUJ1Y2tldCxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMua25vd2xlZGdlQmFzZSA9IGtub3dsZWRnZUJhc2VDb25zdHJ1Y3Qua25vd2xlZGdlQmFzZTtcblxuXG4gICAgfVxufVxuIl19