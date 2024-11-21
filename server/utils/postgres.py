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
    "keepalives_idle": 15,  # Reduced from 30 to detect disconnections faster
    "keepalives_interval": 5,  # Reduced from 10 to check more frequently
    "keepalives_count": 3,  # Reduced retries but increased frequency
    "connect_timeout": 10,  # Added explicit connect timeout
    "application_name": "boltnew_app",  # Added for better monitoring
    "sslmode": "require",  # Explicitly set SSL mode
    "tcp_user_timeout": 30000  # 30 seconds in milliseconds
}
connection_pool = ConnectionPool(
    conninfo=DATABASE_URL,
    max_size=20,
    min_size=3,  # Reduced minimum connections to decrease initial load
    timeout=30,  # Increased timeout for connection acquisition
    kwargs=connection_kwargs,
    open=False  # Don't open connections immediately
)

# Initialize the pool explicitly after creation
connection_pool.open()