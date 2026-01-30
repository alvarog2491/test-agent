import os
import boto3
from aws_lambda_powertools import Logger, Tracer

# Constants
KNOWLEDGE_BASE_ID = os.environ.get('KNOWLEDGE_BASE_ID')
DATA_SOURCE_ID = os.environ.get('DATA_SOURCE_ID')

logger, tracer = Logger(), Tracer()
bedrock_agent_client = boto3.client('bedrock-agent')

@logger.inject_lambda_context(log_event=True)
@tracer.capture_lambda_handler
def handler(event: dict, _):
    if not KNOWLEDGE_BASE_ID or not DATA_SOURCE_ID:
        logger.error("Required environment variables are not set.")
        return {'statusCode': 500, 'body': "Configuration error"}

    try:
        logger.info(f"Syncing KB: {KNOWLEDGE_BASE_ID}, DS: {DATA_SOURCE_ID}")
        
        response = bedrock_agent_client.start_ingestion_job(
            knowledgeBaseId=KNOWLEDGE_BASE_ID,
            dataSourceId=DATA_SOURCE_ID,
            description='S3 event sync'
        )
        
        job_id = response['ingestionJob']['ingestionJobId']
        return {'statusCode': 200, 'body': f"Job started: {job_id}"}
        
    except Exception:
        logger.exception("Failed to start ingestion job")
        return {'statusCode': 500, 'body': "Internal Server Error"}