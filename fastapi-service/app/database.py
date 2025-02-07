import os
import time

from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import sessionmaker

from .models import Base

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASS = os.getenv("DB_PASS", "")
DB_NAME = os.getenv("DB_NAME", "mydb")

SQLALCHEMY_DATABASE_URL = (
    f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:3306/{DB_NAME}"
)

# Maximum number of retries
MAX_RETRIES = 30
# Delay between retries in seconds
RETRY_DELAY = 1


def get_db_connection():
    retries = 0
    while retries < MAX_RETRIES:
        try:
            engine = create_engine(
                SQLALCHEMY_DATABASE_URL,
                echo=False,
                future=True,
            )
            # Try to connect
            with engine.connect() as connection:
                # If successful, create tables and return engine
                Base.metadata.create_all(bind=engine)
                return engine
        except OperationalError as e:
            retries += 1
            if retries < MAX_RETRIES:
                print(
                    f"Database connection attempt {retries} failed. Retrying in {RETRY_DELAY} seconds..."
                )
                time.sleep(RETRY_DELAY)
            else:
                raise Exception(
                    "Could not connect to database after maximum retries"
                ) from e


engine = get_db_connection()
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
