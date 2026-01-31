// lib/constructs/bedrock-agent-construct.ts
import { bedrock } from '@cdklabs/generative-ai-cdk-constructs';
import { Construct } from 'constructs';
import * as fs from 'fs';
import * as path from 'path';
import { AppSettings } from '../../config-manager';
import { GuardrailsConstruct } from './guardrails';
import { LeadCollectionConstruct } from './lead-collection';


export interface BedrockAgentConstructProps {
    readonly knowledgeBase: bedrock.IVectorKnowledgeBase;
    readonly leadTableArn: string;
    readonly leadTableName: string;
    readonly config: AppSettings;
}

// Construct that assembles the Bedrock agent with guardrails, KB, and action groups
export class BedrockAgentConstruct extends Construct {
    public readonly agent: bedrock.Agent;
    public readonly agentAlias: bedrock.IAgentAlias;

    constructor(scope: Construct, id: string, props: BedrockAgentConstructProps) {
        super(scope, id);

        // Load Agent Configuration
        const { config } = props;
        const promptText = this.loadAndProcessPrompt(config);
        const guardrailConstruct = new GuardrailsConstruct(this, 'Guardrails', {});
        const leadCollectionConstruct = new LeadCollectionConstruct(this, 'LeadCollection', {
            config,
            leadTableArn: props.leadTableArn,
            leadTableName: props.leadTableName,
        });

        const agentModel = new bedrock.BedrockFoundationModel(config.agentModel);

        this.agent = new bedrock.Agent(this, 'Agent', {
            name: config.agentName,
            instruction: promptText,
            foundationModel: agentModel,
            shouldPrepareAgent: true,
            userInputEnabled: true,
            guardrail: guardrailConstruct.guardrail,
            knowledgeBases: [props.knowledgeBase],
        });

        // Integrates the lead collection action group into the agent
        this.agent.addActionGroup(leadCollectionConstruct.actionGroup);

        // Create an alias for the current environment instead of using testAlias
        // This enables production-grade deployments with version control
        this.agentAlias = new bedrock.AgentAlias(this, 'AgentAlias', {
            agent: this.agent,
            aliasName: config.stage,
            description: `${config.stage} environment alias - Version ${config.version} deployed at ${config.deploymentTimestamp}`,
        });
    }

    /**
     * Loads the agent prompt from file.
     * @returns Processed prompt text with all template variables replaced
     */
    private loadAndProcessPrompt(config: AppSettings): string {
        const promptPath = path.join(__dirname, '../../../assets/prompts/instructions_prompt.txt');

        // Check if the file exists
        if (!fs.existsSync(promptPath)) {
            throw new Error(
                `Agent instruction must exist, please create them at assets/prompts/instructions_prompt.txt`
            );
        }

        return this.replaceTemplateVariables(fs.readFileSync(promptPath, 'utf8'), config);
    }

    /**
     * Replaces template variables in the prompt text with actual config values.
     * @param promptText Raw prompt text with template variables
     * @returns Prompt text with variables replaced
     */
    private replaceTemplateVariables(promptText: string, config: AppSettings): string {
        return promptText
            .replace(/{appName}/g, config.appName)
            .replace(/{agentName}/g, config.agentName)
            .replace(/{domain}/g, config.domain)
            .replace(/{knowledgeBaseName}/g, `${config.agentName}-KB`);
    }
}
