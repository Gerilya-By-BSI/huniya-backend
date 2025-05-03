FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    gcc \
    libc-dev \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir \
    fastapi==0.104.0 \
    uvicorn==0.23.2 \
    pydantic==2.4.2 \
    pandas==2.0.3 \
    xgboost==2.0.0 \
    scikit-learn==1.3.0 \
    python-multipart==0.0.6

# Copy model files and application code
COPY ./models/ /app/models/
COPY main.py .

ENV PORT=5000

EXPOSE ${PORT}

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]