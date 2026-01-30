#!/usr/bin/env node
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
const cdk = __importStar(require("aws-cdk-lib"));
const config_manager_1 = require("../lib/config-manager");
const compute_stack_1 = require("../lib/stacks/compute-stack");
const evaluation_stack_1 = require("../lib/stacks/evaluation-stack");
const interface_stack_1 = require("../lib/stacks/interface-stack");
const monitoring_stack_1 = require("../lib/stacks/monitoring-stack");
const persistence_stack_1 = require("../lib/stacks/persistence-stack");
// Entry point for the CDK application
const app = new cdk.App();
const config = config_manager_1.ConfigManager.getInstance().config;
// Provisions the storage layer including S3 buckets and DynamoDB tables
const persistenceStack = new persistence_stack_1.PersistenceStack(app, 'PersistenceStack', {});
// Provisions the compute layer including the Bedrock agent and knowledge base
const computeStack = new compute_stack_1.ComputeStack(app, 'ComputeStack', {
    knowledgeBase: persistenceStack.knowledgeBase,
    leadTable: persistenceStack.leadTable,
});
// Provisions the interface layer exposing the agent via API Gateway
const interfaceStack = new interface_stack_1.InterfaceStack(app, 'InterfaceStack', {
    agent: computeStack.agent,
    agentAlias: computeStack.agentAlias,
});
// Provisions the monitoring layer for observability and dashboards
const monitoringStack = new monitoring_stack_1.MonitoringStack(app, 'MonitoringStack', {
    knowledgeBaseId: persistenceStack.knowledgeBase.knowledgeBaseId,
});
// Provisions the evaluation layer for RAG performance testing
const evaluationStack = new evaluation_stack_1.EvaluationStack(app, 'EvaluationStack', {
    agent: computeStack.agent,
    agentAlias: computeStack.agentAlias,
    resultsBucket: persistenceStack.evaluationsResultsBucket,
});
// Centralized Tagging: Applies tags to all resources in the app
cdk.Tags.of(app).add('Environment', config.stage);
cdk.Tags.of(app).add('AppName', config.appName);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50ZXJwcmlzZS1iZWRyb2NrLWFnZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZW50ZXJwcmlzZS1iZWRyb2NrLWFnZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLGlEQUFtQztBQUNuQywwREFBc0Q7QUFDdEQsK0RBQTJEO0FBQzNELHFFQUFpRTtBQUNqRSxtRUFBK0Q7QUFDL0QscUVBQWlFO0FBQ2pFLHVFQUFtRTtBQUVuRSxzQ0FBc0M7QUFDdEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7QUFFMUIsTUFBTSxNQUFNLEdBQUcsOEJBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxNQUFNLENBQUM7QUFFbEQsd0VBQXdFO0FBQ3hFLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxvQ0FBZ0IsQ0FBQyxHQUFHLEVBQUUsa0JBQWtCLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFFM0UsOEVBQThFO0FBQzlFLE1BQU0sWUFBWSxHQUFHLElBQUksNEJBQVksQ0FBQyxHQUFHLEVBQUUsY0FBYyxFQUFFO0lBQ3pELGFBQWEsRUFBRSxnQkFBZ0IsQ0FBQyxhQUFhO0lBQzdDLFNBQVMsRUFBRSxnQkFBZ0IsQ0FBQyxTQUFTO0NBQ3RDLENBQUMsQ0FBQztBQUVILG9FQUFvRTtBQUNwRSxNQUFNLGNBQWMsR0FBRyxJQUFJLGdDQUFjLENBQUMsR0FBRyxFQUFFLGdCQUFnQixFQUFFO0lBQy9ELEtBQUssRUFBRSxZQUFZLENBQUMsS0FBSztJQUN6QixVQUFVLEVBQUUsWUFBWSxDQUFDLFVBQVU7Q0FDcEMsQ0FBQyxDQUFDO0FBRUgsbUVBQW1FO0FBQ25FLE1BQU0sZUFBZSxHQUFHLElBQUksa0NBQWUsQ0FBQyxHQUFHLEVBQUUsaUJBQWlCLEVBQUU7SUFDbEUsZUFBZSxFQUFFLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxlQUFlO0NBQ2hFLENBQUMsQ0FBQztBQUVILDhEQUE4RDtBQUM5RCxNQUFNLGVBQWUsR0FBRyxJQUFJLGtDQUFlLENBQUMsR0FBRyxFQUFFLGlCQUFpQixFQUFFO0lBQ2xFLEtBQUssRUFBRSxZQUFZLENBQUMsS0FBSztJQUN6QixVQUFVLEVBQUUsWUFBWSxDQUFDLFVBQVU7SUFDbkMsYUFBYSxFQUFFLGdCQUFnQixDQUFDLHdCQUF3QjtDQUN6RCxDQUFDLENBQUM7QUFFSCxnRUFBZ0U7QUFDaEUsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDbEQsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG5pbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgQ29uZmlnTWFuYWdlciB9IGZyb20gJy4uL2xpYi9jb25maWctbWFuYWdlcic7XG5pbXBvcnQgeyBDb21wdXRlU3RhY2sgfSBmcm9tICcuLi9saWIvc3RhY2tzL2NvbXB1dGUtc3RhY2snO1xuaW1wb3J0IHsgRXZhbHVhdGlvblN0YWNrIH0gZnJvbSAnLi4vbGliL3N0YWNrcy9ldmFsdWF0aW9uLXN0YWNrJztcbmltcG9ydCB7IEludGVyZmFjZVN0YWNrIH0gZnJvbSAnLi4vbGliL3N0YWNrcy9pbnRlcmZhY2Utc3RhY2snO1xuaW1wb3J0IHsgTW9uaXRvcmluZ1N0YWNrIH0gZnJvbSAnLi4vbGliL3N0YWNrcy9tb25pdG9yaW5nLXN0YWNrJztcbmltcG9ydCB7IFBlcnNpc3RlbmNlU3RhY2sgfSBmcm9tICcuLi9saWIvc3RhY2tzL3BlcnNpc3RlbmNlLXN0YWNrJztcblxuLy8gRW50cnkgcG9pbnQgZm9yIHRoZSBDREsgYXBwbGljYXRpb25cbmNvbnN0IGFwcCA9IG5ldyBjZGsuQXBwKCk7XG5cbmNvbnN0IGNvbmZpZyA9IENvbmZpZ01hbmFnZXIuZ2V0SW5zdGFuY2UoKS5jb25maWc7XG5cbi8vIFByb3Zpc2lvbnMgdGhlIHN0b3JhZ2UgbGF5ZXIgaW5jbHVkaW5nIFMzIGJ1Y2tldHMgYW5kIER5bmFtb0RCIHRhYmxlc1xuY29uc3QgcGVyc2lzdGVuY2VTdGFjayA9IG5ldyBQZXJzaXN0ZW5jZVN0YWNrKGFwcCwgJ1BlcnNpc3RlbmNlU3RhY2snLCB7fSk7XG5cbi8vIFByb3Zpc2lvbnMgdGhlIGNvbXB1dGUgbGF5ZXIgaW5jbHVkaW5nIHRoZSBCZWRyb2NrIGFnZW50IGFuZCBrbm93bGVkZ2UgYmFzZVxuY29uc3QgY29tcHV0ZVN0YWNrID0gbmV3IENvbXB1dGVTdGFjayhhcHAsICdDb21wdXRlU3RhY2snLCB7XG4gIGtub3dsZWRnZUJhc2U6IHBlcnNpc3RlbmNlU3RhY2sua25vd2xlZGdlQmFzZSxcbiAgbGVhZFRhYmxlOiBwZXJzaXN0ZW5jZVN0YWNrLmxlYWRUYWJsZSxcbn0pO1xuXG4vLyBQcm92aXNpb25zIHRoZSBpbnRlcmZhY2UgbGF5ZXIgZXhwb3NpbmcgdGhlIGFnZW50IHZpYSBBUEkgR2F0ZXdheVxuY29uc3QgaW50ZXJmYWNlU3RhY2sgPSBuZXcgSW50ZXJmYWNlU3RhY2soYXBwLCAnSW50ZXJmYWNlU3RhY2snLCB7XG4gIGFnZW50OiBjb21wdXRlU3RhY2suYWdlbnQsXG4gIGFnZW50QWxpYXM6IGNvbXB1dGVTdGFjay5hZ2VudEFsaWFzLFxufSk7XG5cbi8vIFByb3Zpc2lvbnMgdGhlIG1vbml0b3JpbmcgbGF5ZXIgZm9yIG9ic2VydmFiaWxpdHkgYW5kIGRhc2hib2FyZHNcbmNvbnN0IG1vbml0b3JpbmdTdGFjayA9IG5ldyBNb25pdG9yaW5nU3RhY2soYXBwLCAnTW9uaXRvcmluZ1N0YWNrJywge1xuICBrbm93bGVkZ2VCYXNlSWQ6IHBlcnNpc3RlbmNlU3RhY2sua25vd2xlZGdlQmFzZS5rbm93bGVkZ2VCYXNlSWQsXG59KTtcblxuLy8gUHJvdmlzaW9ucyB0aGUgZXZhbHVhdGlvbiBsYXllciBmb3IgUkFHIHBlcmZvcm1hbmNlIHRlc3RpbmdcbmNvbnN0IGV2YWx1YXRpb25TdGFjayA9IG5ldyBFdmFsdWF0aW9uU3RhY2soYXBwLCAnRXZhbHVhdGlvblN0YWNrJywge1xuICBhZ2VudDogY29tcHV0ZVN0YWNrLmFnZW50LFxuICBhZ2VudEFsaWFzOiBjb21wdXRlU3RhY2suYWdlbnRBbGlhcyxcbiAgcmVzdWx0c0J1Y2tldDogcGVyc2lzdGVuY2VTdGFjay5ldmFsdWF0aW9uc1Jlc3VsdHNCdWNrZXQsXG59KTtcblxuLy8gQ2VudHJhbGl6ZWQgVGFnZ2luZzogQXBwbGllcyB0YWdzIHRvIGFsbCByZXNvdXJjZXMgaW4gdGhlIGFwcFxuY2RrLlRhZ3Mub2YoYXBwKS5hZGQoJ0Vudmlyb25tZW50JywgY29uZmlnLnN0YWdlKTtcbmNkay5UYWdzLm9mKGFwcCkuYWRkKCdBcHBOYW1lJywgY29uZmlnLmFwcE5hbWUpO1xuIl19