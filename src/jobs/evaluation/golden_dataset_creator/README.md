# Golden Dataset Creator - Documentation

This directory contains utility scripts to generate a "Golden Dataset" (`golden_set.jsonl`) from Markdown documentation. This dataset is primarily used for RAG evaluation (e.g., using Ragas).

## Which script should I run?

| Script | When to use | Pros | Cons |
| :--- | :--- | :--- | :--- |
| **`creator_simple.py`** | **Recommended for General Use** | Very robust, guarantees Spanish output, bypasses Ragas clustering errors, easy to debug. | Single-hop questions only (one piece of context per question). |
| **`creator.py`** | When you need advanced Multihop questions. | Builds a complex Knowledge Graph, automatically generates clusters, uses native Ragas Synthesizers. | Can fail with "No clusters found" if documentation is sparse or too similar. |

### Summary of Differences:
- **`creator_simple.py`**: A custom implementation that calls Bedrock directly. It splits the documents into chunks, picks a random subset, and asks the LLM to generate a question/answer pair for each chunk. It is the most reliable way to get a high-quality dataset in Spanish for a specific persona.
- **`creator.py`**: Uses the official Ragas `TestsetGenerator`. It attempts to build a Knowledge Graph of your documents to identify related concepts and generate "Multihop" questions (questions that require information from multiple files).

---

## How to execute

Both scripts are designed to run inside the same Docker container. The **Dockerfile** in this directoy defaults to `creator_simple.py`.

### 1. Build the Image
From the **project root**, run:
```bash
docker build -t golden-creator -f src/jobs/evaluation/golden_dataset_creator/Dockerfile .
```

### 2. Run the Generation
Execute the container and mount your AWS credentials and the assets folder to capture the output:
```bash
docker run -v ~/.aws:/root/.aws:ro \
  -v $(pwd)/assets:/app/assets \
  --env-file .env \
  --env-file eval.env \
  golden-creator
```

---

## Configurations

The scripts use environment variables defined in `.env` and `eval.env`:

- `JUDGE_MODEL_ID`: The LLM used to generate questions (e.g., `anthropic.claude-3-5-sonnet-20240620-v1:0`). 
  - *Note: The scripts automatically handle the `us.` prefix for Bedrock cross-region inference.*
- `EMBEDDING_MODEL_ID`: used by `creator.py` for Knowledge Graph construction.
- `KB_PATH`: Path to the source Markdown files (defaults to `assets/knowledge_base/data`).

### Modifying the Persona
In both `creator.py` and `creator_simple.py`, you can modify the `Persona` object to change the "Who" is asking the questions (e.g., from "Structural Architect" to "Software Developer").

---

## What to expect

### Output Format
The output will be a JSONL file at `assets/knowledge_base/evaluation/test_sets/golden_set.jsonl`. Each line is a valid JSON object following the Ragas/LangChain schema:

```json
{
    "user_input": "¿Qué certificaciones ofrece Medif Estructuras?",
    "retrieved_contexts": ["Fragmento de la documentación..."],
    "response": "Ofrecen certificados oficiales de CYPE y propios de Medif...",
    "reference": "Fragmento de la documentación...",
    "metadata": { "source": "/app/assets/knowledge_base/data/overview.md" }
}
```

### Constraints
- Ensure your `JUDGE_MODEL_ID` is available in your Bedrock region.
- The `assets` directory must contain `.md` files in the `knowledge_base/data` subfolder.
