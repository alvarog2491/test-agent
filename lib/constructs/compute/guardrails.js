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
exports.GuardrailsConstruct = void 0;
const generative_ai_cdk_constructs_1 = require("@cdklabs/generative-ai-cdk-constructs");
const constructs_1 = require("constructs");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class GuardrailsConstruct extends constructs_1.Construct {
    guardrail;
    constructor(scope, id, props) {
        super(scope, id);
        const guardrailPath = path.join(__dirname, '../../../assets/guardrails/default-guardrail.json');
        // Check if the file exists
        if (!fs.existsSync(guardrailPath)) {
            throw new Error(`Guardrail must exist, please create them at assets/guardrails/default-guardrail.json`);
        }
        const guardrailConfig = JSON.parse(fs.readFileSync(guardrailPath, 'utf8'));
        this.guardrail = new generative_ai_cdk_constructs_1.bedrock.Guardrail(this, 'AgentGuardrail', {
            name: guardrailConfig.name,
            description: guardrailConfig.description,
            blockedInputMessaging: guardrailConfig.blockedInputMessaging,
            blockedOutputsMessaging: guardrailConfig.blockedOutputsMessaging,
            contentFilters: guardrailConfig.contentPolicyConfig.filtersConfig.map((filter) => ({
                type: filter.type,
                inputStrength: filter.inputStrength,
                outputStrength: filter.outputStrength,
            })),
        });
    }
}
exports.GuardrailsConstruct = GuardrailsConstruct;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3VhcmRyYWlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImd1YXJkcmFpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsd0ZBQWdFO0FBQ2hFLDJDQUF1QztBQUN2Qyx1Q0FBeUI7QUFDekIsMkNBQTZCO0FBSzdCLE1BQWEsbUJBQW9CLFNBQVEsc0JBQVM7SUFDOUIsU0FBUyxDQUFvQjtJQUU3QyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQStCO1FBQ3JFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFakIsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsbURBQW1ELENBQUMsQ0FBQztRQUVoRywyQkFBMkI7UUFDM0IsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQztZQUNoQyxNQUFNLElBQUksS0FBSyxDQUNYLHNGQUFzRixDQUN6RixDQUFDO1FBQ04sQ0FBQztRQUNELE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUUzRSxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksc0NBQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFO1lBQzNELElBQUksRUFBRSxlQUFlLENBQUMsSUFBSTtZQUMxQixXQUFXLEVBQUUsZUFBZSxDQUFDLFdBQVc7WUFDeEMscUJBQXFCLEVBQUUsZUFBZSxDQUFDLHFCQUFxQjtZQUM1RCx1QkFBdUIsRUFBRSxlQUFlLENBQUMsdUJBQXVCO1lBQ2hFLGNBQWMsRUFBRSxlQUFlLENBQUMsbUJBQW1CLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQVcsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDcEYsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJO2dCQUNqQixhQUFhLEVBQUUsTUFBTSxDQUFDLGFBQWE7Z0JBQ25DLGNBQWMsRUFBRSxNQUFNLENBQUMsY0FBYzthQUN4QyxDQUFDLENBQUM7U0FDTixDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUE1QkQsa0RBNEJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYmVkcm9jayB9IGZyb20gJ0BjZGtsYWJzL2dlbmVyYXRpdmUtYWktY2RrLWNvbnN0cnVjdHMnO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEd1YXJkcmFpbHNDb25zdHJ1Y3RQcm9wcyB7XG59XG5cbmV4cG9ydCBjbGFzcyBHdWFyZHJhaWxzQ29uc3RydWN0IGV4dGVuZHMgQ29uc3RydWN0IHtcbiAgICBwdWJsaWMgcmVhZG9ubHkgZ3VhcmRyYWlsOiBiZWRyb2NrLkd1YXJkcmFpbDtcblxuICAgIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBHdWFyZHJhaWxzQ29uc3RydWN0UHJvcHMpIHtcbiAgICAgICAgc3VwZXIoc2NvcGUsIGlkKTtcblxuICAgICAgICBjb25zdCBndWFyZHJhaWxQYXRoID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uLy4uLy4uL2Fzc2V0cy9ndWFyZHJhaWxzL2RlZmF1bHQtZ3VhcmRyYWlsLmpzb24nKTtcblxuICAgICAgICAvLyBDaGVjayBpZiB0aGUgZmlsZSBleGlzdHNcbiAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKGd1YXJkcmFpbFBhdGgpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgYEd1YXJkcmFpbCBtdXN0IGV4aXN0LCBwbGVhc2UgY3JlYXRlIHRoZW0gYXQgYXNzZXRzL2d1YXJkcmFpbHMvZGVmYXVsdC1ndWFyZHJhaWwuanNvbmBcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZ3VhcmRyYWlsQ29uZmlnID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMoZ3VhcmRyYWlsUGF0aCwgJ3V0ZjgnKSk7XG5cbiAgICAgICAgdGhpcy5ndWFyZHJhaWwgPSBuZXcgYmVkcm9jay5HdWFyZHJhaWwodGhpcywgJ0FnZW50R3VhcmRyYWlsJywge1xuICAgICAgICAgICAgbmFtZTogZ3VhcmRyYWlsQ29uZmlnLm5hbWUsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogZ3VhcmRyYWlsQ29uZmlnLmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgYmxvY2tlZElucHV0TWVzc2FnaW5nOiBndWFyZHJhaWxDb25maWcuYmxvY2tlZElucHV0TWVzc2FnaW5nLFxuICAgICAgICAgICAgYmxvY2tlZE91dHB1dHNNZXNzYWdpbmc6IGd1YXJkcmFpbENvbmZpZy5ibG9ja2VkT3V0cHV0c01lc3NhZ2luZyxcbiAgICAgICAgICAgIGNvbnRlbnRGaWx0ZXJzOiBndWFyZHJhaWxDb25maWcuY29udGVudFBvbGljeUNvbmZpZy5maWx0ZXJzQ29uZmlnLm1hcCgoZmlsdGVyOiBhbnkpID0+ICh7XG4gICAgICAgICAgICAgICAgdHlwZTogZmlsdGVyLnR5cGUsXG4gICAgICAgICAgICAgICAgaW5wdXRTdHJlbmd0aDogZmlsdGVyLmlucHV0U3RyZW5ndGgsXG4gICAgICAgICAgICAgICAgb3V0cHV0U3RyZW5ndGg6IGZpbHRlci5vdXRwdXRTdHJlbmd0aCxcbiAgICAgICAgICAgIH0pKSxcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIl19