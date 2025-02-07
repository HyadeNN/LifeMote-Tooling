# Description: Dockerfile for FastAPI service

FROM python:3.12.3-alpine3.18


RUN apk add --no-cache gcc musl-dev

WORKDIR /app


COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt


COPY app/ ./app/

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
