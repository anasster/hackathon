"""File for running endpoint tests"""

from main import app, CollectionPostRequest, ItemPostRequest
from fastapi.testclient import TestClient
import os
from models import *
from generate import create_jwt
import json


# Test client
client = TestClient(app)

NODE_IDS = ['did:nil:testnet:nillion14x47xx85de0rg9dqunsdxg8jh82nvkax3jrl5g']
DID = 'did:nil:testnet:nillion1qp2en7x0glpfcl6nszspcnx9d6kc7s2gcz7qxm'
SECRET_KEY = 'cc23c24a88e40ee411b7d997c1d649dc455d768c896e2080b5ddb6fc622d292a'
NODE_URL = 'https://nildb-rl5g.nillion.network'
JWT = create_jwt(SECRET_KEY, DID, NODE_IDS)[0]


# GET /api 
def test_get_main_page():
    """Main page test"""
    response = client.get('/api')
    assert response.status_code == 200
    assert response.json() == {'Message': 'Welcome'}

# POST /api/image
def test_upload_image():
    """Image upload"""
    with open(os.path.abspath('Greek_identity_card_front.png'), 'rb') as file_data:
        file = {'file': (os.path.abspath('Greek_identity_card_front.png'), file_data, 'image/png')}
        response = client.post('/api/image', files=file)
    assert response.status_code == 200
    assert response.json()['status'] == 'uploaded'

# POST /api/collections
def test_upload_collection():
    """Collection upload"""
    
    request = CollectionPostRequest(model=generate_nilDB_schema(GreekID))
    headers = {
        "Proxy-Authorization": f"{NODE_URL};{JWT}"
    }
    response = client.post("/api/collections", json=request.model_dump(), headers=headers)

    assert response.status_code == 200

# GET /api/collections
def test_get_collections():
    """Collection get"""
    headers = {
        "Proxy-Authorization": f'{NODE_URL};{JWT}'
    }
    response = client.get("/api/collections", headers=headers)

    assert response.status_code == 200
  

# POST /api/collections/{id}/item
def test_upload_item():
    """Item upload"""
    headers = {
        "Proxy-Authorization": f'{NODE_URL};{JWT}'
    }
    collection_id = "c6d57cfa-aa1a-4710-8eea-e8f3832c66df"
    item = GreekID(
        id=uuid4(),
        id_num="1234567890", 
        given_name="John", 
        surname="Doe", 
        father_name="John", 
        father_surname="Doe", 
        mother_name="Jane", 
        mother_surname="Doe", 
        date_of_birth=datetime(1990, 12, 25), 
        place_of_birth="Athens", 
        issue_date=datetime(2000, 2, 2), 
        issue_office="Athens"
    )
    request = ItemPostRequest(item=generate_item_dict(item))

    response = client.post(f"/api/collections/{collection_id}/item", json=request.model_dump(), headers=headers)
    assert response.status_code == 200