import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware  # Add this import
from dotenv import load_dotenv
import os
from rag.logic import query_handler
from utils.postgres import connection_pool, get_connection, return_connection, cleanup_pool
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from utils.postgres import startup_event , cleanup_pool
import logging
logger = logging.getLogger(__name__)
load_dotenv()


# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

#@app.on_event("startup")
async def startup():
    await startup_event()

@app.on_event("shutdown")
async def shutdown():
    cleanup_pool()

@app.post("/chat")
async def handle_chat(request: Request):
    handler = None
    data = await request.json()
    if data.get('query'):
        response = query_handler(data)
        print(response)
        return {
                    "query": data['query'],
                    "threadId": data['threadId'],
                    "response": response,
                    "status": "Request processed successfully"
                }
    else:   
            if handler is not None:
                raise handler
            handler = HTTPException(
                status_code=404,
                detail={
                    "status": "Fields Missing",
                    "error": "Not Allowed"
                }
            )
            raise handler
   


@app.post("/add_resume")
async def handle_resume(request: Request):
    handler = None
    try:
        data = await request.json()
        if not (data.get('user') and data.get('url') and data.get('auth')):
            handler = HTTPException(
                status_code=404,
                detail={
                    "status": "Fields Missing",
                    "error": "Not Allowed"
                }
            )
            raise handler
        if data['auth'] != "Chitransh@0210" and data['user'] != "Chits@0210":
            handler = HTTPException(
                status_code=404,
                detail={
                    "status": "Invalid Fields",
                    "error": "Not Allowed"
                }
            )
            raise handler
        else:
            return {
                "current_user": data['user'],
                "received_url": data['url'],
                "received_auth": data['auth'],
                "status": "Request processed successfully"
            }
    except:
        if handler:
            raise handler
        else:
            raise HTTPException(
                status_code=400,
                detail={
                    "status": "Invalid Payload",
                    "error": "Not Allowed"
                }
            )

@app.get("/")
async def root():
    return {"message": "API is running"}

@app.get("/health")  # Changed from route to get
async def health():
    return {'status': 'healthy'}

@app.post("/get_messages")
async def get_messages(request: Request):
    try:
        data = await request.json()
        thread_ids = data.get('thread_ids', [])
        is_global = data.get('is_global', False)

        conn = get_connection(connection_pool)
        try:
            if thread_ids:
                # Get messages for specific threads
                query = """
                    WITH LastSteps AS (
                        SELECT 
                            metadata->>'thread_id' as thread_id, 
                            MAX((metadata->>'step')::integer) as max_step
                        FROM checkpoints
                        WHERE metadata->>'thread_id' = ANY(%s::text[])
                        GROUP BY metadata->>'thread_id'
                    )
                    SELECT 
                        metadata -> 'writes' as query,
                        metadata->>'thread_id' as thread_id
                    FROM checkpoints c
                    INNER JOIN LastSteps ls 
                        ON c.metadata->>'thread_id' = ls.thread_id 
                        AND (c.metadata->>'step')::integer = ls.max_step
                    ORDER BY ls.max_step DESC
                """
                with conn.cursor() as cur:
                    cur.execute(query, (thread_ids,))
                    result = cur.fetchall()
            else:
                # For global view
                if is_global:
                    query = """
                        WITH LastSteps AS (
                            SELECT 
                                metadata->>'thread_id' as thread_id, 
                                MAX((metadata->>'step')::integer) as max_step
                            FROM checkpoints
                            GROUP BY metadata->>'thread_id'
                        )
                        SELECT 
                            metadata -> 'writes' as query,
                            metadata->>'thread_id' as thread_id
                        FROM checkpoints c
                        INNER JOIN LastSteps ls 
                            ON c.metadata->>'thread_id' = ls.thread_id 
                            AND (c.metadata->>'step')::integer = ls.max_step
                        ORDER BY ls.max_step DESC
                        LIMIT 100
                    """
                    with conn.cursor() as cur:
                        cur.execute(query)
                        result = cur.fetchall()
                else:
                    return {"messages": [], "status": "success"}

            # Convert result to list of dicts
            messages = []
            for row in result:
                messages.append({
                    "query": row[0],  # writes
                    "thread_id": row[1]  # thread_id
                })
            return {"messages": messages, "status": "success"}

        finally:
            return_connection(connection_pool, conn)

    except Exception as e:
        logger.error(f"Error fetching messages: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "status": "error",
                "message": "Failed to fetch messages",
                "error": str(e)
            }
        )

@app.post("/messages")
async def store_message(request: Request):
    try:
        data = await request.json()
        if not (data.get('thread_id') and data.get('step') and 'writes' in data):
            raise HTTPException(
                status_code=400,
                detail={
                    "status": "error",
                    "message": "Missing required fields"
                }
            )

        async with get_connection() as conn:
            query = """
                INSERT INTO checkpoints (metadata)
                VALUES ($1)
                RETURNING id
            """
            metadata = {
                'thread_id': data['thread_id'],
                'step': data['step'],
                'writes': data['writes']
            }
            result = await conn.fetchval(query, metadata)
            
            return {
                "status": "success",
                "message": "Message stored successfully",
                "id": result
            }

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error storing message: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "status": "error",
                "message": "Failed to store message",
                "error": str(e)
            }
        )

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run("main:app", reload=True, host="0.0.0.0", port=8000)
