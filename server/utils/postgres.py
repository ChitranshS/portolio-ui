from psycopg_pool import ConnectionPool

import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
# DATABASE_URL = os.getenv("DB_AIVEN_URL")

connection_kwargs = {
    "autocommit": True,
    "prepare_threshold": 0,
    "keepalives": 1,
    "keepalives_idle": 30,
    "keepalives_interval": 10,
    "keepalives_count": 5
}
connection_pool = ConnectionPool(
    conninfo=DATABASE_URL,
    max_size=20,
    min_size=5,  # Add this to maintain minimum connections
    timeout=20,  # Add connection timeout
    kwargs=connection_kwargs,
)