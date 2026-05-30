from fastapi import APIRouter, HTTPException
import json
import os

router = APIRouter()


@router.get("/")
async def get_emergency_numbers(country_code: str):
    data_path = "app/data/emergency_directory.json"
    if not os.path.exists(data_path):
        raise HTTPException(status_code=500, detail="Emergency directory missing")

    with open(data_path, "r") as f:
        directory = json.load(f)

    country_code = country_code.upper()
    if country_code not in directory:
        raise HTTPException(status_code=404, detail="Country code not found")

    return directory[country_code]
