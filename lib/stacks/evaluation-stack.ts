import { bedrock } from '@cdklabs/generative-ai-cdk-constructs';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { AppSettings } from '../config-manager';
import { RagasEvaluationEngine } from '../constructs/evaluation/ragas-evaluation-engine';
// import { EvaluationDashboard } from '../constructs/monitoring/evaluation-dashboard';

export interface EvaluationStackProps extends cdk.StackProps {
    readonly config: AppSettings;
    readonly agent: bedrock.IAgent;
    readonly agentAlias: bedrock.IAgentAlias;
    readonly resultsBucket: s3.IBucket;
}

// Stack for RAG evaluation resources using ECS Fargate in Public Subnets
export class EvaluationStack extends cdk.Stack {
    public readonly evalSecurityGroup: ec2.SecurityGroup;

    constructor(scope: Construct, id: string, props: EvaluationStackProps) {
        super(scope, id, props);
        const { config } = props;

        // Configures a public VPC for evaluation tasks with direct internet access
        const vpc = new ec2.Vpc(this, 'EvalVpc', {
            maxAzs: 2,
            natGateways: 0,
            subnetConfiguration: [{
                name: 'Public',
                subnetType: ec2.SubnetType.PUBLIC,
            }],
            restrictDefaultSecurityGroup: false,
        });

        // Provisions an ECS cluster for hosting the evaluation engine
        const cluster = new ecs.Cluster(this, 'EvalCluster', {
            vpc,
            containerInsights: true // Essential for monitoring Fargate performance
        });



        // Zero-Trust Security Group: No inbound traffic allowed
        // This ensures that even in a public subnet, the Fargate tasks are not reachable from the internet
        this.evalSecurityGroup = new ec2.SecurityGroup(this, 'EvalTaskSecurityGroup', {
            vpc,
            allowAllOutbound: true,
            description: 'Security group for Fargate Eval Task with NO inbound access',
        });

        // Instantiates the core RAGAS evaluation engine logic
        const ragasEvaluationEngine = new RagasEvaluationEngine(this, 'RagasEngine', {
            ...props,
        });

        // Creates the CloudWatch Dashboard for visualizing evaluation metrics
        // new EvaluationDashboard(this, 'EvaluationDashboard', {
        //     agentId: props.agent.agentId,
        //     taskDefinition: ragasEvaluationEngine.taskDefinition,
        // });


    }
}