import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
interface MonitoringStackProps extends cdk.StackProps {
    readonly knowledgeBaseId: string;
}
export declare class MonitoringStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: MonitoringStackProps);
}
export {};
