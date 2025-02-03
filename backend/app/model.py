# MongoDB models/schemas
from pydantic import BaseModel, EmailStr
from typing import Optional
from bson import ObjectId

class User(BaseModel):
    id: Optional[str] = None  # This will be the MongoDB ObjectId
    name: str
    email: EmailStr
    password: str  # You should hash this before storing
    wardrobe: list = []  # List of clothing items

    class Config:
        orm_mode = True
