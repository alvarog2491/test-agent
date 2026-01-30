import { bedrock } from '@cdklabs/generative-ai-cdk-constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
export interface RagasEvaluationEngineProps {
    readonly agent: bedrock.IAgent;
    readonly agentAlias: bedrock.IAgentAlias;
    readonly resultsBucket: s3.IBucket;
}
/**
 * RagasEvaluationEngine Construct
 * Encapsulates the compute resources and security logic for AI model auditing.
 */
export declare class RagasEvaluationEngine extends Construct {
    readonly taskDefinition: ecs.FargateTaskDefinition;
    constructor(scope: Construct, id: string, props: RagasEvaluationEngineProps);
    /**
     * Orchestrates all Identity and Access Management for the auditor task.
     * Keeps the constructor focused on resource declaration.
     */
    private configurePermissions;
}
