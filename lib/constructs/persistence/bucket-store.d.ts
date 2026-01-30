import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
export declare class BucketStore extends Construct {
    readonly knowledgeBaseBucket: s3.IBucket;
    readonly logsBucket: s3.IBucket;
    readonly evaluationsResultsBucket: s3.IBucket;
    constructor(scope: Construct, id: string);
}
