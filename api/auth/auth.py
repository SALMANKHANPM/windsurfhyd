import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import logging

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import EmailStr
from dotenv import load_dotenv
load_dotenv()
from .models import UserProfile, Token, UserCreate, UserLogin

# Configure logging
logger = logging.getLogger(__name__)

# Constants
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "supersecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 1 week
# Development mode flag - enable this for testing without Supabase
DEV_MODE = os.getenv("AUTH_DEV_MODE", "false").lower() == "true"

# Print environment variables securely (for debugging)
logger.info(f"SUPABASE_URL set: {SUPABASE_URL is not None}")
logger.info(f"SUPABASE_KEY set: {SUPABASE_KEY is not None}")
logger.info(f"DEV_MODE: {DEV_MODE}")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/py/auth/login")

# Development mode users (for testing without Supabase)
dev_users = {}

# Completely new implementation to avoid header issues
async def register_user(user: UserCreate) -> UserProfile:
    """Register a new user in Supabase or in dev mode."""
    if DEV_MODE:
        # Development mode - store users in memory
        logger.info(f"DEV MODE: Registering user {user.email}")
        
        # Check if user already exists
        if user.email in dev_users:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        
        # Create user with fake ID
        user_id = f"dev_{len(dev_users) + 1}"
        now = datetime.utcnow()
        
        user_profile = UserProfile(
            id=user_id,
            email=user.email,
            username=user.username,
            source_lang="eng",
            target_lang="eng",
            preferences={},
            created_at=now
        )
        
        # Store user with password for dev login
        dev_users[user.email] = {
            "profile": user_profile,
            "password": user.password
        }
        
        logger.info(f"DEV MODE: User registered: {user.email}")
        return user_profile
    
    # Production mode - use Supabase
    if not SUPABASE_URL or not SUPABASE_KEY:
        logger.error("Supabase URL or key not set")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server configuration error: Supabase not configured. Check environment variables."
        )
    
    try:
        # Use a completely new approach with explicit headers
        auth_headers = {
            "apikey": SUPABASE_KEY,
            "Content-Type": "application/json"
        }
        
        # First, register the user
        async with httpx.AsyncClient(headers=auth_headers, timeout=30.0) as client:
            signup_url = f"{SUPABASE_URL}/auth/v1/signup"
            signup_payload = {
                "email": user.email,
                "password": user.password,
                "data": {"username": user.username}
            }
            
            signup_response = await client.post(signup_url, json=signup_payload)
            
            if signup_response.status_code >= 400:
                logger.error(f"Supabase signup error: {signup_response.text}")
                error_detail = "Registration failed"
                
                try:
                    error_json = signup_response.json()
                    if 'message' in error_json:
                        error_detail = error_json['message']
                    elif 'error' in error_json:
                        error_detail = error_json['error']
                    elif 'error_description' in error_json:
                        error_detail = error_json['error_description']
                except Exception:
                    pass
                
                raise HTTPException(
                    status_code=signup_response.status_code,
                    detail=error_detail
                )
                
            auth_data = signup_response.json()
            user_id = auth_data.get('id') or auth_data.get('user', {}).get('id')
            
            if not user_id:
                logger.error(f"No user ID in Supabase response: {auth_data}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to get user ID from registration"
                )
            
            # Create JWT token
            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                data={"sub": user.email, "id": user_id},
                expires_delta=access_token_expires
            )
            
            # Return user profile
            return UserProfile(
                id=user_id,
                email=user.email,
                username=user.username,
                source_lang="eng",
                target_lang="eng",
                preferences={},
                created_at=datetime.utcnow()
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error registering user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Server error: {str(e)}"
        )

def create_access_token(data: dict, expires_delta: timedelta = None):
    """Create a new JWT token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def login_user(credentials: UserLogin) -> Token:
    """Login a user and return access token."""
    if DEV_MODE:
        # Development mode - check in-memory users
        logger.info(f"DEV MODE: Login attempt for {credentials.email}")
        
        if credentials.email not in dev_users:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        user_data = dev_users[credentials.email]
        if user_data["password"] != credentials.password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        user_profile = user_data["profile"]
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": credentials.email, "id": user_profile.id},
            expires_delta=access_token_expires
        )
        
        logger.info(f"DEV MODE: Login successful for {credentials.email}")
        return Token(
            access_token=access_token,
            token_type="bearer",
            user=user_profile
        )
    
    # Production mode - use Supabase
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server configuration error: Supabase not configured. Check environment variables."
        )
    
    try:
        # Login user with Supabase
        auth_headers = {
            "apikey": SUPABASE_KEY,
            "Content-Type": "application/json"
        }
        
        async with httpx.AsyncClient(headers=auth_headers, timeout=30.0) as client:
            login_url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
            login_payload = {
                "email": credentials.email,
                "password": credentials.password
            }
            
            login_response = await client.post(login_url, json=login_payload)
            
            if login_response.status_code >= 400:
                # Authentication failed
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password",
                    headers={"WWW-Authenticate": "Bearer"},
                )
                
            auth_data = login_response.json()
            user_id = auth_data.get('user', {}).get('id')
            
            # Create our own JWT token
            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                data={"sub": credentials.email, "id": user_id},
                expires_delta=access_token_expires
            )
            
            # Return token with user profile
            user_profile = UserProfile(
                id=user_id,
                email=credentials.email,
                username=auth_data.get('user', {}).get('user_metadata', {}).get('username', "User"),
                source_lang="eng",
                target_lang="eng",
                preferences={},
                created_at=datetime.utcnow()
            )
            
            return Token(
                access_token=access_token,
                token_type="bearer",
                user=user_profile
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error during login: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed due to server error"
        )

async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserProfile:
    """Get the current user from the token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        user_id: str = payload.get("id")
        
        if email is None or user_id is None:
            raise credentials_exception
            
        # For now, return basic user info from token
        # In a real app, you might want to fetch the latest user data from Supabase
        return UserProfile(
            id=user_id,
            email=email,
            username="User",  # Placeholder
            source_lang="eng",
            target_lang="eng",
            preferences={},
            created_at=datetime.utcnow()
        )
        
    except JWTError:
        raise credentials_exception
    except Exception as e:
        logger.exception(f"Error getting current user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Server error: {str(e)}"
        )

async def update_user_profile(user_id: str, update_data: dict) -> UserProfile:
    """Update user profile."""
    # This would normally update the profile in Supabase
    # For now, return mock data
    return UserProfile(
        id=user_id,
        email="user@example.com",
        username="User",
        source_lang=update_data.get("source_lang", "eng"),
        target_lang=update_data.get("target_lang", "eng"),
        preferences={},
        created_at=datetime.utcnow()
    ) 