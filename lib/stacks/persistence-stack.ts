import { bedrock } from '@cdklabs/generative-ai-cdk-constructs';
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { AppSettings } from '../config-manager';
import { BucketStore } from '../constructs/persistence/bucket-store';
import { KnowledgeBaseConstruct } from '../constructs/persistence/knowledge-base';
import { LeadTable } from '../constructs/persistence/lead-table';

export interface PersistenceStackProps extends cdk.StackProps {
    readonly config: AppSettings;
}

// Stack that manages persistent storage like S3 buckets and DynamoDB tables
export class PersistenceStack extends cdk.Stack {
    public readonly knowledgeBaseBucket: s3.IBucket;
    public readonly leadTable: dynamodb.ITable;
    public readonly evaluationsResultsBucket: s3.IBucket;
    public readonly knowledgeBase: bedrock.VectorKnowledgeBase;

    constructor(scope: Construct, id: string, props: PersistenceStackProps) {
        super(scope, id, props);
        const { config } = props;

        // Creates S3 buckets for knowledge base documents and evaluation results
        const bucketStore = new BucketStore(this, 'BucketStore', { config });
        this.knowledgeBaseBucket = bucketStore.knowledgeBaseBucket;
        this.evaluationsResultsBucket = bucketStore.evaluationsResultsBucket;

        // Provisions DynamoDB table for lead data persistence
        const leadTable = new LeadTable(this, 'LeadTable', { config });
        this.leadTable = leadTable.table;

        // Provisions the Bedrock Knowledge Base and syncs with S3
        const knowledgeBaseConstruct = new KnowledgeBaseConstruct(this, 'KnowledgeBase', {
            config,
            bucket: this.knowledgeBaseBucket,
        });
        this.knowledgeBase = knowledgeBaseConstruct.knowledgeBase;


    }
}
