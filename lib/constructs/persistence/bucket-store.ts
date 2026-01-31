import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { AppSettings, Stage } from '../../config-manager';

export interface BucketStoreProps {
    readonly config: AppSettings;
}

// Construct that centralizes the creation of all S3 buckets for the application
export class BucketStore extends Construct {
    public readonly knowledgeBaseBucket: s3.IBucket;
    public readonly logsBucket: s3.IBucket;
    public readonly evaluationsResultsBucket: s3.IBucket;

    constructor(scope: Construct, id: string, props: BucketStoreProps) {
        super(scope, id);
        const { config } = props;
        const account = cdk.Stack.of(this).account;
        const appName = config.appName.toLowerCase();

        // Provisions a dedicated S3 bucket for server access logs (must be created first)
        this.logsBucket = new s3.Bucket(this, 'LogsBucket', {
            bucketName: `${appName}-logs-${account}`,
            encryption: s3.BucketEncryption.S3_MANAGED,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            enforceSSL: true,
            removalPolicy: config.removalPolicy,
            autoDeleteObjects: config.stage !== Stage.PROD,
        });

        // Provisions the encrypted S3 bucket for storing knowledge base documents
        this.knowledgeBaseBucket = new s3.Bucket(this, 'knowledgeBaseBucket', {
            bucketName: `${appName}-knowledge-base-${account}`,
            encryption: s3.BucketEncryption.S3_MANAGED,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            enforceSSL: true,
            removalPolicy: config.removalPolicy,
            autoDeleteObjects: config.stage !== Stage.PROD,
            versioned: true,
            serverAccessLogsBucket: this.logsBucket,
            serverAccessLogsPrefix: 'knowledge-base-bucket/',
            lifecycleRules: [
                {
                    id: 'DeleteOldVersions',
                    enabled: true,
                    noncurrentVersionExpiration: cdk.Duration.days(90),
                    noncurrentVersionsToRetain: 5,
                },
                {
                    id: 'CleanupExpiredDeleteMarkers',
                    enabled: true,
                    expiredObjectDeleteMarker: true,
                },
            ],
        });

        // Provisions the S3 bucket for storing RAG evaluation results and metrics
        this.evaluationsResultsBucket = new s3.Bucket(this, 'EvaluationsBucket', {
            bucketName: `${appName}-evaluations-${account}`,
            encryption: s3.BucketEncryption.S3_MANAGED,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            enforceSSL: true,
            removalPolicy: config.removalPolicy,
            autoDeleteObjects: config.stage !== Stage.PROD,
            versioned: true,
            serverAccessLogsBucket: this.logsBucket,
            serverAccessLogsPrefix: 'evaluations-bucket/',
            lifecycleRules: [
                {
                    id: 'DeleteOldVersions',
                    enabled: true,
                    noncurrentVersionExpiration: cdk.Duration.days(90),
                    noncurrentVersionsToRetain: 5,
                },
                {
                    id: 'CleanupExpiredDeleteMarkers',
                    enabled: true,
                    expiredObjectDeleteMarker: true,
                },
            ],
        });
    }
}
