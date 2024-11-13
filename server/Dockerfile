# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install uv
RUN pip install uv

# Copy requirements first for better caching
COPY requirements.txt .

# Create and activate virtual environment using uv
RUN uv venv .venv
ENV PATH="/app/.venv/bin:$PATH"
ENV VIRTUAL_ENV="/app/.venv"

# Install dependencies using uv
RUN uv pip install --no-cache -r requirements.txt

# Copy the entire application
COPY . .

# Environment variable for port
ENV PORT=8080

# Command to run the FastAPI application with uvicorn
CMD exec uvicorn main:app --host 0.0.0.0 --port $PORT