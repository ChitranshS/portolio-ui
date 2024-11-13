from psycopg_pool import ConnectionPool

import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

connection_kwargs = {
    "autocommit": True,
    "prepare_threshold": 0,
}
connection_pool = ConnectionPool(
    conninfo=DATABASE_URL,
    max_size=20,
    kwargs=connection_kwargs,
)