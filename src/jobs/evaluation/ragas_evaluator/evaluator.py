import os
import json
import boto3
import logging
import litellm
from datetime import datetime
from ragas.llms import InstructorLLM
from ragas.embeddings.base import embedding_factory
from botocore.config import Config
import instructor

logger = logging.getLogger(__name__)

class BedrockEvaluator:
    def __init__(self):
        """Initializes AWS clients and RAGAS models for evaluation."""
        self._init_aws_clients()
        self._init_ragas_models()

    def _init_aws_clients(self):
        """Configures Boto3 clients with optimized settings for RAGAS."""
        self.aws_config = Config(
            max_pool_connections=50,
            retries={'max_attempts': 3, 'mode': 'standard'}
        )

        self.s3 = boto3.client('s3')

    def _init_ragas_models(self):
        """Sets up Judge LLM and Embeddings for RAGAS metrics via LiteLLM."""
        judge_model = 'us.' + os.environ['JUDGE_MODEL_ID']
        embedding_model = os.environ['EMBEDDING_MODEL_ID']
        
        litellm.set_verbose = False
        logging.getLogger("LiteLLM").setLevel(logging.WARNING)
        litellm.drop_params = True
        litellm.modify_params = True
        
        self.judge_llm = InstructorLLM(
            client=instructor.from_litellm(litellm.acompletion, mode=instructor.Mode.JSON),
            model=judge_model,
            provider="litellm",
            temperature=0.0,
            top_k=10,
            top_p=None,
            max_tokens=4096
        )

        self.embeddings = embedding_factory(
            model=embedding_model,
            provider="litellm",
            client=litellm
        )

    def load_test_set(self, bucket, key):
        """Loads the golden dataset from S3."""
        logger.info(f"Loading test set from s3://{bucket}/{key}")
        try:
            obj = self.s3.get_object(Bucket=bucket, Key=key)
            lines = obj['Body'].read().decode('utf-8').splitlines()
            return [json.loads(line) for line in lines if line.strip()]
        except self.s3.exceptions.NoSuchKey:
            logger.warning(f"Test set not found at s3://{bucket}/{key}")
            return None
        except Exception as e:
            logger.error(f"Failed to load test set: {e}")
            raise

    def archive_report_to_s3(self, results, bucket):
        """Saves evaluation report to S3."""
        df = results.to_pandas()
        timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        key = f"reports/eval-report-{timestamp}.json"
        
        report = {
            "agent_id": os.environ['AGENT_ID'],
            "execution_time": timestamp,
            "summary_metrics": json.loads(df.select_dtypes(include=['number']).mean().to_json()),
            "detailed_results": json.loads(df.to_json(orient='records'))
        }
        
        self.s3.put_object(
            Bucket=bucket,
            Key=key,
            Body=json.dumps(report, indent=2)
        )
        logger.info(f"Report archived to s3://{bucket}/{key}")
