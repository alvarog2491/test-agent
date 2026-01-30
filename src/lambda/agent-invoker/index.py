import os, uuid, json
from typing import Optional
from pydantic import BaseModel, Field, field_validator
from aws_lambda_powertools import Logger, Tracer, Metrics
from aws_lambda_powertools.metrics import MetricUnit
from aws_lambda_powertools.utilities import parameters
from aws_lambda_powertools.utilities.typing import LambdaContext
from langfuse import Langfuse, observe, propagate_attributes
import boto3

# Setup & Config
logger, tracer, metrics = Logger(), Tracer(), Metrics(namespace="LeadGenBot", service="AgentService")
bedrock = boto3.client("bedrock-agent-runtime")
langfuse_client: Optional[Langfuse] = None

class BedrockAgentRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=500)
    sessionId: str = Field(default_factory=lambda: str(uuid.uuid4()))

    @field_validator("sessionId", mode="before")
    @classmethod
    def validate_sid(cls, v):
        # Normalizes any input to a clean string; falls back to a UUID if empty or None
        return str(v).strip() if v is not None and str(v).strip() else str(uuid.uuid4())

# Observability Setup
@tracer.capture_method
def init_langfuse():
    global langfuse_client
    if langfuse_client: return
    try:
        # Fetches, parses JSON, and CACHES for 1 minute automatically
        creds = parameters.get_secret(os.environ["LANGFUSE_SECRET_ARN"], transform="json")
        os.environ.update({
            "LANGFUSE_SECRET_KEY": creds["LANGFUSE_SECRET_KEY"],
            "LANGFUSE_PUBLIC_KEY": creds["LANGFUSE_PUBLIC_KEY"],
            "LANGFUSE_BASE_URL": creds["LANGFUSE_BASE_URL"]
        })
        langfuse_client = Langfuse()
    except Exception as e:
        logger.error(f"Langfuse init failed: {e}")

init_langfuse()

@tracer.capture_method
@observe(as_type="generation", name="Bedrock Agent Invocation")
def invoke_agent(session_id: str, prompt: str) -> str:
    
    with propagate_attributes(session_id=session_id):
        response = bedrock.invoke_agent(
            agentId=os.environ["AGENT_ID"],
            agentAliasId=os.environ["AGENT_ALIAS_ID"],
            sessionId=session_id,
            inputText=prompt
    )
    return "".join(c["chunk"]["bytes"].decode() for c in response["completion"] if "chunk" in c)

@logger.inject_lambda_context(log_event=True)
@tracer.capture_lambda_handler
@metrics.log_metrics(capture_cold_start=True)
def handler(event: dict, context: LambdaContext):
    
    try:
        # Parse body regardless of API Gateway or direct invocation
        body = event.get("body", event)
        if isinstance(body, str):
            body_dict = json.loads(body)
        else:
            body_dict = body

        incoming_sid = body_dict.get("sessionId")
        if not incoming_sid or not str(incoming_sid).strip():
            logger.info("New session started (no client-side ID provided)")
            metrics.add_metric(name="SessionInvocation", unit=MetricUnit.Count, value=1)
        

        data = BedrockAgentRequest.model_validate(body_dict)
        
        result = invoke_agent(data.sessionId, data.prompt)
        return build_resp(200, {"response": result, "sessionId": data.sessionId}, event)

    except Exception as e:
        logger.exception("Invocation failed")
        return build_resp(500, {"error": str(e)}, event)
    finally:
        if langfuse_client: langfuse_client.flush()

def build_resp(code: int, body: dict, event: dict):
    origin = event.get('headers', {}).get('origin')
    allowed = os.environ.get('ALLOWED_ORIGINS', '').split(',')
    headers = {"Content-Type": "application/json"}
    if origin in allowed:
        headers.update({"Access-Control-Allow-Origin": origin, "Access-Control-Allow-Credentials": "true"})
    return {"statusCode": code, "headers": headers, "body": json.dumps(body)}