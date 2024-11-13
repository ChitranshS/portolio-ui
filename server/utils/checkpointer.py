from utils.postgres import connection_pool
import uuid
from langgraph.checkpoint.postgres import PostgresSaver


checkpointer = PostgresSaver(connection_pool)
# NOTE: you need to call .setup() the first time you're using your checkpointer
checkpointer.setup()

