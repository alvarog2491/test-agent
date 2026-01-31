# layers to build the application

Following the [AWS CDK Best Practices](https://docs.aws.amazon.com/cdk/v2/guide/best-practices.html#best-practices-organization:~:text=Separate%20your%20application%20into%20multiple%20stacks%20as%20dictated%20by%20deployment%20requirements
), we are utilizing Construct Composition for logical modeling and separate Stacks for deployment. This strategy effectively isolates stateful resources (S3, Secrets) from stateless logic (Bedrock Agents), allowing us to enforce termination protection on critical data.

Decoupling the architecture this way aligns our infrastructure with its natural update frequency. It grants us the 'freedom to fail', we can rapidly iterate on or even destroy the volatile AI 'brain' (Bedrock Agents) as needed without ever risking the persistent 'source of truth' (S3, Secrets). This modularity ensures maximum operational safety while significantly accelerating deployment cycles.

By isolating the Interface and Observation layers, we ensure that changes to user-facing endpoints or internal dashboards do not interfere with the core AI reasoning logic or the underlying data persistence.

## Layer 0: The Foundation (Network Layer)
Resources: VPC, Subnets, NAT Gateways, Security Groups, VPC Endpoints.
Change Frequency: Almost never (once every few months/years).
Why it exists: If you want your Lambda or SageMaker to access a private database or if you want high security (so your data never travels over the public internet), you need this.
For your project: If you are using Pinecone (SaaS) and Bedrock (Public API), you might not need a VPC stack yet. However, for an ML Engineer role, showing you know how to build a VPC is a huge "Senior" signal.

## Layer 1: The State (Data Layer)
Resources: S3 Buckets, Secrets Manager (Pinecone API Key), DynamoDB, OpenSearch, RDS.
Change Frequency: Rarely (once a month).
Why it exists: This is the Stateful stack we discussed. It holds the "Truth." If you delete this, you lose your data.
For your project: This is where your PDF bucket and your Pinecone secret live.

## Layer 2: The Intelligence (Logic Layer)
Resources: Bedrock Agents, Knowledge Bases, Lambda Functions, SageMaker Endpoints.
Change Frequency: Very Often (multiple times a day).
Why it exists: This is the Stateless stack. It contains your "Workload." You are constantly updating prompts, fine-tuning models, and changing Python code.
For your project: Your BedrockAgentConstruct lives here.

## Layer 3: The Interface (Consumption Layer)
Resources: API Gateway, AppSync (GraphQL), CloudFront (if you have a website), Cognito (User login).
Change Frequency: Often (whenever the UI changes).
Why it exists: This protects your "Intelligence." You don't want users talking directly to your Agent; you want them to go through an API that checks their identity first.
For your project: An API Gateway that triggers the Bedrock Agent.

## Environments

Deploying it to production is the playground for developers. As soon as it is deployed, developers can start testing the agent directly, or execute evaluation tests suit Initial model selection (e.g., "Is Claude 3 Haiku good enough, or do I need Sonnet?"). It is excellent for comparing two different models side-by-side with human reviewers.
AS soon as a model is selected, the codebase can be changed specifying new model and the new stack can be deployed. 

## Deployment on Prod
When the agent behaves as desired, the prototype testers create an alias to deploy it, which automatically creates and points to a new version. The testers configure their web application to make API calls to this alias.

## Concurreny Lambda
Concept
By default, Lambda provides your account with a total concurrency limit of 1,000 concurrent executions across all functions in an AWS Region. That limit may be increased by opening up a support request.

also that sessionId is added to track evaluations over time. This allows you to see if the agent gets "confused" during long conversations, which is a common problem in production-grade chatbots.
