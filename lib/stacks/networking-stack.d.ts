import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
export interface NetworkingStackProps extends cdk.StackProps {
}
export declare class NetworkingStack extends cdk.Stack {
    readonly vpc: ec2.IVpc;
    readonly securityGroup: ec2.SecurityGroup;
    constructor(scope: Construct, id: string, props?: NetworkingStackProps);
}
