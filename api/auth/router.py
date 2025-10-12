from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from .models import UserCreate, UserLogin, UserProfile, UserUpdate, Token, LanguagePreference
from .auth import register_user, login_user, get_current_user, update_user_profile

router = APIRouter(prefix="/api/py/auth", tags=["auth"])

@router.post("/register", response_model=UserProfile)
async def register(user: UserCreate):
    """Register a new user"""
    try:
        return await register_user(user)
    except HTTPException:
        # Re-raise HTTPException as is
        raise
    except Exception as e:
        # Log the actual error but return a sanitized message
        logger.exception(f"Unexpected error during registration: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed. Please try again later."
        )

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login user and return token"""
    credentials = UserLogin(email=form_data.username, password=form_data.password)
    return await login_user(credentials)

@router.get("/me", response_model=UserProfile)
async def get_profile(current_user: UserProfile = Depends(get_current_user)):
    """Get current user profile"""
    return current_user

@router.put("/dashboard", response_model=UserProfile)
async def update_profile(
    update_data: UserUpdate,
    current_user: UserProfile = Depends(get_current_user)
):
    """Update user profile"""
    update_dict = update_data.dict(exclude_unset=True)
    return await update_user_profile(current_user.id, update_dict)

@router.put("/languages", response_model=UserProfile)
async def update_languages(
    language_preference: LanguagePreference,
    current_user: UserProfile = Depends(get_current_user)
):
    """Update user language preferences"""
    return await update_user_profile(
        current_user.id,
        {
            "source_lang": language_preference.source_lang,
            "target_lang": language_preference.target_lang
        }
    ) 