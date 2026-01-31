import { RemovalPolicy } from 'aws-cdk-lib';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { z } from 'zod';

import * as constants from './constants';
import { VersionManager } from './version-manager';

export enum Stage {
    DEV = 'dev',
    STAGING = 'staging',
    PROD = 'prod',
}

const envSchema = z.object({
    STAGE: z.enum(['dev', 'staging', 'prod']),
    AWS_ACCOUNT: z.string().regex(/^\d{12}$/, "Must be a 12-digit AWS Account ID"),
    AWS_REGION: z.string().min(4),
    VECTOR_CONNECTION_STRING: z.string().url(),
    VECTOR_SECRET_ARN: z.string().includes('arn:aws:secretsmanager'),
    LANGFUSE_SECRET_ARN: z.string().includes('arn:aws:secretsmanager'),
    LANGFUSE_BASE_URL: z.string().url(),
});

export type EnvConfig = z.infer<typeof envSchema>;

export interface VectorStoreConfig {
    readonly embeddingModelArn: string;
    readonly connectionString: string;
    readonly credentialsSecretArn: string;
}

export interface LangFuseConfig {
    readonly secretArn: string;
    readonly baseUrl: string;
}

export interface AppSettings {
    readonly account: string;
    readonly region: string;
    readonly agentModel: string;
    readonly embeddingModel: string;
    readonly evaluationJudgeModel: string;
    readonly agentName: string;
    readonly vectorStore: VectorStoreConfig;
    readonly stage: Stage;
    readonly removalPolicy: RemovalPolicy;
    readonly appName: string;
    readonly domain: string;
    readonly allowedOrigins: string[];
    readonly logRetention: logs.RetentionDays;
    readonly langfuse: LangFuseConfig;
    readonly version: string;
    readonly gitCommitSha?: string;
    readonly deploymentTimestamp: string;
}

export function createConfig(stage?: Stage): AppSettings {
    dotenv.config({ path: path.resolve(__dirname, '../.env') });

    const result = envSchema.safeParse(process.env);

    if (!result.success) {
        console.error("❌ Invalid environment configuration:");
        console.error(JSON.stringify(result.error.format(), null, 2));
        throw new Error("Config validation failed");
    }

    const env = result.data;
    const currentStage = stage || (env.STAGE as Stage);

    // Extract version metadata
    const versionManager = VersionManager.getInstance();
    const versionMetadata = versionManager.getVersionMetadata();


    const settings: AppSettings = {
        stage: currentStage,
        account: env.AWS_ACCOUNT,
        region: env.AWS_REGION,
        agentModel: constants.AGENT_MODEL,
        embeddingModel: constants.EMBEDDING_MODEL,
        evaluationJudgeModel: constants.EVALUATION_JUDGE_MODEL,
        agentName: `${constants.AGENT_NAME}-${currentStage}`,
        removalPolicy: currentStage === Stage.PROD ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
        appName: constants.APP_NAME,
        domain: constants.DOMAIN,

        allowedOrigins: currentStage === Stage.PROD ? constants.ALLOWED_ORIGINS_PROD : constants.ALLOWED_ORIGINS_DEV,
        logRetention: currentStage === Stage.PROD ? logs.RetentionDays.ONE_MONTH : logs.RetentionDays.ONE_WEEK,
        vectorStore: {
            embeddingModelArn: `arn:aws:bedrock:${env.AWS_REGION}::foundation-model/${constants.EMBEDDING_MODEL}`,
            connectionString: env.VECTOR_CONNECTION_STRING,
            credentialsSecretArn: env.VECTOR_SECRET_ARN,
        },
        langfuse: {
            secretArn: env.LANGFUSE_SECRET_ARN,
            baseUrl: env.LANGFUSE_BASE_URL,
        },
        version: versionMetadata.version,
        gitCommitSha: versionMetadata.gitCommitSha,
        deploymentTimestamp: versionMetadata.deploymentTimestamp,
    };

    Object.freeze(settings);
    Object.freeze(settings.vectorStore);
    Object.freeze(settings.langfuse);

    return settings;
}