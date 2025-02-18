from fastapi import FastAPI,HTTPException
from dotenv import load_dotenv
import os
import json
from web3 import Web3
# from web3.middleware import geth_poa_middleware
from eth_account import Account
from pydantic import BaseModel

load_dotenv()

NODES = os.getenv("NODES_URL")
w3 = Web3(Web3.HTTPProvider(NODES))
# w3.middleware_onion.inject(geth_poa_middleware, layer=0)

ADMINS_PRIVATE_KEY = os.getenv("PRIVATE_KEY")
# ADMINS_PUBLIC_KEY = os.getenv("PUBLIC KEY")

global admin_account
# admin_account = w3.eth.account.privateKeyToAccount(ADMINS_PRIVATE_KEY)
admin_account = Account.from_key(ADMINS_PRIVATE_KEY)

CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")  # Deployed contract address
with open("contract_abi.json","r") as file:
    CONTRACT_ABI = json.load(file)
with open("contract_bytecode.json","r") as file:
    CONTRACT_BYTECODE = json.load(file)
contract = w3.eth.contract(address=CONTRACT_ADDRESS,abi=CONTRACT_ABI,bytecode=CONTRACT_BYTECODE)


if not w3.is_connected():
    raise Exception("Not connected to Ethereum network!")
    
def send_transaction(function_call):
    nonce = w3.eth.get_transaction_count(admin_account.address)
    txn = function_call.build_transaction({
        "from": admin_account.address,
        "nonce": nonce,
        "chainId":11155111,
    })
    # signed_txn = w3.eth.account.sign_transaction(txn,admin_account.private_key)
    signed_txn = w3.eth.account.sign_transaction(txn,ADMINS_PRIVATE_KEY)
    txn_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
    return w3.to_hex(txn_hash)

class NillionAddress(BaseModel):
    address: str

# @app.post("/mint_original_sbt")
def mint_original_sbt():
    try:
        txn_hash = send_transaction(contract.functions.mintOriginalSBT())
        return {"status": "Original SBT Minted", "txn_hash": txn_hash}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# @app.post("/register_and_mint")
def register_and_mint(nillion: NillionAddress):
    try:
        txn_hash = send_transaction(contract.functions.registerAndMint(nillion.address))
        return {"status": "SBT Minted and Address Mapped", "txn_hash": txn_hash}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# @app.get("/is_mapped/{nillion_address}")
def is_mapped(nillion_address: str):
    try:
        mapped = contract.functions.isMapped(nillion_address).call()
        return {"address": nillion_address, "mapped": mapped}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

send_transaction(contract.constructor(admin_account.address))
