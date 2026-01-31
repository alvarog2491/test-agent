import * as cdk from 'aws-cdk-lib';
import { IConstruct } from 'constructs';
import { Stage } from './config-manager';
import { VersionManager } from './version-manager';

/**
 * Standard tag keys used across all resources
 */
export enum TagKey {
    VERSION = 'Version',
    GIT_COMMIT_SHA = 'GitCommitSHA',
    DEPLOYMENT_TIMESTAMP = 'DeploymentTimestamp',
    ENVIRONMENT = 'Environment',
    APP_NAME = 'AppName',
    MANAGED_BY = 'ManagedBy',
    COST_CENTER = 'CostCenter',
    PROJECT = 'Project',
}

/**
 * Centralized tagging strategy for AWS resources.
 * Implements AWS tagging best practices for cost allocation, governance, and traceability.
 */
export class TaggingStrategy {
    private static readonly MANAGED_BY_VALUE = 'AWS-CDK';
    private static readonly PROJECT_VALUE = 'Enterprise-Bedrock-Agent';

    /**
     * Applies standard tags to a CDK construct (stack or resource)
     */
    public static applyStandardTags(
        construct: IConstruct,
        appName: string,
        stage: Stage,
        additionalTags?: Record<string, string>
    ): void {
        const versionManager = VersionManager.getInstance();
        const metadata = versionManager.getVersionMetadata();

        // Apply core tags
        cdk.Tags.of(construct).add(TagKey.VERSION, metadata.version);
        cdk.Tags.of(construct).add(TagKey.ENVIRONMENT, stage);
        cdk.Tags.of(construct).add(TagKey.APP_NAME, appName);
        cdk.Tags.of(construct).add(TagKey.MANAGED_BY, this.MANAGED_BY_VALUE);
        cdk.Tags.of(construct).add(TagKey.PROJECT, this.PROJECT_VALUE);
        cdk.Tags.of(construct).add(TagKey.DEPLOYMENT_TIMESTAMP, metadata.deploymentTimestamp);

        // Add git commit SHA if available
        if (metadata.gitCommitSha) {
            cdk.Tags.of(construct).add(TagKey.GIT_COMMIT_SHA, metadata.gitCommitSha);
        }

        // Apply any additional custom tags
        if (additionalTags) {
            Object.entries(additionalTags).forEach(([key, value]) => {
                cdk.Tags.of(construct).add(key, value);
            });
        }
    }

    /**
     * Applies tags specific to storage resources (S3, DynamoDB)
     */
    public static applyStorageTags(
        construct: IConstruct,
        appName: string,
        stage: Stage,
        purpose: string,
        dataClassification: 'public' | 'internal' | 'confidential' | 'restricted' = 'internal'
    ): void {
        this.applyStandardTags(construct, appName, stage, {
            Purpose: purpose,
            DataClassification: dataClassification,
            ResourceType: 'Storage',
        });
    }

    /**
     * Applies tags specific to compute resources (Lambda, Bedrock Agent)
     */
    public static applyComputeTags(
        construct: IConstruct,
        appName: string,
        stage: Stage,
        purpose: string
    ): void {
        this.applyStandardTags(construct, appName, stage, {
            Purpose: purpose,
            ResourceType: 'Compute',
        });
    }

    /**
     * Applies tags specific to interface resources (API Gateway)
     */
    public static applyInterfaceTags(
        construct: IConstruct,
        appName: string,
        stage: Stage,
        purpose: string
    ): void {
        this.applyStandardTags(construct, appName, stage, {
            Purpose: purpose,
            ResourceType: 'Interface',
        });
    }

    /**
     * Applies tags specific to monitoring resources (CloudWatch)
     */
    public static applyMonitoringTags(
        construct: IConstruct,
        appName: string,
        stage: Stage
    ): void {
        this.applyStandardTags(construct, appName, stage, {
            Purpose: 'Observability',
            ResourceType: 'Monitoring',
        });
    }

    /**
     * Gets a map of standard tags for use with resources that don't support CDK Tags
     */
    public static getStandardTagsMap(appName: string, stage: Stage): Record<string, string> {
        const versionManager = VersionManager.getInstance();
        const metadata = versionManager.getVersionMetadata();

        const tags: Record<string, string> = {
            [TagKey.VERSION]: metadata.version,
            [TagKey.ENVIRONMENT]: stage,
            [TagKey.APP_NAME]: appName,
            [TagKey.MANAGED_BY]: this.MANAGED_BY_VALUE,
            [TagKey.PROJECT]: this.PROJECT_VALUE,
            [TagKey.DEPLOYMENT_TIMESTAMP]: metadata.deploymentTimestamp,
        };

        if (metadata.gitCommitSha) {
            tags[TagKey.GIT_COMMIT_SHA] = metadata.gitCommitSha;
        }

        return tags;
    }

    /**
     * Generates a resource name with version suffix for better traceability
     */
    public static generateVersionedResourceName(baseName: string, includeVersion: boolean = false): string {
        if (!includeVersion) {
            return baseName;
        }

        const versionManager = VersionManager.getInstance();
        const version = versionManager.getVersion().replace(/\./g, '-');
        return `${baseName}-v${version}`;
    }
}
