# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .
# RUN source .venv/bin/activate
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire application
COPY . .

# Environment variable for port
ENV PORT=8080

# Command to run the FastAPI application with uvicorn
CMD exec uvicorn main:app --host 0.0.0.0 --port $PORT