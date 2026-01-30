import os, uuid, json
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field, EmailStr
from aws_lambda_powertools import Logger, Tracer, Metrics
from aws_lambda_powertools.metrics import MetricUnit
from aws_lambda_powertools.utilities.typing import LambdaContext
import boto3

# Setup & Resource Initialization
logger, tracer, metrics = Logger(), Tracer(), Metrics(namespace="LeadGenBot", service="LeadCollector")
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ.get('LEADS_TABLE_NAME', ''))


class LeadRequest(BaseModel):
    # EmailStr provides better validation than a manual regex
    email: EmailStr
    reason: str = "User inquiry"

# Bedrock Agent Helpers
def parse_properties(event: Dict[str, Any]) -> Dict[str, Any]:
    """Flattens Bedrock properties list into a standard dictionary."""
    try:
        properties = event.get('requestBody', {}).get('content', {}).get('application/json', {}).get('properties', [])
        return {p['name']: p['value'] for p in properties if 'name' in p}
    except (AttributeError, TypeError):
        return event.get('requestBody', {}) # Fallback to raw body

def build_agent_resp(event: Dict[str, Any], status: int, body: dict) -> dict:
    """Formats the response specifically for Bedrock Agent Action Groups."""
    return {
        'messageVersion': '1.0',
        'response': {
            'actionGroup': event.get('actionGroup', 'Unknown'),
            'apiPath': event.get('apiPath', '/'),
            'httpMethod': event.get('httpMethod', 'POST'),
            'httpStatusCode': status,
            'responseBody': {'application/json': {'body': json.dumps(body)}}
        }
    }

# Main Handler
@logger.inject_lambda_context(log_event=True)
@tracer.capture_lambda_handler
@metrics.log_metrics(capture_cold_start_metric=True)
def handler(event: Dict[str, Any], context: LambdaContext):
    try:
        # Input Validation
        data = LeadRequest(**parse_properties(event))

        # Business Logic
        lead_id = str(uuid.uuid4())
        table.put_item(Item={
            'lead_id': lead_id,
            'email': data.email,
            'reason': data.reason,
            'created_at': datetime.now(timezone.utc).isoformat(),
            'status': 'new',
            'session_id': event.get('sessionId')
        })

        logger.info(f"Lead collected", extra={"lead_id": lead_id, "email": data.email})
        metrics.add_metric(name="LeadCaptured", unit=MetricUnit.Count, value=1)

        resp_msg = f"Got it! I've saved your request. We'll contact you at {data.email} soon."
        return build_agent_resp(event, 200, {"success": True, "message": resp_msg})

    except Exception as e:
        logger.exception("Lead collection failed")
        metrics.add_metric(name="ActionGroupFailure", unit=MetricUnit.Count, value=1)
        # Return a friendly message for the Agent to relay to the user
        return build_agent_resp(event, 400, {"success": False, "message": "I couldn't save your info. Please check the email format."})