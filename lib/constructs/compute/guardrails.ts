import { bedrock } from '@cdklabs/generative-ai-cdk-constructs';
import { Construct } from 'constructs';
import * as fs from 'fs';
import * as path from 'path';

export interface GuardrailsConstructProps {
}

export class GuardrailsConstruct extends Construct {
    public readonly guardrail: bedrock.Guardrail;

    constructor(scope: Construct, id: string, props: GuardrailsConstructProps) {
        super(scope, id);

        const guardrailPath = path.join(__dirname, '../../../assets/guardrails/default-guardrail.json');

        // Check if the file exists
        if (!fs.existsSync(guardrailPath)) {
            throw new Error(
                `Guardrail must exist, please create them at assets/guardrails/default-guardrail.json`
            );
        }
        const guardrailConfig = JSON.parse(fs.readFileSync(guardrailPath, 'utf8'));

        this.guardrail = new bedrock.Guardrail(this, 'AgentGuardrail', {
            name: guardrailConfig.name,
            description: guardrailConfig.description,
            blockedInputMessaging: guardrailConfig.blockedInputMessaging,
            blockedOutputsMessaging: guardrailConfig.blockedOutputsMessaging,
            contentFilters: guardrailConfig.contentPolicyConfig.filtersConfig.map((filter: any) => ({
                type: filter.type,
                inputStrength: filter.inputStrength,
                outputStrength: filter.outputStrength,
            })),
        });
    }
}
