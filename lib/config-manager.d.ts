import { RemovalPolicy } from 'aws-cdk-lib';
import * as logs from 'aws-cdk-lib/aws-logs';
import { z } from 'zod';
export declare enum Stage {
    DEV = "dev",
    STAGING = "staging",
    PROD = "prod"
}
declare const envSchema: z.ZodObject<{
    STAGE: z.ZodEnum<{
        dev: "dev";
        staging: "staging";
        prod: "prod";
    }>;
    AWS_ACCOUNT: z.ZodString;
    AWS_REGION: z.ZodString;
    VECTOR_CONNECTION_STRING: z.ZodString;
    VECTOR_SECRET_ARN: z.ZodString;
    LANGFUSE_SECRET_KEY: z.ZodString;
    LANGFUSE_PUBLIC_KEY: z.ZodString;
    LANGFUSE_BASE_URL: z.ZodString;
}, z.core.$strip>;
export type EnvConfig = z.infer<typeof envSchema>;
export interface VectorStoreConfig {
    readonly embeddingModelArn: string;
    readonly connectionString: string;
    readonly credentialsSecretArn: string;
}
export interface LangFuseConfig {
    readonly secretKey: string;
    readonly publicKey: string;
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
    readonly agentModelInputTokenPrice: number;
    readonly agentModelOutputTokenPrice: number;
    readonly embeddingModelInputTokenPrice: number;
    readonly embeddingModelOutputTokenPrice: number;
    readonly evaluationJudgeInputTokenPrice: number;
    readonly evaluationJudgeOutputTokenPrice: number;
    readonly allowedOrigins: string[];
    readonly logRetention: logs.RetentionDays;
    readonly langfuse: LangFuseConfig;
}
export declare class ConfigManager {
    private static instance;
    private readonly settings;
    private constructor();
    static getInstance(): ConfigManager;
    get config(): AppSettings;
}
export {};
