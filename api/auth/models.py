from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, Dict, Any, List
from datetime import datetime
import re

class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    
class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    
    @validator('password')
    def password_strength(cls, v):
        """Check password meets strength requirements"""
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one number')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfile(UserBase):
    id: str
    created_at: datetime
    source_lang: str = "eng"  # Default source language
    target_lang: str = "eng"  # Default target language
    preferences: Dict[str, Any] = {}
    
class UserUpdate(BaseModel):
    username: Optional[str] = None
    source_lang: Optional[str] = None
    target_lang: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfile

class LanguagePreference(BaseModel):
    source_lang: str
    target_lang: str 