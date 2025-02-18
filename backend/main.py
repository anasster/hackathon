"""Endpoints"""

from typing import Dict, Union, Annotated, List
from fastapi import FastAPI, UploadFile, Header, HTTPException, File
from models import *
import shutil
from uuid import uuid4, UUID
import os
import httpx
import json
import logging
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI() 


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api")
async def welcome_page():
    try:
        return {"Message": "Welcome"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f'Error: {e}')


@app.post("/api/image")
async def upload_image(file: UploadFile):
    if file.content_type not in {"image/png", "image/jpeg"}:
        raise HTTPException(status_code=400, detail='File must be a JPEG or PNG image')
    try:
        temp_dir = f'temp/{file.filename}'
        os.makedirs('temp', exist_ok=True)
        with open(temp_dir, 'wb') as fw:
            shutil.copyfileobj(file.file, fw)
        return {
            "file": file.filename,
            "status": "uploaded"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Error: {e}')


# @app.middleware("ocr")
# class OCR:
#     pass


class CollectionPostRequest(BaseModel):
    model: dict

@app.post("/api/collections")
async def create_collection(request: CollectionPostRequest, proxy_authorization: Annotated[str, Header(alias="Proxy-Authorization")]):
    try:
        node_url, jwt = proxy_authorization.split(';')
        url = f'{node_url}/api/v1/schemas'
        headers = {
            "Authorization": f"Bearer {jwt}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        payload = {
            '_id': str(uuid4()),
            'name': request.model['items']['title'],
            'keys': ['_id'],
            'schema': request.model
        }
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
        return response.json()
    except httpx.RequestError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f'Error: {e}')
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Error: {e}')


@app.get("/api/collections")
async def get_collections(proxy_authorization: Annotated[str, Header(alias="Proxy-Authorization")]):
    try:
        node_url, jwt = proxy_authorization.split(';')
        
        url = f'{node_url}/api/v1/schemas'
        headers = {
            "Authorization": f"Bearer {jwt}",
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
        return response.json()
    except ValueError:
        raise HTTPException(status_code=400, detail='Invalid Proxy-Authorization header format')
    except httpx.RequestError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f'Error: {e}') 
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Error: {e}')          
    
class ItemPostRequest(BaseModel):
    item: dict
    
@app.post("/api/collections/{collection_id}/item")
async def upload_new_item(collection_id: str, request: ItemPostRequest, proxy_authorization: Annotated[str, Header(alias="Proxy-Authorization")]):
    try:
        node_url, jwt = proxy_authorization.split(';')
        url = f'{node_url}/api/v1/data/create'
        headers = {
            "Authorization": f"Bearer {jwt}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        payload = {
            "schema": collection_id,
            "data": [request.item]
        }
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
        return response.json()
    except ValueError:
        raise HTTPException(status_code=400, detail='Invalid Proxy-Authorization header format')
    except httpx.RequestError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f'Error: {e}') 
    except Exception as e:
        logging.error(f'Error: {e}')
        raise HTTPException(status_code=500, detail=f'Error: {e}')
    

@app.get("/api/collections/{collection_id}/item/{wallet_id}")
async def get_item(collection_id: str, wallet_id: str, proxy_authorization: Annotated[str, Header(alias="Proxy-Authorization")]):
    try:
        node_url, jwt = proxy_authorization.split(';')
        url = f'{node_url}/api/v1/data/read'
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": f"Bearer {jwt}"    
        }
        payload = {
            "schema": collection_id,
            "filters": {
                "wallet_id": wallet_id
            }
        }
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()
        return response.json()
    except ValueError:
        logging.error(f'Invalid Proxy-Authorization header format')
        raise HTTPException(status_code=400, detail='Invalid Proxy-Authorization header format')
    except httpx.RequestError as e:
        logging.error(f'RequestError: {e}')
        raise HTTPException(status_code=e.response.status_code, detail=f'Error: {e}') 
    except Exception as e:
        logging.error(f'Exception: {e}')
        raise HTTPException(status_code=500, detail=f'Error: {e}')
