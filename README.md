# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template

## Usage

After deploying the stack, you will receive an Output containing the API Gateway URL (e.g., `EnterpriseBedrockAgentStack.ApiGatewayEndpoint...`).

### Invoke the Agent

You can invoke the Bedrock Agent using `curl` by sending a POST request to the API endpoint.

**Request Body Parameters:**
*   `prompt`: (Required) The text prompt to send to the agent.
*   `sessionId`: (Optional) A unique identifier for the session. If not provided, a new session ID will be generated.

**Example:**

```bash
# Replace with your actual API Gateway URL
API_URL="https://<api-id>.execute-api.us-east-1.amazonaws.com/prod/"

curl -X POST "${API_URL}" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What can you tell me about the library?",
    "sessionId": "my-session-123"
  }'
```

**Response:**

The response will contain the agent's answer and the session ID.

```json
{
  "response": "The library contains...",
  "sessionId": "my-session-123"
}
```
