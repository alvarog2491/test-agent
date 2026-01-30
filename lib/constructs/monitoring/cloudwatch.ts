import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import { Construct } from 'constructs';

export interface CloudWatchMonitoringProps {
    readonly api: apigateway.IRestApi;
}

export class CloudWatchMonitoring extends Construct {
    private readonly dashboard: cloudwatch.Dashboard;

    constructor(scope: Construct, id: string, props: CloudWatchMonitoringProps) {
        super(scope, id);

        this.dashboard = new cloudwatch.Dashboard(this, 'AgentDashboard', {
            dashboardName: 'BedrockAgentPerformance',
        });

        const { sessionMetric, leadMetric, conversionRatio } = this.createSessionMetrics();
        const apiLatencyP95 = this.createLatencyMetrics(props.api);

        this.dashboard.addWidgets(
            new cloudwatch.SingleValueWidget({
                title: 'Total Sessions',
                metrics: [sessionMetric],
                width: 6,
            }),
            new cloudwatch.SingleValueWidget({
                title: 'Total Leads',
                metrics: [leadMetric],
                width: 6,
            }),
            new cloudwatch.SingleValueWidget({
                title: 'Lead Conversion Rate',
                metrics: [conversionRatio],
                width: 6,
            }),
            new cloudwatch.GraphWidget({
                title: 'API Gateway Latency (P95)',
                left: [apiLatencyP95],
                width: 24,
            })
        );
    }

    private createSessionMetrics() {
        const sessionMetric = new cloudwatch.Metric({
            namespace: 'LeadGenBot',
            metricName: 'SessionInvocation',
            dimensionsMap: {
                service: 'AgentService',
            },
            statistic: 'Sum',
            period: cdk.Duration.minutes(5),
            label: 'Sessions',
        });

        const leadMetric = new cloudwatch.Metric({
            namespace: 'LeadGenBot',
            metricName: 'LeadCaptured',
            dimensionsMap: {
                service: 'LeadCollector',
            },
            statistic: 'Sum',
            period: cdk.Duration.minutes(5),
            label: 'Leads',
        });

        const conversionRatio = new cloudwatch.MathExpression({
            expression: 'FILL(leads, 0) / IF(FILL(sessions, 0) > 0, FILL(sessions, 0), 1) * 100',
            usingMetrics: {
                leads: leadMetric,
                sessions: sessionMetric,
            },
            label: 'Lead Conversion Rate %',
        });

        return { sessionMetric, leadMetric, conversionRatio };
    }

    private createLatencyMetrics(api: apigateway.IRestApi): cloudwatch.Metric {
        return new cloudwatch.Metric({
            namespace: 'AWS/ApiGateway',
            metricName: 'Latency',
            dimensionsMap: {
                ApiName: api.restApiName,
                Stage: api.deploymentStage.stageName,
            },
            statistic: 'p95',
            label: 'Total Latency (P95)',
            period: cdk.Duration.minutes(5),
        });
    }
}
