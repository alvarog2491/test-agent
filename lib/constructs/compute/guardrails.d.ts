import { bedrock } from '@cdklabs/generative-ai-cdk-constructs';
import { Construct } from 'constructs';
export interface GuardrailsConstructProps {
}
export declare class GuardrailsConstruct extends Construct {
    readonly guardrail: bedrock.Guardrail;
    constructor(scope: Construct, id: string, props: GuardrailsConstructProps);
}
