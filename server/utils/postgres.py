from psycopg_pool import ConnectionPool
import psycopg
from psycopg import OperationalError
import os
from dotenv import load_dotenv
import time
import logging

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv("DB_AIVEN_URL")

# Connection settings
connection_kwargs = {
    "autocommit": False,
    "prepare_threshold": 0,
    "keepalives": 1,
    "keepalives_idle": 5,
    "keepalives_interval": 1,
    "keepalives_count": 3,
    "connect_timeout": 10,
    "application_name": "boltnew_app",
    "sslmode": "require",
    "tcp_user_timeout": 10000
}

def create_connection_pool(max_retries=3, retry_delay=5):
    """Create a connection pool with retry logic"""
    for attempt in range(max_retries):
        try:
            pool = ConnectionPool(
                conninfo=DATABASE_URL,
                max_size=10,
                min_size=2,
                timeout=10,
                kwargs=connection_kwargs,
                open=False
            )
            pool.open()
            logger.info("Database connection pool initialized successfully")
            return pool
        except Exception as e:
            if attempt < max_retries - 1:
                logger.warning(f"Failed to create connection pool (attempt {attempt + 1}/{max_retries}): {e}")
                time.sleep(retry_delay)
            else:
                logger.error(f"Failed to create connection pool after {max_retries} attempts: {e}")
                raise

def get_connection(pool, max_retries=3):
    """Get a connection from the pool with retry logic"""
    last_exception = None
    
    for attempt in range(max_retries):
        try:
            conn = pool.getconn()
            # Test the connection
            with conn.cursor() as cur:
                cur.execute("SELECT 1")
                conn.commit()
            return conn
        except (OperationalError, psycopg.Error) as e:
            last_exception = e
            if attempt < max_retries - 1:
                logger.warning(f"Failed to get connection (attempt {attempt + 1}/{max_retries}): {e}")
                time.sleep(1)
                try:
                    pool.reset()
                except Exception as reset_error:
                    logger.warning(f"Failed to reset pool: {reset_error}")
            else:
                logger.error(f"Failed to get connection after {max_retries} attempts: {last_exception}")
                raise last_exception

def return_connection(pool, conn):
    """Return a connection to the pool"""
    try:
        if conn:
            pool.putconn(conn)
    except Exception as e:
        logger.error(f"Error returning connection to pool: {e}")

# Initialize the connection pool with retry logic
connection_pool = create_connection_pool()

def cleanup_pool():
    """Cleanup function to properly close the connection pool"""
    try:
        if connection_pool is not None:
            connection_pool.close()
            logger.info("Connection pool closed successfully")
    except Exception as e:
        logger.error(f"Error closing connection pool: {e}")

# Example of how to use in your FastAPI startup event
async def startup_event():
    try:
        conn = get_connection(connection_pool)
        # Test the connection
        with conn.cursor() as cur:
            cur.execute("SELECT 1")
            conn.commit()
        return_connection(connection_pool, conn)
        logger.info("Database connection test successful")
    except Exception as e:
        logger.error(f"Failed to initialize database connection: {e}")
        raise

def execute_with_retry(func, max_retries=3):
    """Execute a database function with retry logic"""
    last_error = None
    conn = None
    for attempt in range(max_retries):
        try:
            conn = get_connection(connection_pool)
            result = func(conn)
            conn.commit()
            return result
        except Exception as e:
            last_error = e
            logger.warning(f"Attempt {attempt + 1} failed: {e}")
            if conn:
                try:
                    conn.rollback()
                except:
                    pass
            if attempt == max_retries - 1:
                logger.error(f"All attempts failed: {e}")
                raise last_error
            time.sleep(1)
        finally:
            if conn:
                return_connection(connection_pool, conn)