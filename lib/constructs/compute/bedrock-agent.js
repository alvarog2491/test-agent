"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BedrockAgentConstruct = void 0;
// lib/constructs/bedrock-agent-construct.ts
const generative_ai_cdk_constructs_1 = require("@cdklabs/generative-ai-cdk-constructs");
const constructs_1 = require("constructs");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const config_manager_1 = require("../../config-manager");
const guardrails_1 = require("./guardrails");
const lead_collection_1 = require("./lead-collection");
// Construct that assembles the Bedrock agent with guardrails, KB, and action groups
class BedrockAgentConstruct extends constructs_1.Construct {
    agent;
    agentAlias;
    constructor(scope, id, props) {
        super(scope, id);
        // Load Agent Configuration
        const config = config_manager_1.ConfigManager.getInstance().config;
        const promptText = this.loadAndProcessPrompt();
        const guardrailConstruct = new guardrails_1.GuardrailsConstruct(this, 'Guardrails', {});
        const leadCollectionConstruct = new lead_collection_1.LeadCollectionConstruct(this, 'LeadCollection', {
            leadTableArn: props.leadTableArn,
            leadTableName: props.leadTableName,
        });
        const agentModel = new generative_ai_cdk_constructs_1.bedrock.BedrockFoundationModel(config.agentModel);
        this.agent = new generative_ai_cdk_constructs_1.bedrock.Agent(this, 'Agent', {
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
        // Expose the test alias for development/testing
        this.agentAlias = this.agent.testAlias;
    }
    /**
     * Loads the agent prompt from file.
     * @returns Processed prompt text with all template variables replaced
     */
    loadAndProcessPrompt() {
        const promptPath = path.join(__dirname, '../../../assets/prompts/instructions_prompt.txt');
        // Check if the file exists
        if (!fs.existsSync(promptPath)) {
            throw new Error(`Agent instruction must exist, please create them at assets/prompts/instructions_prompt.txt`);
        }
        return this.replaceTemplateVariables(fs.readFileSync(promptPath, 'utf8'));
    }
    /**
     * Replaces template variables in the prompt text with actual config values.
     * @param promptText Raw prompt text with template variables
     * @returns Prompt text with variables replaced
     */
    replaceTemplateVariables(promptText) {
        const config = config_manager_1.ConfigManager.getInstance().config;
        return promptText
            .replace(/{appName}/g, config.appName)
            .replace(/{agentName}/g, config.agentName)
            .replace(/{domain}/g, config.domain)
            .replace(/{knowledgeBaseName}/g, `${config.agentName}-KB`);
    }
}
exports.BedrockAgentConstruct = BedrockAgentConstruct;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmVkcm9jay1hZ2VudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJlZHJvY2stYWdlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNENBQTRDO0FBQzVDLHdGQUFnRTtBQUNoRSwyQ0FBdUM7QUFDdkMsdUNBQXlCO0FBQ3pCLDJDQUE2QjtBQUM3Qix5REFBcUQ7QUFDckQsNkNBQW1EO0FBQ25ELHVEQUE0RDtBQVM1RCxvRkFBb0Y7QUFDcEYsTUFBYSxxQkFBc0IsU0FBUSxzQkFBUztJQUNoQyxLQUFLLENBQWdCO0lBQ3JCLFVBQVUsQ0FBc0I7SUFFaEQsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFpQztRQUN2RSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRWpCLDJCQUEyQjtRQUMzQixNQUFNLE1BQU0sR0FBRyw4QkFBYSxDQUFDLFdBQVcsRUFBRSxDQUFDLE1BQU0sQ0FBQztRQUNsRCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztRQUMvQyxNQUFNLGtCQUFrQixHQUFHLElBQUksZ0NBQW1CLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMzRSxNQUFNLHVCQUF1QixHQUFHLElBQUkseUNBQXVCLENBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFO1lBQ2hGLFlBQVksRUFBRSxLQUFLLENBQUMsWUFBWTtZQUNoQyxhQUFhLEVBQUUsS0FBSyxDQUFDLGFBQWE7U0FDckMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxVQUFVLEdBQUcsSUFBSSxzQ0FBTyxDQUFDLHNCQUFzQixDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUV6RSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksc0NBQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRTtZQUMxQyxJQUFJLEVBQUUsTUFBTSxDQUFDLFNBQVM7WUFDdEIsV0FBVyxFQUFFLFVBQVU7WUFDdkIsZUFBZSxFQUFFLFVBQVU7WUFDM0Isa0JBQWtCLEVBQUUsSUFBSTtZQUN4QixnQkFBZ0IsRUFBRSxJQUFJO1lBQ3RCLFNBQVMsRUFBRSxrQkFBa0IsQ0FBQyxTQUFTO1lBQ3ZDLGNBQWMsRUFBRSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUM7U0FDeEMsQ0FBQyxDQUFDO1FBRUgsNkRBQTZEO1FBQzdELElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLHVCQUF1QixDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRS9ELGdEQUFnRDtRQUNoRCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDO0lBQzNDLENBQUM7SUFFRDs7O09BR0c7SUFDSyxvQkFBb0I7UUFDeEIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsaURBQWlELENBQUMsQ0FBQztRQUUzRiwyQkFBMkI7UUFDM0IsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztZQUM3QixNQUFNLElBQUksS0FBSyxDQUNYLDRGQUE0RixDQUMvRixDQUFDO1FBQ04sQ0FBQztRQUVELE9BQU8sSUFBSSxDQUFDLHdCQUF3QixDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDOUUsQ0FBQztJQUVEOzs7O09BSUc7SUFDSyx3QkFBd0IsQ0FBQyxVQUFrQjtRQUMvQyxNQUFNLE1BQU0sR0FBRyw4QkFBYSxDQUFDLFdBQVcsRUFBRSxDQUFDLE1BQU0sQ0FBQztRQUNsRCxPQUFPLFVBQVU7YUFDWixPQUFPLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUM7YUFDckMsT0FBTyxDQUFDLGNBQWMsRUFBRSxNQUFNLENBQUMsU0FBUyxDQUFDO2FBQ3pDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQzthQUNuQyxPQUFPLENBQUMsc0JBQXNCLEVBQUUsR0FBRyxNQUFNLENBQUMsU0FBUyxLQUFLLENBQUMsQ0FBQztJQUNuRSxDQUFDO0NBQ0o7QUFqRUQsc0RBaUVDIiwic291cmNlc0NvbnRlbnQiOlsiLy8gbGliL2NvbnN0cnVjdHMvYmVkcm9jay1hZ2VudC1jb25zdHJ1Y3QudHNcbmltcG9ydCB7IGJlZHJvY2sgfSBmcm9tICdAY2RrbGFicy9nZW5lcmF0aXZlLWFpLWNkay1jb25zdHJ1Y3RzJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IENvbmZpZ01hbmFnZXIgfSBmcm9tICcuLi8uLi9jb25maWctbWFuYWdlcic7XG5pbXBvcnQgeyBHdWFyZHJhaWxzQ29uc3RydWN0IH0gZnJvbSAnLi9ndWFyZHJhaWxzJztcbmltcG9ydCB7IExlYWRDb2xsZWN0aW9uQ29uc3RydWN0IH0gZnJvbSAnLi9sZWFkLWNvbGxlY3Rpb24nO1xuXG5cbmV4cG9ydCBpbnRlcmZhY2UgQmVkcm9ja0FnZW50Q29uc3RydWN0UHJvcHMge1xuICAgIHJlYWRvbmx5IGtub3dsZWRnZUJhc2U6IGJlZHJvY2suSVZlY3Rvcktub3dsZWRnZUJhc2U7XG4gICAgcmVhZG9ubHkgbGVhZFRhYmxlQXJuOiBzdHJpbmc7XG4gICAgcmVhZG9ubHkgbGVhZFRhYmxlTmFtZTogc3RyaW5nO1xufVxuXG4vLyBDb25zdHJ1Y3QgdGhhdCBhc3NlbWJsZXMgdGhlIEJlZHJvY2sgYWdlbnQgd2l0aCBndWFyZHJhaWxzLCBLQiwgYW5kIGFjdGlvbiBncm91cHNcbmV4cG9ydCBjbGFzcyBCZWRyb2NrQWdlbnRDb25zdHJ1Y3QgZXh0ZW5kcyBDb25zdHJ1Y3Qge1xuICAgIHB1YmxpYyByZWFkb25seSBhZ2VudDogYmVkcm9jay5BZ2VudDtcbiAgICBwdWJsaWMgcmVhZG9ubHkgYWdlbnRBbGlhczogYmVkcm9jay5JQWdlbnRBbGlhcztcblxuICAgIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBCZWRyb2NrQWdlbnRDb25zdHJ1Y3RQcm9wcykge1xuICAgICAgICBzdXBlcihzY29wZSwgaWQpO1xuXG4gICAgICAgIC8vIExvYWQgQWdlbnQgQ29uZmlndXJhdGlvblxuICAgICAgICBjb25zdCBjb25maWcgPSBDb25maWdNYW5hZ2VyLmdldEluc3RhbmNlKCkuY29uZmlnO1xuICAgICAgICBjb25zdCBwcm9tcHRUZXh0ID0gdGhpcy5sb2FkQW5kUHJvY2Vzc1Byb21wdCgpO1xuICAgICAgICBjb25zdCBndWFyZHJhaWxDb25zdHJ1Y3QgPSBuZXcgR3VhcmRyYWlsc0NvbnN0cnVjdCh0aGlzLCAnR3VhcmRyYWlscycsIHt9KTtcbiAgICAgICAgY29uc3QgbGVhZENvbGxlY3Rpb25Db25zdHJ1Y3QgPSBuZXcgTGVhZENvbGxlY3Rpb25Db25zdHJ1Y3QodGhpcywgJ0xlYWRDb2xsZWN0aW9uJywge1xuICAgICAgICAgICAgbGVhZFRhYmxlQXJuOiBwcm9wcy5sZWFkVGFibGVBcm4sXG4gICAgICAgICAgICBsZWFkVGFibGVOYW1lOiBwcm9wcy5sZWFkVGFibGVOYW1lLFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBhZ2VudE1vZGVsID0gbmV3IGJlZHJvY2suQmVkcm9ja0ZvdW5kYXRpb25Nb2RlbChjb25maWcuYWdlbnRNb2RlbCk7XG5cbiAgICAgICAgdGhpcy5hZ2VudCA9IG5ldyBiZWRyb2NrLkFnZW50KHRoaXMsICdBZ2VudCcsIHtcbiAgICAgICAgICAgIG5hbWU6IGNvbmZpZy5hZ2VudE5hbWUsXG4gICAgICAgICAgICBpbnN0cnVjdGlvbjogcHJvbXB0VGV4dCxcbiAgICAgICAgICAgIGZvdW5kYXRpb25Nb2RlbDogYWdlbnRNb2RlbCxcbiAgICAgICAgICAgIHNob3VsZFByZXBhcmVBZ2VudDogdHJ1ZSxcbiAgICAgICAgICAgIHVzZXJJbnB1dEVuYWJsZWQ6IHRydWUsXG4gICAgICAgICAgICBndWFyZHJhaWw6IGd1YXJkcmFpbENvbnN0cnVjdC5ndWFyZHJhaWwsXG4gICAgICAgICAgICBrbm93bGVkZ2VCYXNlczogW3Byb3BzLmtub3dsZWRnZUJhc2VdLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBJbnRlZ3JhdGVzIHRoZSBsZWFkIGNvbGxlY3Rpb24gYWN0aW9uIGdyb3VwIGludG8gdGhlIGFnZW50XG4gICAgICAgIHRoaXMuYWdlbnQuYWRkQWN0aW9uR3JvdXAobGVhZENvbGxlY3Rpb25Db25zdHJ1Y3QuYWN0aW9uR3JvdXApO1xuXG4gICAgICAgIC8vIEV4cG9zZSB0aGUgdGVzdCBhbGlhcyBmb3IgZGV2ZWxvcG1lbnQvdGVzdGluZ1xuICAgICAgICB0aGlzLmFnZW50QWxpYXMgPSB0aGlzLmFnZW50LnRlc3RBbGlhcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBMb2FkcyB0aGUgYWdlbnQgcHJvbXB0IGZyb20gZmlsZS5cbiAgICAgKiBAcmV0dXJucyBQcm9jZXNzZWQgcHJvbXB0IHRleHQgd2l0aCBhbGwgdGVtcGxhdGUgdmFyaWFibGVzIHJlcGxhY2VkXG4gICAgICovXG4gICAgcHJpdmF0ZSBsb2FkQW5kUHJvY2Vzc1Byb21wdCgpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBwcm9tcHRQYXRoID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uLy4uLy4uL2Fzc2V0cy9wcm9tcHRzL2luc3RydWN0aW9uc19wcm9tcHQudHh0Jyk7XG5cbiAgICAgICAgLy8gQ2hlY2sgaWYgdGhlIGZpbGUgZXhpc3RzXG4gICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhwcm9tcHRQYXRoKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgIGBBZ2VudCBpbnN0cnVjdGlvbiBtdXN0IGV4aXN0LCBwbGVhc2UgY3JlYXRlIHRoZW0gYXQgYXNzZXRzL3Byb21wdHMvaW5zdHJ1Y3Rpb25zX3Byb21wdC50eHRgXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMucmVwbGFjZVRlbXBsYXRlVmFyaWFibGVzKGZzLnJlYWRGaWxlU3luYyhwcm9tcHRQYXRoLCAndXRmOCcpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXBsYWNlcyB0ZW1wbGF0ZSB2YXJpYWJsZXMgaW4gdGhlIHByb21wdCB0ZXh0IHdpdGggYWN0dWFsIGNvbmZpZyB2YWx1ZXMuXG4gICAgICogQHBhcmFtIHByb21wdFRleHQgUmF3IHByb21wdCB0ZXh0IHdpdGggdGVtcGxhdGUgdmFyaWFibGVzXG4gICAgICogQHJldHVybnMgUHJvbXB0IHRleHQgd2l0aCB2YXJpYWJsZXMgcmVwbGFjZWRcbiAgICAgKi9cbiAgICBwcml2YXRlIHJlcGxhY2VUZW1wbGF0ZVZhcmlhYmxlcyhwcm9tcHRUZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBjb25maWcgPSBDb25maWdNYW5hZ2VyLmdldEluc3RhbmNlKCkuY29uZmlnO1xuICAgICAgICByZXR1cm4gcHJvbXB0VGV4dFxuICAgICAgICAgICAgLnJlcGxhY2UoL3thcHBOYW1lfS9nLCBjb25maWcuYXBwTmFtZSlcbiAgICAgICAgICAgIC5yZXBsYWNlKC97YWdlbnROYW1lfS9nLCBjb25maWcuYWdlbnROYW1lKVxuICAgICAgICAgICAgLnJlcGxhY2UoL3tkb21haW59L2csIGNvbmZpZy5kb21haW4pXG4gICAgICAgICAgICAucmVwbGFjZSgve2tub3dsZWRnZUJhc2VOYW1lfS9nLCBgJHtjb25maWcuYWdlbnROYW1lfS1LQmApO1xuICAgIH1cbn1cbiJdfQ==