import os
import json
import random
import logging
import boto3
from typing import List
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

# --- Logging Configuration ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SimpleGoldenDatasetCreator:
    def __init__(self):
        """Initializes the creator with Bedrock and workspace paths."""
        self.ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../"))
        self.KB_PATH = os.path.join(self.ROOT_DIR, "assets/knowledge_base/data")
        self.OUTPUT_DIR = os.path.join(self.ROOT_DIR, "assets/knowledge_base/evaluation/test_sets")
        self.MODEL_ID = os.environ.get('JUDGE_MODEL_ID', 'us.anthropic.claude-3-5-sonnet-20240620-v1:0')
        if "anthropic" in self.MODEL_ID and not self.MODEL_ID.startswith("us."):
            self.MODEL_ID = "us." + self.MODEL_ID
        
        logger.info(f"Using Model: {self.MODEL_ID}")
        self.bedrock = boto3.client('bedrock-runtime')

    def _call_llm(self, prompt: str) -> str:
        """Calls Bedrock Sonnet to generate content."""
        payload = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1000,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.0
        }
        
        response = self.bedrock.invoke_model(
            modelId=self.MODEL_ID,
            body=json.dumps(payload)
        )
        
        response_body = json.loads(response['body'].read())
        return response_body['content'][0]['text']

    def generate(self, testset_size: int = 20):
        """Generates the testset using a direct LLM approach."""
        logger.info(f"📁 Loading Markdown files from {self.KB_PATH}...")
        
        if not os.path.exists(self.KB_PATH):
            logger.error(f"Folder {self.KB_PATH} not found.")
            return

        loader = DirectoryLoader(self.KB_PATH, glob="**/*.md", loader_cls=TextLoader)
        documents = loader.load()
        
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)
        chunks = text_splitter.split_documents(documents)
        logger.info(f"✂️ Split {len(documents)} docs into {len(chunks)} chunks.")

        if not chunks:
            logger.error("No chunks available for generation.")
            return

        test_set = []
        selected_chunks = random.sample(chunks, min(testset_size, len(chunks)))

        for i, chunk in enumerate(selected_chunks):
            logger.info(f"✍️ Generating question {i+1}/{len(selected_chunks)}...")
            
            prompt = f"""Erit como un Arquitecto Estructural o Ingeniero interesado en el software CYPE.
Lee el siguiente fragmento de documentación y genera una pregunta técnica y su respuesta correspondiente (Ground Truth).
La pregunta debe ser específica y basada EXCLUSIVAMENTE en el fragmento proporcionado.
Responde SIEMPRE en Español.

FRAGMENTO:
{chunk.page_content}

Responde en el siguiente formato JSON:
{{
    "user_input": "La pregunta aquí",
    "reference": "El fragmento de contexto aquí",
    "response": "La respuesta corta y directa aquí"
}}
"""
            try:
                raw_res = self._call_llm(prompt)
                # Find JSON block
                start = raw_res.find('{')
                end = raw_res.rfind('}') + 1
                item = json.loads(raw_res[start:end])
                
                # Format for Ragas JSONL
                test_set.append({
                    "user_input": item["user_input"],
                    "retrieved_contexts": [chunk.page_content],
                    "response": item["response"],
                    "reference": chunk.page_content,
                    "metadata": chunk.metadata
                })
            except Exception as e:
                logger.error(f"Error generating question {i+1}: {e}")

        # Export to JSONL
        os.makedirs(self.OUTPUT_DIR, exist_ok=True)
        output_file = os.path.join(self.OUTPUT_DIR, "golden_set.jsonl")
        
        with open(output_file, 'w', encoding='utf-8') as f:
            for item in test_set:
                f.write(json.dumps(item, ensure_ascii=False) + "\n")
                
        logger.info(f"✅ Success! Generated {len(test_set)} questions and saved to {output_file}")

if __name__ == "__main__":
    creator = SimpleGoldenDatasetCreator()
    creator.generate(testset_size=20)
