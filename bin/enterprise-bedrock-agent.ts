#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { createConfig } from '../lib/config-manager';
import { ComputeStack } from '../lib/stacks/compute-stack';
import { EvaluationStack } from '../lib/stacks/evaluation-stack';
import { InterfaceStack } from '../lib/stacks/interface-stack';
import { MonitoringStack } from '../lib/stacks/monitoring-stack';
import { PersistenceStack } from '../lib/stacks/persistence-stack';

// Entry point for the CDK application
const app = new cdk.App();

const config = createConfig();

// Provisions the storage layer including S3 buckets and DynamoDB tables
const persistenceStack = new PersistenceStack(app, 'PersistenceStack', { config });

// Provisions the compute layer including the Bedrock agent and knowledge base
const computeStack = new ComputeStack(app, 'ComputeStack', {
  config,
  knowledgeBase: persistenceStack.knowledgeBase,
  leadTable: persistenceStack.leadTable,
});

// Provisions the interface layer exposing the agent via API Gateway
const interfaceStack = new InterfaceStack(app, 'InterfaceStack', {
  config,
  agent: computeStack.agent,
  agentAlias: computeStack.agentAlias,
});

// Provisions the monitoring layer for observability and dashboards
const monitoringStack = new MonitoringStack(app, 'MonitoringStack', {
  config,
  knowledgeBaseId: persistenceStack.knowledgeBase.knowledgeBaseId,
  api: interfaceStack.api,
});

// Provisions the evaluation layer for RAG performance testing
const evaluationStack = new EvaluationStack(app, 'EvaluationStack', {
  config,
  agent: computeStack.agent,
  agentAlias: computeStack.agentAlias,
  resultsBucket: persistenceStack.evaluationsResultsBucket,
});

// Centralized Tagging: Applies tags to all resources in the app
cdk.Tags.of(app).add('Environment', config.stage);
cdk.Tags.of(app).add('AppName', config.appName);
