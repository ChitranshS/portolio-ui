import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from fastapi import FastAPI, HTTPException, Request
from dotenv import load_dotenv
import os
from rag.logic import query_handler
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

@app.post("/chat")
async def handle_chat(request: Request):
    handler = None
    try:
        data = await request.json()
        if data.get('query'):
             response = query_handler(data)
             return {
            "query": data['query'],
            "id": data['id'],
            "response": response,
            "status": "Request processed successfully"
            }
        else:
            handler = HTTPException(
                status_code=404,
                detail={
                    "status": "Fields Missing",
                    "error": "Not Allowed"
                }
            )
            raise handler
           
    except:
        if handler is not None:
            raise handler
        else:
            raise HTTPException(
            status_code=400,
            detail={
                "status": "Invalid Payload",
                "error": "Not Allowed"
            }
        )
    

@app.post("/add_resume")
async def handle_resume(request: Request):
    handler = None
    try:
        # print(type(request))
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