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
exports.MonitoringStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const config_manager_1 = require("../config-manager");
const monitoring_1 = require("../constructs/monitoring/monitoring");
// Stack that centralizes monitoring and observability resources
class MonitoringStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const config = config_manager_1.ConfigManager.getInstance().config;
        // Creates CloudWatch dashboards and metrics for agent performance
        new monitoring_1.MonitoringConstruct(this, 'MonitoringConstruct', {
            knowledgeBaseId: props.knowledgeBaseId,
        });
    }
}
exports.MonitoringStack = MonitoringStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9uaXRvcmluZy1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1vbml0b3Jpbmctc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaURBQW1DO0FBRW5DLHNEQUFrRDtBQUNsRCxvRUFBMEU7QUFNMUUsZ0VBQWdFO0FBQ2hFLE1BQWEsZUFBZ0IsU0FBUSxHQUFHLENBQUMsS0FBSztJQUM1QyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQTJCO1FBQ25FLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLE1BQU0sTUFBTSxHQUFHLDhCQUFhLENBQUMsV0FBVyxFQUFFLENBQUMsTUFBTSxDQUFDO1FBRWxELGtFQUFrRTtRQUNsRSxJQUFJLGdDQUFtQixDQUFDLElBQUksRUFBRSxxQkFBcUIsRUFBRTtZQUNuRCxlQUFlLEVBQUUsS0FBSyxDQUFDLGVBQWU7U0FDdkMsQ0FBQyxDQUFDO0lBR0wsQ0FBQztDQUNGO0FBYkQsMENBYUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgeyBDb25maWdNYW5hZ2VyIH0gZnJvbSAnLi4vY29uZmlnLW1hbmFnZXInO1xuaW1wb3J0IHsgTW9uaXRvcmluZ0NvbnN0cnVjdCB9IGZyb20gJy4uL2NvbnN0cnVjdHMvbW9uaXRvcmluZy9tb25pdG9yaW5nJztcblxuaW50ZXJmYWNlIE1vbml0b3JpbmdTdGFja1Byb3BzIGV4dGVuZHMgY2RrLlN0YWNrUHJvcHMge1xuICByZWFkb25seSBrbm93bGVkZ2VCYXNlSWQ6IHN0cmluZztcbn1cblxuLy8gU3RhY2sgdGhhdCBjZW50cmFsaXplcyBtb25pdG9yaW5nIGFuZCBvYnNlcnZhYmlsaXR5IHJlc291cmNlc1xuZXhwb3J0IGNsYXNzIE1vbml0b3JpbmdTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBNb25pdG9yaW5nU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgY29uc3QgY29uZmlnID0gQ29uZmlnTWFuYWdlci5nZXRJbnN0YW5jZSgpLmNvbmZpZztcblxuICAgIC8vIENyZWF0ZXMgQ2xvdWRXYXRjaCBkYXNoYm9hcmRzIGFuZCBtZXRyaWNzIGZvciBhZ2VudCBwZXJmb3JtYW5jZVxuICAgIG5ldyBNb25pdG9yaW5nQ29uc3RydWN0KHRoaXMsICdNb25pdG9yaW5nQ29uc3RydWN0Jywge1xuICAgICAga25vd2xlZGdlQmFzZUlkOiBwcm9wcy5rbm93bGVkZ2VCYXNlSWQsXG4gICAgfSk7XG5cblxuICB9XG59XG5cbiJdfQ==