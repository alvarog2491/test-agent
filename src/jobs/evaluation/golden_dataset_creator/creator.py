import os
import asyncio
import logging
import litellm
from typing import List
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from ragas.llms import InstructorLLM
from ragas.embeddings import embedding_factory
from ragas.testset import TestsetGenerator
from ragas.testset.persona import Persona
from ragas.testset.transforms import TitleExtractor, SummaryExtractor, EmbeddingExtractor, CosineSimilarityBuilder, SummaryCosineSimilarityBuilder
from ragas.testset.synthesizers.single_hop.specific import SingleHopSpecificQuerySynthesizer
from ragas.testset.synthesizers.multi_hop import MultiHopSpecificQuerySynthesizer

from langchain_text_splitters import MarkdownHeaderTextSplitter, RecursiveCharacterTextSplitter

# --- Logging Configuration ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GoldenDatasetCreator:
    def __init__(self):
        """Initializes the creator with common workspace paths and models."""
        self.ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../"))
        self.KB_PATH = os.path.join(self.ROOT_DIR, "assets/knowledge_base/data")
        self.OUTPUT_DIR = os.path.join(self.ROOT_DIR, "assets/knowledge_base/evaluation")
        
        self._init_ragas_models()

    def _init_ragas_models(self):
        """Sets up the Generator LLM and Embeddings using LiteLLM/Instructor for Bedrock."""
        # Use us. prefix for cross-region inference if not present
        generator_model = os.environ.get('JUDGE_MODEL_ID', 'anthropic.claude-3-5-sonnet-20240620-v1:0')
        if not generator_model.startswith('us.'):
             generator_model = 'us.' + generator_model
             
        embedding_model = os.environ.get('EMBEDDING_MODEL_ID', 'amazon.titan-embed-text-v2:0')
        
        logger.info(f"Initializing models - LLM: {generator_model}, Embeddings: {embedding_model}")

        # Configure LiteLLM for Bedrock compatibility
        litellm.set_verbose = False
        logging.getLogger("LiteLLM").setLevel(logging.WARNING)
        litellm.drop_params = True
        litellm.modify_params = True
        
        import instructor
        self.generator_llm = InstructorLLM(
            client=instructor.from_litellm(litellm.acompletion, mode=instructor.Mode.JSON),
            model=generator_model,
            provider="litellm",
            temperature=0.0,
            top_k=10,
            top_p=None,
            max_tokens=4096
        )

        self.generator_embeddings = embedding_factory(
            model=embedding_model,
            provider="litellm",
            client=litellm
        )

    async def generate(self, testset_size: int = 5):
        """Orchestrates the document loading, KG building, and testset generation."""
        logger.info(f"📁 Loading Markdown files from {self.KB_PATH}...")
        
        if not os.path.exists(self.KB_PATH):
            logger.error(f"Folder {self.KB_PATH} not found.")
            return

        loader = DirectoryLoader(
            self.KB_PATH, 
            glob="**/*.md", 
            loader_cls=TextLoader
        )
        documents = loader.load()
        logger.info(f"📄 Loaded {len(documents)} documents.")

        # 1. Aggressive Splitting to ensure enough nodes for multihop clusters
        logger.info("Splitting documents into smaller chunks...")
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=300, chunk_overlap=100)
        all_split_docs = text_splitter.split_documents(documents)
            
        logger.info(f"✂️ Split {len(documents)} docs into {len(all_split_docs)} chunks.")

        # 2. Define User Persona
        persona = Persona(
            name="Structural Architect",
            role_description="Architect or Engineer interested in CYPE software for professional structural design and calculation.",
            goals=[
                "Get information about CYPE software capabilities",
                "Buy or enroll in CYPE courses",
                "Compare available software modules"
            ]
        )

        # 3. Setup Synthesizers
        logger.info("Setting up synthesizers...")
        # Using base synthesizer for better reliability (less restrictive)
        from ragas.testset.synthesizers.single_hop.base import SingleHopQuerySynthesizer
        single_hop = SingleHopQuerySynthesizer(llm=self.generator_llm)
        distribution = [(single_hop, 1.0)]

        # 4. Initialize Generator
        generator = TestsetGenerator(
            llm=self.generator_llm,
            embedding_model=self.generator_embeddings,
            persona_list=[persona]
        )

        # 5. Define Transforms
        transforms = [
            TitleExtractor(llm=self.generator_llm),
            SummaryExtractor(llm=self.generator_llm),
            EmbeddingExtractor(embedding_model=self.generator_embeddings),
            CosineSimilarityBuilder(threshold=0.1)
        ]

        # 6. Generate Testset
        logger.info(f"✍️ Generating {testset_size} synthetic questions in Spanish...")
        testset = generator.generate_with_langchain_docs(
            all_split_docs,
            testset_size=testset_size, 
            transforms=transforms,
            query_distribution=distribution
        )

        # 7. Export to JSONL in assets directory
        df = testset.to_pandas()
        os.makedirs(self.OUTPUT_DIR, exist_ok=True)
        output_file = os.path.join(self.OUTPUT_DIR, "golden_set.jsonl")
        
        if df.empty:
            logger.warning("⚠️ The generated testset is EMPTY.")
        else:
            df.to_json(
                output_file, 
                orient="records", 
                lines=True, 
                force_ascii=False
            )
            logger.info(f"✅ Success! Dataset saved to {output_file}")
            logger.info(f"Available columns: {df.columns.tolist()}")
            logger.info(df.head())

if __name__ == "__main__":
    creator = GoldenDatasetCreator()
    asyncio.run(creator.generate(testset_size=20))