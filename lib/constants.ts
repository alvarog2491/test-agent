import * as lambda from 'aws-cdk-lib/aws-lambda';

export const APP_NAME = 'enterprise-bedrock-agent';
export const AGENT_NAME = 'bedrock-agent';
export const DOMAIN = 'general business';

// Lambda Runtime - must match version in .python-version for CI/CD consistency
// When updating, also update: .python-version
export const LAMBDA_PYTHON_RUNTIME = lambda.Runtime.PYTHON_3_12;

// Prompt
export const PROMPT_MIN_LENGTH = 1;
export const PROMPT_MAX_LENGTH = 500;

// Models
//export const AGENT_MODEL = 'anthropic.claude-3-5-sonnet-20240620-v1:0';
export const AGENT_MODEL = 'anthropic.claude-3-haiku-20240307-v1:0';


export const EMBEDDING_MODEL = 'amazon.titan-embed-text-v1';


export const EVALUATION_JUDGE_MODEL = 'anthropic.claude-sonnet-4-5-20250929-v1:0';


// API
export const ALLOWED_ORIGINS_DEV = ['http://localhost:3000', 'https://dev.yourdomain.com'];
export const ALLOWED_ORIGINS_PROD = ['https://app.yourproductiondomain.com'];

