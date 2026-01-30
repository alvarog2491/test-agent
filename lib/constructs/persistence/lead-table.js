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
exports.LeadTable = void 0;
const dynamodb = __importStar(require("aws-cdk-lib/aws-dynamodb"));
const constructs_1 = require("constructs");
const config_manager_1 = require("../../config-manager");
// Construct that defines the DynamoDB table for lead storage
class LeadTable extends constructs_1.Construct {
    table;
    constructor(scope, id) {
        super(scope, id);
        const config = config_manager_1.ConfigManager.getInstance().config;
        // Provisions the DynamoDB table with on-demand billing and recovery enabled
        const leadsTable = new dynamodb.Table(this, 'LeadsTable', {
            partitionKey: { name: 'lead_id', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: config.removalPolicy,
            pointInTimeRecovery: true,
        });
        this.table = leadsTable;
    }
}
exports.LeadTable = LeadTable;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGVhZC10YWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImxlYWQtdGFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbUVBQXFEO0FBRXJELDJDQUF1QztBQUN2Qyx5REFBcUQ7QUFFckQsNkRBQTZEO0FBQzdELE1BQWEsU0FBVSxTQUFRLHNCQUFTO0lBQ3BCLEtBQUssQ0FBUTtJQUU3QixZQUFZLEtBQWdCLEVBQUUsRUFBVTtRQUNwQyxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sTUFBTSxHQUFHLDhCQUFhLENBQUMsV0FBVyxFQUFFLENBQUMsTUFBTSxDQUFDO1FBRWxELDRFQUE0RTtRQUM1RSxNQUFNLFVBQVUsR0FBRyxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRTtZQUN0RCxZQUFZLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRTtZQUN0RSxXQUFXLEVBQUUsUUFBUSxDQUFDLFdBQVcsQ0FBQyxlQUFlO1lBQ2pELGFBQWEsRUFBRSxNQUFNLENBQUMsYUFBYTtZQUNuQyxtQkFBbUIsRUFBRSxJQUFJO1NBQzVCLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDO0lBQzVCLENBQUM7Q0FDSjtBQWpCRCw4QkFpQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBkeW5hbW9kYiBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZHluYW1vZGInO1xuaW1wb3J0IHsgVGFibGUgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZHluYW1vZGInO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgeyBDb25maWdNYW5hZ2VyIH0gZnJvbSAnLi4vLi4vY29uZmlnLW1hbmFnZXInO1xuXG4vLyBDb25zdHJ1Y3QgdGhhdCBkZWZpbmVzIHRoZSBEeW5hbW9EQiB0YWJsZSBmb3IgbGVhZCBzdG9yYWdlXG5leHBvcnQgY2xhc3MgTGVhZFRhYmxlIGV4dGVuZHMgQ29uc3RydWN0IHtcbiAgICBwdWJsaWMgcmVhZG9ubHkgdGFibGU6IFRhYmxlO1xuXG4gICAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZykge1xuICAgICAgICBzdXBlcihzY29wZSwgaWQpO1xuICAgICAgICBjb25zdCBjb25maWcgPSBDb25maWdNYW5hZ2VyLmdldEluc3RhbmNlKCkuY29uZmlnO1xuXG4gICAgICAgIC8vIFByb3Zpc2lvbnMgdGhlIER5bmFtb0RCIHRhYmxlIHdpdGggb24tZGVtYW5kIGJpbGxpbmcgYW5kIHJlY292ZXJ5IGVuYWJsZWRcbiAgICAgICAgY29uc3QgbGVhZHNUYWJsZSA9IG5ldyBkeW5hbW9kYi5UYWJsZSh0aGlzLCAnTGVhZHNUYWJsZScsIHtcbiAgICAgICAgICAgIHBhcnRpdGlvbktleTogeyBuYW1lOiAnbGVhZF9pZCcsIHR5cGU6IGR5bmFtb2RiLkF0dHJpYnV0ZVR5cGUuU1RSSU5HIH0sXG4gICAgICAgICAgICBiaWxsaW5nTW9kZTogZHluYW1vZGIuQmlsbGluZ01vZGUuUEFZX1BFUl9SRVFVRVNULFxuICAgICAgICAgICAgcmVtb3ZhbFBvbGljeTogY29uZmlnLnJlbW92YWxQb2xpY3ksXG4gICAgICAgICAgICBwb2ludEluVGltZVJlY292ZXJ5OiB0cnVlLFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnRhYmxlID0gbGVhZHNUYWJsZTtcbiAgICB9XG59XG4iXX0=