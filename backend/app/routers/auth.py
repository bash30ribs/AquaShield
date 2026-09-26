"""
FastAPI Router: Authentication & User Credentials
Supports Login by Login ID (Badge ID), Email, or UUID with PBKDF2 Password Hashing
"""
import hashlib
import os
import secrets
import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User, UserRole

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

def hash_password(password: str, salt: Optional[str] = None) -> str:
    """PBKDF2-HMAC-SHA256 password hasher with salt"""
    if not salt:
        salt = secrets.token_hex(16)
    pw_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000)
    return f"{salt}${pw_hash.hex()}"

def verify_password(plain_password: str, stored_hash: str) -> bool:
    """Verifies plain password against stored salt$hash"""
    try:
        salt, hash_hex = stored_hash.split("$", 1)
        expected_hash = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt.encode("utf-8"), 100000).hex()
        return secrets.compare_digest(hash_hex, expected_hash)
    except Exception:
        return False

# Pydantic Schemas
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "citizen"
    phone: Optional[str] = None
    region: Optional[str] = "Coastal Zone"

class LoginRequest(BaseModel):
    identifier: str  # Can be Login ID (badge), Email, or User ID
    password: str

class UserResponse(BaseModel):
    id: str
    badge_id: str
    name: str
    email: str
    role: str
    region: Optional[str]
    phone: Optional[str]
    created_at: datetime
    token: str

@router.post("/register", response_model=UserResponse)
async def register_user(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    # Check if email exists
    result = await db.execute(select(User).where(User.email == req.email.strip().lower()))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="User with this email already registered.")

    # Generate unique Badge / Login ID
    prefix_map = {
        "authority": "SENTINEL",
        "ngo": "RESCUE",
        "rescue_team": "NDMA",
        "citizen": "CITIZEN"
    }
    role_enum = UserRole.citizen
    try:
        role_enum = UserRole(req.role.lower())
    except Exception:
        role_enum = UserRole.citizen

    prefix = prefix_map.get(role_enum.value, "USER")
    badge_id = f"{prefix}-{secrets.randbelow(9000) + 1000}"

    user_id = str(uuid.uuid4())
    pw_hash = hash_password(req.password)

    new_user = User(
        id=user_id,
        badge_id=badge_id,
        name=req.name.strip(),
        email=req.email.strip().lower(),
        phone=req.phone,
        password_hash=pw_hash,
        role=role_enum,
        region=req.region or "Sector 1",
        is_active=True
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # Issue auth token
    token = f"aq_{secrets.token_urlsafe(24)}"

    return UserResponse(
        id=new_user.id,
        badge_id=new_user.badge_id,
        name=new_user.name,
        email=new_user.email,
        role=new_user.role.value,
        region=new_user.region,
        phone=new_user.phone,
        created_at=new_user.created_at,
        token=token
    )

@router.post("/login", response_model=UserResponse)
async def login_user(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    ident = req.identifier.strip()
    
    # Query by badge_id, email, or id
    stmt = select(User).where(
        or_(
            User.badge_id == ident.upper(),
            User.email == ident.lower(),
            User.id == ident
        )
    )
    result = await db.execute(stmt)
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Login ID or Email")

    if not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Password")

    token = f"aq_{secrets.token_urlsafe(24)}"

    return UserResponse(
        id=user.id,
        badge_id=user.badge_id or f"USER-{user.id[:4]}",
        name=user.name,
        email=user.email,
        role=user.role.value,
        region=user.region,
        phone=user.phone,
        created_at=user.created_at,
        token=token
    )

@router.get("/demo-users")
async def get_demo_users():
    """Returns official preset operator and citizen test credentials for easy access"""
    return {
        "status": "success",
        "demo_accounts": [
            {
                "role": "Coastal Commander / Authority",
                "name": "Commander Rajesh Varma",
                "login_id": "SENTINEL-7049",
                "email": "commander@aquashield.marine",
                "password": "Sentinel@2026",
                "sector": "Mumbai Sector Alpha"
            },
            {
                "role": "Marine Rescue NGO Specialist",
                "name": "Dr. Ananya Iyer",
                "login_id": "RESCUE-9012",
                "email": "rescue.lead@aquashield.marine",
                "password": "Rescue@2026",
                "sector": "Konkan Coastal Zone"
            },
            {
                "role": "NDMA Rapid Response Officer",
                "name": "Lt. Vikram Singh",
                "login_id": "NDMA-3301",
                "email": "responder@aquashield.marine",
                "password": "Ndma@2026",
                "sector": "Arabian Sea West Coast"
            },
            {
                "role": "Citizen Coastal Scout",
                "name": "Aarav Patil",
                "login_id": "CITIZEN-1084",
                "email": "citizen@aquashield.marine",
                "password": "Citizen@2026",
                "sector": "Worli Sea Face"
            }
        ]
    }
