import { bedrock } from '@cdklabs/generative-ai-cdk-constructs';
import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import * as path from 'path';
import { AppSettings } from '../../config-manager';

export interface RagasEvaluationEngineProps {
    readonly config: AppSettings;
    readonly agent: bedrock.IAgent;
    readonly agentAlias: bedrock.IAgentAlias;
    readonly resultsBucket: s3.IBucket;
}

/**
 * RagasEvaluationEngine Construct
 * Encapsulates the compute resources and security logic for AI model auditing.
 */
// Construct that defines the ECS Fargate task for running RAGAS evaluations
export class RagasEvaluationEngine extends Construct {
    public readonly taskDefinition: ecs.FargateTaskDefinition;

    constructor(scope: Construct, id: string, props: RagasEvaluationEngineProps) {
        super(scope, id);

        const { config } = props;

        // Provisions the Fargate task definition with ARM64 architecture for performance
        this.taskDefinition = new ecs.FargateTaskDefinition(this, 'RagasTaskDef', {
            memoryLimitMiB: 4096,
            cpu: 2048,
            runtimePlatform: {
                operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
                cpuArchitecture: ecs.CpuArchitecture.ARM64,
            },
        });

        const logGroup = new logs.LogGroup(this, 'RagasLogGroup', {
            logGroupName: '/aws/ecs/ragas-evaluation-engine',
            retention: config.logRetention,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        // Adds the evaluation container using logic from the ragas_evaluator directory
        this.taskDefinition.addContainer('RagasContainer', {
            image: ecs.ContainerImage.fromAsset(path.join(__dirname, '../../../src/jobs/evaluation/ragas_evaluator')),
            logging: ecs.LogDrivers.awsLogs({
                logGroup: logGroup,
                streamPrefix: 'RagasEval'
            }),
            environment: {
                AGENT_ID: props.agent.agentId,
                AGENT_ALIAS_ID: props.agentAlias.aliasId,
                EVAL_DATA_BUCKET: props.resultsBucket.bucketName,
                RESULTS_BUCKET: props.resultsBucket.bucketName,
                EVAL_DATA_KEY: 'test_sets/golden_set.jsonl',
                JUDGE_MODEL_ID: config.evaluationJudgeModel,
                EMBEDDING_MODEL_ID: config.embeddingModel,
                // LANGFUSE_SECRET_KEY: config.langfuse.secretKey, // TODO: Fix missing config properties
                // LANGFUSE_PUBLIC_KEY: config.langfuse.publicKey, // TODO: Fix missing config properties
                LANGFUSE_BASE_URL: config.langfuse.baseUrl,
            },
        });

        // Configures necessary IAM roles and permissions for the evaluation task
        this.configurePermissions(props, config.evaluationJudgeModel, config.embeddingModel);
    }

    /**
     * Orchestrates all Identity and Access Management for the auditor task.
     * Keeps the constructor focused on resource declaration.
     */
    private configurePermissions(props: RagasEvaluationEngineProps, judgeModelId: string, embeddingModelId: string): void {
        const role = this.taskDefinition.taskRole;
        const stack = cdk.Stack.of(this);

        // Foundation Model Permission (Any Region)
        // This covers the routing target (e.g., us-east-2)
        const foundationModelArn = `arn:aws:bedrock:*::foundation-model/${judgeModelId}`;

        // Inference Profile Permission (Any Region)
        // This allows the initial call to be regionalized or shifted
        const inferenceProfileArn = `arn:aws:bedrock:*:${stack.account}:inference-profile/us.${judgeModelId}`;

        iam.Grant.addToPrincipal({
            grantee: role,
            actions: [
                'bedrock:InvokeModel',
                'bedrock:InvokeModelWithResponseStream',
                'bedrock:GetInferenceProfile'
            ],
            resourceArns: [foundationModelArn, inferenceProfileArn],
        });

        // Don't forget the embedding model (usually regional)
        const embeddingModel = new bedrock.BedrockFoundationModel(embeddingModelId);
        embeddingModel.grantInvoke(role);

        props.agentAlias.grantInvoke(role);
        props.resultsBucket.grantReadWrite(role);
    }
}