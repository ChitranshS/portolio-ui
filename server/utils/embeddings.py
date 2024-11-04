from dotenv import load_dotenv
import os
from together import Together
import uuid
load_dotenv()

def generate_embeddings(chunks):
    together_client = Together(api_key=os.environ.get("TOGETHER_API_KEY"))

    if isinstance(chunks, str):
        chunks = [chunks]
    
    embeddings = []
    for chunk in chunks:
        response = together_client.embeddings.create(
            model="togethercomputer/m2-bert-80M-8k-retrieval",
            input=chunk
        )
        # embeddings.append(response.data[0].embedding)
        embeddings.extend(response.data[0].embedding)  # Use extend instead of append
    
    return embeddings