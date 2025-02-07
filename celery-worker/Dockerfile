FROM python:3.12.3-alpine3.18

RUN apk add --no-cache gcc musl-dev

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/

CMD ["python", "-m", "celery", "-A", "app.celery_app", "worker", "--loglevel=info"]