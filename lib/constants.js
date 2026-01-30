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
exports.ALLOWED_ORIGINS_PROD = exports.ALLOWED_ORIGINS_DEV = exports.EVALUATION_JUDGE_OUTPUT_TOKEN_PRICE = exports.EVALUATION_JUDGE_INPUT_TOKEN_PRICE = exports.EVALUATION_JUDGE_MODEL = exports.EMBEDDING_MODEL_OUTPUT_TOKEN_PRICE = exports.EMBEDDING_MODEL_INPUT_TOKEN_PRICE = exports.EMBEDDING_MODEL = exports.AGENT_MODEL_OUTPUT_TOKEN_PRICE = exports.AGENT_MODEL_INPUT_TOKEN_PRICE = exports.AGENT_MODEL = exports.PROMPT_MAX_LENGTH = exports.PROMPT_MIN_LENGTH = exports.LAMBDA_PYTHON_RUNTIME = exports.DOMAIN = exports.AGENT_NAME = exports.APP_NAME = void 0;
const lambda = __importStar(require("aws-cdk-lib/aws-lambda"));
exports.APP_NAME = 'enterprise-bedrock-agent';
exports.AGENT_NAME = 'bedrock-agent';
exports.DOMAIN = 'general business';
// Lambda Runtime - must match version in .python-version for CI/CD consistency
// When updating, also update: .python-version
exports.LAMBDA_PYTHON_RUNTIME = lambda.Runtime.PYTHON_3_12;
// Prompt
exports.PROMPT_MIN_LENGTH = 1;
exports.PROMPT_MAX_LENGTH = 500;
// Models
//export const AGENT_MODEL = 'anthropic.claude-3-5-sonnet-20240620-v1:0';
exports.AGENT_MODEL = 'anthropic.claude-3-haiku-20240307-v1:0';
exports.AGENT_MODEL_INPUT_TOKEN_PRICE = 0.0008;
exports.AGENT_MODEL_OUTPUT_TOKEN_PRICE = 0.0032;
exports.EMBEDDING_MODEL = 'amazon.titan-embed-text-v1';
exports.EMBEDDING_MODEL_INPUT_TOKEN_PRICE = 0.0009;
exports.EMBEDDING_MODEL_OUTPUT_TOKEN_PRICE = 0.0022;
exports.EVALUATION_JUDGE_MODEL = 'anthropic.claude-sonnet-4-5-20250929-v1:0';
exports.EVALUATION_JUDGE_INPUT_TOKEN_PRICE = 0.0078;
exports.EVALUATION_JUDGE_OUTPUT_TOKEN_PRICE = 0.0042;
// API
exports.ALLOWED_ORIGINS_DEV = ['http://localhost:3000', 'https://dev.yourdomain.com'];
exports.ALLOWED_ORIGINS_PROD = ['https://app.yourproductiondomain.com'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY29uc3RhbnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLCtEQUFpRDtBQUVwQyxRQUFBLFFBQVEsR0FBRywwQkFBMEIsQ0FBQztBQUN0QyxRQUFBLFVBQVUsR0FBRyxlQUFlLENBQUM7QUFDN0IsUUFBQSxNQUFNLEdBQUcsa0JBQWtCLENBQUM7QUFFekMsK0VBQStFO0FBQy9FLDhDQUE4QztBQUNqQyxRQUFBLHFCQUFxQixHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDO0FBRWhFLFNBQVM7QUFDSSxRQUFBLGlCQUFpQixHQUFHLENBQUMsQ0FBQztBQUN0QixRQUFBLGlCQUFpQixHQUFHLEdBQUcsQ0FBQztBQUVyQyxTQUFTO0FBQ1QseUVBQXlFO0FBQzVELFFBQUEsV0FBVyxHQUFHLHdDQUF3QyxDQUFDO0FBQ3ZELFFBQUEsNkJBQTZCLEdBQUcsTUFBTSxDQUFDO0FBQ3ZDLFFBQUEsOEJBQThCLEdBQUcsTUFBTSxDQUFDO0FBRXhDLFFBQUEsZUFBZSxHQUFHLDRCQUE0QixDQUFDO0FBQy9DLFFBQUEsaUNBQWlDLEdBQUcsTUFBTSxDQUFDO0FBQzNDLFFBQUEsa0NBQWtDLEdBQUcsTUFBTSxDQUFDO0FBRTVDLFFBQUEsc0JBQXNCLEdBQUcsMkNBQTJDLENBQUM7QUFDckUsUUFBQSxrQ0FBa0MsR0FBRyxNQUFNLENBQUM7QUFDNUMsUUFBQSxtQ0FBbUMsR0FBRyxNQUFNLENBQUM7QUFFMUQsTUFBTTtBQUNPLFFBQUEsbUJBQW1CLEdBQUcsQ0FBQyx1QkFBdUIsRUFBRSw0QkFBNEIsQ0FBQyxDQUFDO0FBQzlFLFFBQUEsb0JBQW9CLEdBQUcsQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgbGFtYmRhIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEnO1xuXG5leHBvcnQgY29uc3QgQVBQX05BTUUgPSAnZW50ZXJwcmlzZS1iZWRyb2NrLWFnZW50JztcbmV4cG9ydCBjb25zdCBBR0VOVF9OQU1FID0gJ2JlZHJvY2stYWdlbnQnO1xuZXhwb3J0IGNvbnN0IERPTUFJTiA9ICdnZW5lcmFsIGJ1c2luZXNzJztcblxuLy8gTGFtYmRhIFJ1bnRpbWUgLSBtdXN0IG1hdGNoIHZlcnNpb24gaW4gLnB5dGhvbi12ZXJzaW9uIGZvciBDSS9DRCBjb25zaXN0ZW5jeVxuLy8gV2hlbiB1cGRhdGluZywgYWxzbyB1cGRhdGU6IC5weXRob24tdmVyc2lvblxuZXhwb3J0IGNvbnN0IExBTUJEQV9QWVRIT05fUlVOVElNRSA9IGxhbWJkYS5SdW50aW1lLlBZVEhPTl8zXzEyO1xuXG4vLyBQcm9tcHRcbmV4cG9ydCBjb25zdCBQUk9NUFRfTUlOX0xFTkdUSCA9IDE7XG5leHBvcnQgY29uc3QgUFJPTVBUX01BWF9MRU5HVEggPSA1MDA7XG5cbi8vIE1vZGVsc1xuLy9leHBvcnQgY29uc3QgQUdFTlRfTU9ERUwgPSAnYW50aHJvcGljLmNsYXVkZS0zLTUtc29ubmV0LTIwMjQwNjIwLXYxOjAnO1xuZXhwb3J0IGNvbnN0IEFHRU5UX01PREVMID0gJ2FudGhyb3BpYy5jbGF1ZGUtMy1oYWlrdS0yMDI0MDMwNy12MTowJztcbmV4cG9ydCBjb25zdCBBR0VOVF9NT0RFTF9JTlBVVF9UT0tFTl9QUklDRSA9IDAuMDAwODtcbmV4cG9ydCBjb25zdCBBR0VOVF9NT0RFTF9PVVRQVVRfVE9LRU5fUFJJQ0UgPSAwLjAwMzI7XG5cbmV4cG9ydCBjb25zdCBFTUJFRERJTkdfTU9ERUwgPSAnYW1hem9uLnRpdGFuLWVtYmVkLXRleHQtdjEnO1xuZXhwb3J0IGNvbnN0IEVNQkVERElOR19NT0RFTF9JTlBVVF9UT0tFTl9QUklDRSA9IDAuMDAwOTtcbmV4cG9ydCBjb25zdCBFTUJFRERJTkdfTU9ERUxfT1VUUFVUX1RPS0VOX1BSSUNFID0gMC4wMDIyO1xuXG5leHBvcnQgY29uc3QgRVZBTFVBVElPTl9KVURHRV9NT0RFTCA9ICdhbnRocm9waWMuY2xhdWRlLXNvbm5ldC00LTUtMjAyNTA5MjktdjE6MCc7XG5leHBvcnQgY29uc3QgRVZBTFVBVElPTl9KVURHRV9JTlBVVF9UT0tFTl9QUklDRSA9IDAuMDA3ODtcbmV4cG9ydCBjb25zdCBFVkFMVUFUSU9OX0pVREdFX09VVFBVVF9UT0tFTl9QUklDRSA9IDAuMDA0MjtcblxuLy8gQVBJXG5leHBvcnQgY29uc3QgQUxMT1dFRF9PUklHSU5TX0RFViA9IFsnaHR0cDovL2xvY2FsaG9zdDozMDAwJywgJ2h0dHBzOi8vZGV2LnlvdXJkb21haW4uY29tJ107XG5leHBvcnQgY29uc3QgQUxMT1dFRF9PUklHSU5TX1BST0QgPSBbJ2h0dHBzOi8vYXBwLnlvdXJwcm9kdWN0aW9uZG9tYWluLmNvbSddO1xuXG4iXX0=