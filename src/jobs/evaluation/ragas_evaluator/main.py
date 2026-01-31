import os
import logging
import asyncio
from typing import Dict, Any
from ragas import experiment
from ragas.dataset import Dataset
from ragas.metrics.collections import Faithfulness, AnswerRelevancy, ContextPrecision
from langfuse import Langfuse, observe

from utils import timeout_limit
from evaluator import BedrockEvaluator

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize LangFuse client for observability
langfuse_client = Langfuse(
    secret_key=os.environ.get("LANGFUSE_SECRET_KEY"),
    public_key=os.environ.get("LANGFUSE_PUBLIC_KEY"),
    host=os.environ.get("LANGFUSE_BASE_URL", "https://cloud.langfuse.com")
)
logger.info(f"LangFuse initialized: {os.environ.get('LANGFUSE_BASE_URL', 'https://cloud.langfuse.com')}")

# Global state for evaluator and adapted metrics
evaluator = None
adapted_metrics = {}


async def prepare_metrics(eval_instance: BedrockEvaluator):
    """
    Initializes and adapts all RAGAS metrics prompts to Spanish 
    before the experiment begins.
    https://docs.ragas.io/en/stable/howtos/customizations/metrics/metrics_language_adaptation/#adapt-prompts-to-target-language
    """
    llm = eval_instance.judge_llm
    embeddings = eval_instance.embeddings
    
    # Initialize metrics with modern models
    f_metric = Faithfulness(llm=llm)
    ar_metric = AnswerRelevancy(llm=llm, embeddings=embeddings)
    cp_metric = ContextPrecision(llm=llm)
    
    logger.info("Adapting Faithfulness prompts to Spanish...")
    f_metric.statement_generator_prompt = await f_metric.statement_generator_prompt.adapt(
        target_language="spanish", llm=llm, adapt_instruction=True
    )
    f_metric.nli_statement_prompt = await f_metric.nli_statement_prompt.adapt(
        target_language="spanish", llm=llm, adapt_instruction=True
    )
    
    logger.info("Adapting AnswerRelevancy prompts to Spanish...")
    ar_metric.prompt = await ar_metric.prompt.adapt(
        target_language="spanish", llm=llm, adapt_instruction=True
    )
    
    logger.info("Adapting ContextPrecision prompts to Spanish...")
    cp_metric.prompt = await cp_metric.prompt.adapt(
        target_language="spanish", llm=llm, adapt_instruction=True
    )
    
    logger.info("All metrics adapted to Spanish successfully")
    return {
        "faithfulness": f_metric,
        "answer_relevancy": ar_metric,
        "context_precision": cp_metric
    }


@experiment()
async def evaluate_agent(row: Dict[str, Any]):
    """
    Scores a single test case using pre-existing data from the golden dataset.
    """
    question = row["user_input"]
    ground_truth = row.get("reference", "")
    answer = row.get("response", "")
    contexts = row.get("retrieved_contexts", [])
    
    # Calculate RAGAS metrics
    f_result = await adapted_metrics["faithfulness"].ascore(
        user_input=question, response=answer, retrieved_contexts=contexts
    )
    ar_result = await adapted_metrics["answer_relevancy"].ascore(
        user_input=question, response=answer
    )
    cp_result = await adapted_metrics["context_precision"].ascore(
        user_input=question, reference=ground_truth, retrieved_contexts=contexts
    )
    
    return {
        **row,
        "answer": answer,
        "contexts": contexts,
        "faithfulness": f_result.value,
        "answer_relevancy": ar_result.value,
        "context_precision": cp_result.value
    }


@observe(name="RAGAS Evaluation Run", as_type="span")
@timeout_limit(1200)  # 20 minutes
async def main():
    """
    Main evaluation workflow:
    1. Loads test set from S3
    2. Prepares and adapts RAGAS metrics to Spanish
    3. Runs the experiment using the @experiment decorator
    4. Archives results to S3 and logs metrics to LangFuse
    """
    global evaluator, adapted_metrics
    
    logger.info("Initializing Evaluation Task...")
    evaluator = BedrockEvaluator()
    
    # Load test set from S3
    data_bucket = os.environ['EVAL_DATA_BUCKET']
    data_key = os.environ['EVAL_DATA_KEY']
    results_bucket = os.environ['RESULTS_BUCKET']
    
    test_set = evaluator.load_test_set(data_bucket, data_key)
    if not test_set:
        logger.warning("Empty test set. Terminating.")
        return

    logger.info(f"Loaded {len(test_set)} test cases")

    # Adapt metrics to Spanish
    logger.info("Adapting metrics to Spanish...")
    adapted_metrics = await prepare_metrics(evaluator)

    # Run evaluation experiment
    logger.info("Running evaluation experiment...")
    test_dataset = Dataset(name="test_dataset", data=test_set, backend="inmemory")
    experiment_results = await evaluate_agent.arun(dataset=test_dataset, backend="inmemory")

    # Calculate summary metrics
    results_df = experiment_results.to_pandas()
    summary = {
        "faithfulness": float(results_df["faithfulness"].mean()),
        "answer_relevancy": float(results_df["answer_relevancy"].mean()),
        "context_precision": float(results_df["context_precision"].mean())
    }
    
    # Archive results to S3
    evaluator.archive_report_to_s3(experiment_results, results_bucket)
    
    # Flush LangFuse traces
    langfuse_client.flush()
    
    logger.info(f"Evaluation completed. Metrics: {summary}")


if __name__ == "__main__":
    asyncio.run(main())