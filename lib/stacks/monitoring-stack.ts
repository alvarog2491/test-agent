import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AppSettings } from '../config-manager';
import { CloudWatchMonitoring } from '../constructs/monitoring/cloudwatch';

import * as apigateway from 'aws-cdk-lib/aws-apigateway';

interface MonitoringStackProps extends cdk.StackProps {
  readonly config: AppSettings;
  readonly knowledgeBaseId: string;
  readonly api: apigateway.IRestApi;
}

// Stack that centralizes monitoring and observability resources
export class MonitoringStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: MonitoringStackProps) {
    super(scope, id, props);

    const { config } = props;

    // Creates CloudWatch dashboards and metrics for agent performance
    new CloudWatchMonitoring(this, 'MonitoringConstruct', {
      api: props.api,
    });


  }
}

