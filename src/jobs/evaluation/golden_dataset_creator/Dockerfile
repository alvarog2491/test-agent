FROM python:3.11-slim

# 1. Inject the 'uv' binary from the official image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# 2. Production Python optimizations
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# 3. Fast Dependency Installation
COPY src/jobs/evaluation/golden_dataset_creator/requirements.txt .
RUN uv pip install --system --no-cache -r requirements.txt

# 4. Copy application logic and assets
# We need assets for the knowledge base data
COPY src/jobs/evaluation/golden_dataset_creator/*.py ./src/jobs/evaluation/golden_dataset_creator/
COPY assets ./assets

# 5. Execution
# Run from the project root context (relative to /app)
CMD ["python", "src/jobs/evaluation/golden_dataset_creator/creator_simple.py"]
