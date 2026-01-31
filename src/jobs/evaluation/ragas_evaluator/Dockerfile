FROM python:3.11-slim

# 1. Inject the 'uv' binary from the official image
# This is the line that was missing - it makes 'uv' available in the PATH
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# 2. Production Python optimizations
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# 3. Fast Dependency Installation
# Using uv reduces build time by 10x compared to standard pip
COPY requirements.txt .
RUN uv pip install --system --no-cache -r requirements.txt

# 4. Copy application logic
COPY . .

# 5. Execution
CMD ["python", "main.py"]