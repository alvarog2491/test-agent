

# Introduction
This article shows how to build an intelligent agent for MedifEstructuras. We realized the site’s existing setup was falling short, leaving visitors with unanswered questions and missed connections. To fix this, we developed a more capable assistant that does more than just talk; it actually understands the business.

This agent handles two key tasks:

Accurate Information: Using RAG (Retrieval-Augmented Generation), it pulls directly from company data to give users precise, reliable answers instead of generic responses.

Lead Capture: It identifies potential customers during the conversation and stores their details in a database, making it easy for the sales team to follow up.

The technical backbone is a distributed architecture built entirely on AWS. We went with a 100% Infrastructure as Code (IaC) approach using AWS CDK, which allowed us to deploy the entire environment through code and stay clear of managing any physical infrastructure. The result is a system that is not only efficient to manage but also completely scalable, ready to handle any level of traffic as the business grows.

# Architecture
![architecture.png](images/architecture.png)

## Layers of the architecture
Code is IaC, implemented in CDK by 5-tier architecture, this allows to create and destroy all resources by code and not clicking. Benefit os this is to destroy everyhting was created and avoid surprises in costs, Clicking is extremely easy that forgets what was done. This way the Application can scale, be versioned and better managed.

Explain how the architecture is divided into layers and what each layer does.
Constructs and layers are built with Single Responsibility Principle.
To know which bucket is used from compute stacks, the Rehydration pattern is used.
Evaluation layer is a new layer because of Best long-term maintainability and cleanest ownership boundaries, deployment safety and blast radius
Stacks for separate stateless and stateful object in different stacks as described on https://docs.aws.amazon.com/cdk/v2/guide/best-practices.html#best-practices-security-iam:~:text=Consider%20keeping%20stateful%20resources%20(like%20databases)%20in%20a%20separate%20stack%20from%20stateless%20resources.%20You%20can%20then%20turn%20on%20termination%20protection%20on%20the%20stateful%20stack.%20This%20way%2C%20you%20can%20freely%20destroy%20or%20create%20multiple%20copies%20of%20the%20stateless%20stack%20without%20risk%20of%20data%20loss.

### Persistence Layer
If the Agent disappears, should the Knowledge Base still exist?
On the knowledge base, each section on the documents contains similar length and are divided by topics, so the best strategy that outperforms is semantic chunking. It is not necessary to retrieve by structure is more important to retrieve by meaning.

### Compute Layer

### Interface Layer
You can use zod-to-json-schema (as you already are) to automatically generate the API Gateway Request Models. This ensures that malformed requests are rejected at the AWS edge before they ever trigger a Lambda, saving you compute costs (FinOps).

### Monitoring Layer


By using from... on the props elements, you obtain a 'proxy' object that implements the L2 interface, giving you access to all the grant methods without creating a hard CloudFormation dependency.

# How Agents runtime works
![agents-runtime.png](images/agents-runtime.png)
imformation at: https://docs.aws.amazon.com/bedrock/latest/userguide/agents-how.html

# Prompt Engineering
As the default model selction for this chatbot is Claude haiku 3, it is important to follow prompt engineering best practices for this model.

Information at: https://docs.aws.amazon.com/nova/latest/userguide/prompting.html


## Evaluation
Why in Docker container?
"While standard Lambda deployments are ideal for lightweight API handlers, the Evaluation Layer demands a more robust environment. To leverage the full power of the RAGAS framework, we adopted a Containerized Lambda architecture. This bypassed the traditional 250MB deployment limit and allowed us to package a complete data science stack—including Pandas and LangChain—into an immutable, 10GB-capable image. This ensures that our 'LLM-as-a-Judge' logic remains consistent across development and production, providing a reliable, reproducible quality gate."

While a Dockerized Lambda is ideal for our current scale, we must account for the 15-minute execution limit as the system grows. In larger enterprise scenarios with massive evaluation datasets, two superior patterns emerge: utilizing AWS Step Functions to parallelize the RAGAS scoring process via a Distributed Map pattern for maximum speed, or migrating the engine to AWS Fargate or SageMaker Processing Jobs to eliminate time constraints entirely. This architectural flexibility ensures that our quality gate can scale from a few dozen 'golden questions' to thousands of batch evaluations without compromising the CI/CD timeline.

In a production RAG lifecycle, evaluation datasets grow over time. We recognized that AI Quality Auditing is a Batch Workload, not a transient event. Consequently, we pivoted our architecture to AWS Fargate [or SageMaker]. This transition allowed us to handle high-latency LLM-as-a-Judge calls and large-scale dataframes without the risk of timeout-induced data loss, providing a robust, scalable foundation for our CI/CD Quality Gate.

By containerizing our RAGAS engine as an ECS Task, we eliminated the 'serverless timeout' risk and gained the ability to allocate dedicated compute resources for heavy data processing. This ensures our Evaluation Layer remains robust and scalable, capable of performing deep cognitive audits regardless of the dataset size or LLM-judge latency.

Because AI evaluation is a bursty, batch-oriented workload, Fargate allows us to spin up a high-compute environment (2 vCPUs, 4GB RAM) on-demand, calculate our RAGAS metrics, and then immediately terminate the resources. This ensures a 100% 'Clean Room' for every evaluation, preventing data contamination between test runs while achieving a Zero-Idle cost structure—a critical requirement for production-grade MLOps pipelines.

We implemented the Evaluation Layer within a public VPC subnet as a strategic FinOps optimization. Since the RAGAS engine audits the same non-sensitive data available on the company’s public website, the cost and complexity of a fully isolated private network were unnecessary. At the same time, this containers are efimeral and executed time to time, as soon as the evaluation is done, the container is destroyed.

We evaluated three networking tiers for our Evaluation Engine:
Isolated Private (PrivateLink): The most secure, but carries a $36/mo overhead.
Lambda-based: Free, but limited by a 15-minute execution ceiling.
Public-Isolated (Our Choice): We utilized a public subnet with a Public IP but enforced a Zero-Inbound Security Posture.
We chose Option 3 as a FinOps optimization. Since our RAGAS dataset consists of public website data, the cost of private tunnels was not justified. We mitigated the public IP risk by ensuring the container is short-lived (ephemeral) and has no open ports, achieving the same effective security as a private subnet at 0% of the cost."

## Deployment
Explain how the environment works on different accounts

## Pricing

## Misc
cdk-nag was really helpful to ensure the security standards were met