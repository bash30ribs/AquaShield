"""
AquaShield AI — Database Connection & Engine Setup
Includes Schema Initialization & Pre-seeded User Accounts & Field Reports
"""
import uuid
import hashlib
import secrets
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import select
from app.config import settings

engine = create_async_engine(
    settings.database_url,
    echo=False,
    connect_args={"check_same_thread": False} if "sqlite" in settings.database_url else {}
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)

class Base(DeclarativeBase):
    pass

async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

def _make_hash(password: str, salt: str = "aquashield_salt") -> str:
    pw_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000)
    return f"{salt}${pw_hash.hex()}"

async def init_db():
    from app.models.user import User, UserRole
    from app.models.report import CommunityReport, ReportType, ReportStatus

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed demo users & reports if table empty
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User))
        existing_users = result.scalars().all()
        if not existing_users:
            demo_users = [
                User(
                    id=str(uuid.uuid4()),
                    badge_id="SENTINEL-7049",
                    name="Commander Rajesh Varma",
                    email="commander@aquashield.marine",
                    phone="+91-98201-99410",
                    password_hash=_make_hash("Sentinel@2026", "salt_commander"),
                    role=UserRole.authority,
                    region="Mumbai Sector Alpha",
                    is_active=True
                ),
                User(
                    id=str(uuid.uuid4()),
                    badge_id="RESCUE-9012",
                    name="Dr. Ananya Iyer",
                    email="rescue.lead@aquashield.marine",
                    phone="+91-98202-88120",
                    password_hash=_make_hash("Rescue@2026", "salt_ngo"),
                    role=UserRole.ngo,
                    region="Konkan Coastal Zone",
                    is_active=True
                ),
                User(
                    id=str(uuid.uuid4()),
                    badge_id="NDMA-3301",
                    name="Lt. Vikram Singh",
                    email="responder@aquashield.marine",
                    phone="+91-98203-77230",
                    password_hash=_make_hash("Ndma@2026", "salt_ndma"),
                    role=UserRole.rescue_team,
                    region="Arabian Sea West Coast",
                    is_active=True
                ),
                User(
                    id=str(uuid.uuid4()),
                    badge_id="CITIZEN-1084",
                    name="Aarav Patil",
                    email="citizen@aquashield.marine",
                    phone="+91-98204-66340",
                    password_hash=_make_hash("Citizen@2026", "salt_citizen"),
                    role=UserRole.citizen,
                    region="Worli Sea Face",
                    is_active=True
                ),
            ]
            session.add_all(demo_users)
            await session.commit()

        # Seed sample field reports
        report_res = await session.execute(select(CommunityReport))
        existing_reports = report_res.scalars().all()
        if not existing_reports:
            sample_reports = [
                CommunityReport(
                    id="REP-94812",
                    title="High Tidal Surge Breach at Bandra Promenade",
                    reporter_name="Aarav Patil",
                    reporter_badge="CITIZEN-1084",
                    report_type=ReportType.flood,
                    description="Sea water overtopping barrier walls during high tide. Water depth approximately 1.5m on access road.",
                    latitude=19.054,
                    longitude=72.822,
                    address="Bandra Bandstand Promenade",
                    ai_verified=True,
                    ai_confidence=97.8,
                    ai_flood_detected=True,
                    ai_water_level_m=1.5,
                    is_fake=False,
                    urgency_rank=8,
                    status=ReportStatus.verified,
                    created_at=datetime.utcnow()
                ),
                CommunityReport(
                    id="REP-88231",
                    title="Stranded Olive Ridley Turtle on Versova Beach",
                    reporter_name="Dr. Ananya Iyer",
                    reporter_badge="RESCUE-9012",
                    report_type=ReportType.marine_animal,
                    description="Juvenile sea turtle trapped in discarded nylon driftnet. Breathing stable but requires hydration and flipper treatment.",
                    latitude=19.131,
                    longitude=72.812,
                    address="Versova North Beach Sector 3",
                    ai_verified=True,
                    ai_confidence=99.2,
                    ai_flood_detected=False,
                    ai_water_level_m=0.0,
                    is_fake=False,
                    urgency_rank=9,
                    status=ReportStatus.verified,
                    created_at=datetime.utcnow()
                ),
                CommunityReport(
                    id="REP-77104",
                    title="Hydrocarbon Slick Sheen Near Malabar Shoal",
                    reporter_name="Commander Rajesh Varma",
                    reporter_badge="SENTINEL-7049",
                    report_type=ReportType.oil_spill,
                    description="Visual surface sheen stretching approximately 600m drifting southwest. Coast guard boom containment deployed.",
                    latitude=18.945,
                    longitude=72.785,
                    address="Malabar Point Offshore 1.2km",
                    ai_verified=True,
                    ai_confidence=96.5,
                    ai_flood_detected=False,
                    ai_water_level_m=0.0,
                    is_fake=False,
                    urgency_rank=7,
                    status=ReportStatus.verified,
                    created_at=datetime.utcnow()
                )
            ]
            session.add_all(sample_reports)
            await session.commit()
