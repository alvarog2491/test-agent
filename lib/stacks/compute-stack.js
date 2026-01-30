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
exports.ComputeStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const config_manager_1 = require("../config-manager");
const bedrock_agent_1 = require("../constructs/compute/bedrock-agent");
// Main stack for compute resources including the Bedrock agent
class ComputeStack extends cdk.Stack {
    agent;
    agentAlias;
    constructor(scope, id, props) {
        super(scope, id, props);
        const config = config_manager_1.ConfigManager.getInstance().config;
        // Creates the Bedrock agent with required bucket and table permissions
        const bedrockAgent = new bedrock_agent_1.BedrockAgentConstruct(this, 'BedrockAgent', {
            knowledgeBase: props.knowledgeBase,
            leadTableArn: props.leadTable.tableArn,
            leadTableName: props.leadTable.tableName,
        });
        this.agent = bedrockAgent.agent;
        this.agentAlias = bedrockAgent.agentAlias;
    }
}
exports.ComputeStack = ComputeStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcHV0ZS1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvbXB1dGUtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsaURBQW1DO0FBR25DLHNEQUFrRDtBQUNsRCx1RUFBNEU7QUFPNUUsK0RBQStEO0FBQy9ELE1BQWEsWUFBYSxTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQ3ZCLEtBQUssQ0FBaUI7SUFDdEIsVUFBVSxDQUFzQjtJQUVoRCxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQXdCO1FBQzlELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3hCLE1BQU0sTUFBTSxHQUFHLDhCQUFhLENBQUMsV0FBVyxFQUFFLENBQUMsTUFBTSxDQUFDO1FBRWxELHVFQUF1RTtRQUN2RSxNQUFNLFlBQVksR0FBRyxJQUFJLHFDQUFxQixDQUFDLElBQUksRUFBRSxjQUFjLEVBQUU7WUFDakUsYUFBYSxFQUFFLEtBQUssQ0FBQyxhQUFhO1lBQ2xDLFlBQVksRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLFFBQVE7WUFDdEMsYUFBYSxFQUFFLEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBUztTQUMzQyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsS0FBSyxHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUM7UUFDaEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxZQUFZLENBQUMsVUFBVSxDQUFDO0lBRzlDLENBQUM7Q0FDSjtBQW5CRCxvQ0FtQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBiZWRyb2NrIH0gZnJvbSAnQGNka2xhYnMvZ2VuZXJhdGl2ZS1haS1jZGstY29uc3RydWN0cyc7XG5pbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgZHluYW1vZGIgZnJvbSAnYXdzLWNkay1saWIvYXdzLWR5bmFtb2RiJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0IHsgQ29uZmlnTWFuYWdlciB9IGZyb20gJy4uL2NvbmZpZy1tYW5hZ2VyJztcbmltcG9ydCB7IEJlZHJvY2tBZ2VudENvbnN0cnVjdCB9IGZyb20gJy4uL2NvbnN0cnVjdHMvY29tcHV0ZS9iZWRyb2NrLWFnZW50JztcblxuZXhwb3J0IGludGVyZmFjZSBDb21wdXRlU3RhY2tQcm9wcyBleHRlbmRzIGNkay5TdGFja1Byb3BzIHtcbiAgICByZWFkb25seSBrbm93bGVkZ2VCYXNlOiBiZWRyb2NrLklWZWN0b3JLbm93bGVkZ2VCYXNlO1xuICAgIHJlYWRvbmx5IGxlYWRUYWJsZTogZHluYW1vZGIuSVRhYmxlO1xufVxuXG4vLyBNYWluIHN0YWNrIGZvciBjb21wdXRlIHJlc291cmNlcyBpbmNsdWRpbmcgdGhlIEJlZHJvY2sgYWdlbnRcbmV4cG9ydCBjbGFzcyBDb21wdXRlU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICAgIHB1YmxpYyByZWFkb25seSBhZ2VudDogYmVkcm9jay5JQWdlbnQ7XG4gICAgcHVibGljIHJlYWRvbmx5IGFnZW50QWxpYXM6IGJlZHJvY2suSUFnZW50QWxpYXM7XG5cbiAgICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogQ29tcHV0ZVN0YWNrUHJvcHMpIHtcbiAgICAgICAgc3VwZXIoc2NvcGUsIGlkLCBwcm9wcyk7XG4gICAgICAgIGNvbnN0IGNvbmZpZyA9IENvbmZpZ01hbmFnZXIuZ2V0SW5zdGFuY2UoKS5jb25maWc7XG5cbiAgICAgICAgLy8gQ3JlYXRlcyB0aGUgQmVkcm9jayBhZ2VudCB3aXRoIHJlcXVpcmVkIGJ1Y2tldCBhbmQgdGFibGUgcGVybWlzc2lvbnNcbiAgICAgICAgY29uc3QgYmVkcm9ja0FnZW50ID0gbmV3IEJlZHJvY2tBZ2VudENvbnN0cnVjdCh0aGlzLCAnQmVkcm9ja0FnZW50Jywge1xuICAgICAgICAgICAga25vd2xlZGdlQmFzZTogcHJvcHMua25vd2xlZGdlQmFzZSxcbiAgICAgICAgICAgIGxlYWRUYWJsZUFybjogcHJvcHMubGVhZFRhYmxlLnRhYmxlQXJuLFxuICAgICAgICAgICAgbGVhZFRhYmxlTmFtZTogcHJvcHMubGVhZFRhYmxlLnRhYmxlTmFtZSxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuYWdlbnQgPSBiZWRyb2NrQWdlbnQuYWdlbnQ7XG4gICAgICAgIHRoaXMuYWdlbnRBbGlhcyA9IGJlZHJvY2tBZ2VudC5hZ2VudEFsaWFzO1xuXG5cbiAgICB9XG59XG4iXX0=