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
exports.InterfaceStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const config_manager_1 = require("../config-manager");
const api_gateway_1 = require("../constructs/interface/api-gateway");
// Stack that exposes the Bedrock agent via API Gateway
class InterfaceStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const config = config_manager_1.ConfigManager.getInstance().config;
        // Provisions API Gateway to handle agent interaction requests
        new api_gateway_1.ApiGatewayConstruct(this, 'ApiGateway', {
            agent: props.agent,
            agentAlias: props.agentAlias,
            stage: config.stage,
        });
    }
}
exports.InterfaceStack = InterfaceStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJmYWNlLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaW50ZXJmYWNlLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLGlEQUFtQztBQUVuQyxzREFBa0Q7QUFDbEQscUVBQTBFO0FBTzFFLHVEQUF1RDtBQUN2RCxNQUFhLGNBQWUsU0FBUSxHQUFHLENBQUMsS0FBSztJQUN6QyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQTBCO1FBQ2hFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3hCLE1BQU0sTUFBTSxHQUFHLDhCQUFhLENBQUMsV0FBVyxFQUFFLENBQUMsTUFBTSxDQUFDO1FBRWxELDhEQUE4RDtRQUM5RCxJQUFJLGlDQUFtQixDQUFDLElBQUksRUFBRSxZQUFZLEVBQUU7WUFDeEMsS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLO1lBQ2xCLFVBQVUsRUFBRSxLQUFLLENBQUMsVUFBVTtZQUM1QixLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUs7U0FDdEIsQ0FBQyxDQUFDO0lBR1AsQ0FBQztDQUNKO0FBZEQsd0NBY0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBiZWRyb2NrIH0gZnJvbSAnQGNka2xhYnMvZ2VuZXJhdGl2ZS1haS1jZGstY29uc3RydWN0cyc7XG5pbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgeyBDb25maWdNYW5hZ2VyIH0gZnJvbSAnLi4vY29uZmlnLW1hbmFnZXInO1xuaW1wb3J0IHsgQXBpR2F0ZXdheUNvbnN0cnVjdCB9IGZyb20gJy4uL2NvbnN0cnVjdHMvaW50ZXJmYWNlL2FwaS1nYXRld2F5JztcblxuZXhwb3J0IGludGVyZmFjZSBJbnRlcmZhY2VTdGFja1Byb3BzIGV4dGVuZHMgY2RrLlN0YWNrUHJvcHMge1xuICAgIHJlYWRvbmx5IGFnZW50OiBiZWRyb2NrLklBZ2VudDtcbiAgICByZWFkb25seSBhZ2VudEFsaWFzOiBiZWRyb2NrLklBZ2VudEFsaWFzO1xufVxuXG4vLyBTdGFjayB0aGF0IGV4cG9zZXMgdGhlIEJlZHJvY2sgYWdlbnQgdmlhIEFQSSBHYXRld2F5XG5leHBvcnQgY2xhc3MgSW50ZXJmYWNlU3RhY2sgZXh0ZW5kcyBjZGsuU3RhY2sge1xuICAgIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBJbnRlcmZhY2VTdGFja1Byb3BzKSB7XG4gICAgICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuICAgICAgICBjb25zdCBjb25maWcgPSBDb25maWdNYW5hZ2VyLmdldEluc3RhbmNlKCkuY29uZmlnO1xuXG4gICAgICAgIC8vIFByb3Zpc2lvbnMgQVBJIEdhdGV3YXkgdG8gaGFuZGxlIGFnZW50IGludGVyYWN0aW9uIHJlcXVlc3RzXG4gICAgICAgIG5ldyBBcGlHYXRld2F5Q29uc3RydWN0KHRoaXMsICdBcGlHYXRld2F5Jywge1xuICAgICAgICAgICAgYWdlbnQ6IHByb3BzLmFnZW50LFxuICAgICAgICAgICAgYWdlbnRBbGlhczogcHJvcHMuYWdlbnRBbGlhcyxcbiAgICAgICAgICAgIHN0YWdlOiBjb25maWcuc3RhZ2UsXG4gICAgICAgIH0pO1xuXG5cbiAgICB9XG59XG4iXX0=