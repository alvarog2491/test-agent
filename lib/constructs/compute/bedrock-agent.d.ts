import { bedrock } from '@cdklabs/generative-ai-cdk-constructs';
import { Construct } from 'constructs';
export interface BedrockAgentConstructProps {
    readonly knowledgeBase: bedrock.IVectorKnowledgeBase;
    readonly leadTableArn: string;
    readonly leadTableName: string;
}
export declare class BedrockAgentConstruct extends Construct {
    readonly agent: bedrock.Agent;
    readonly agentAlias: bedrock.IAgentAlias;
    constructor(scope: Construct, id: string, props: BedrockAgentConstructProps);
    /**
     * Loads the agent prompt from file.
     * @returns Processed prompt text with all template variables replaced
     */
    private loadAndProcessPrompt;
    /**
     * Replaces template variables in the prompt text with actual config values.
     * @param promptText Raw prompt text with template variables
     * @returns Prompt text with variables replaced
     */
    private replaceTemplateVariables;
}
