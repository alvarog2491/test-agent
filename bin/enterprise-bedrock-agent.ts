#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { createConfig } from '../lib/config-manager';
import { ComputeStack } from '../lib/stacks/compute-stack';
import { EvaluationStack } from '../lib/stacks/evaluation-stack';
import { InterfaceStack } from '../lib/stacks/interface-stack';
import { MonitoringStack } from '../lib/stacks/monitoring-stack';
import { PersistenceStack } from '../lib/stacks/persistence-stack';
import { TaggingStrategy } from '../lib/tagging-strategy';
import { VersionManager } from '../lib/version-manager';

// Entry point for the CDK application
const app = new cdk.App();

const config = createConfig();

// Provisions the storage layer including S3 buckets and DynamoDB tables
const persistenceStack = new PersistenceStack(app, 'PersistenceStack', { config });
TaggingStrategy.applyStorageTags(persistenceStack, config.appName, config.stage, 'Data Persistence Layer');

// Provisions the compute layer including the Bedrock agent and knowledge base
const computeStack = new ComputeStack(app, 'ComputeStack', {
  config,
  knowledgeBase: persistenceStack.knowledgeBase,
  leadTable: persistenceStack.leadTable,
});
TaggingStrategy.applyComputeTags(computeStack, config.appName, config.stage, 'Bedrock Agent and Lambda Functions');

// Provisions the interface layer exposing the agent via API Gateway
const interfaceStack = new InterfaceStack(app, 'InterfaceStack', {
  config,
  agent: computeStack.agent,
  agentAlias: computeStack.agentAlias,
});
TaggingStrategy.applyInterfaceTags(interfaceStack, config.appName, config.stage, 'API Gateway Interface');

// Provisions the monitoring layer for observability and dashboards
const monitoringStack = new MonitoringStack(app, 'MonitoringStack', {
  config,
  knowledgeBaseId: persistenceStack.knowledgeBase.knowledgeBaseId,
  api: interfaceStack.api,
});
TaggingStrategy.applyMonitoringTags(monitoringStack, config.appName, config.stage);

// Provisions the evaluation layer for RAG performance testing
const evaluationStack = new EvaluationStack(app, 'EvaluationStack', {
  config,
  agent: computeStack.agent,
  agentAlias: computeStack.agentAlias,
  resultsBucket: persistenceStack.evaluationsResultsBucket,
});

// Apply comprehensive tagging strategy to all stacks
const versionManager = VersionManager.getInstance();
const versionDescription = versionManager.getVersionDescription();

TaggingStrategy.applyStandardTags(app, config.appName, config.stage);

// Add stack-specific descriptions with version information
persistenceStack.templateOptions.description = `Persistence Stack - ${versionDescription}`;
computeStack.templateOptions.description = `Compute Stack - ${versionDescription}`;
interfaceStack.templateOptions.description = `Interface Stack - ${versionDescription}`;
monitoringStack.templateOptions.description = `Monitoring Stack - ${versionDescription}`;
evaluationStack.templateOptions.description = `Evaluation Stack - ${versionDescription}`;

