"""
AquaShield AI — Database Connection & Engine Setup
Includes Schema Initialization & Pre-seeded User Accounts & Field Reports
"""
import uuid
import hashlib
import secrets
from datetime import datetime, timezone
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
    from app.models.disaster import Disaster, DisasterType, SeverityLevel
    from app.models.marine_rescue import MarineRescue, Species, RescueStatus
    from app.models.complaint import ConversationalComplaint
    from app.models.sos_event import SOSEvent, SOSStatus                  # new
    from app.models.broadcast_alert import BroadcastAlert                 # new

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
                    created_at=datetime.now(timezone.utc)
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
                    created_at=datetime.now(timezone.utc)
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
                    created_at=datetime.now(timezone.utc)
                )
            ]
            session.add_all(sample_reports)
            await session.commit()

        # Seed initial marine rescues if empty
        marine_res = await session.execute(select(MarineRescue))
        existing_rescues = marine_res.scalars().all()
        if not existing_rescues:
            sample_rescues = [
                MarineRescue(
                    id="MAR-001",
                    species=Species.turtle,
                    species_detail="Olive Ridley Turtle",
                    injury_severity="Moderate",
                    description="Juvenile turtle entangled in nylon ghost net on Versova beach, dehydrated but responsive.",
                    beach_name="Versova North Beach",
                    latitude=19.1310,
                    longitude=72.8120,
                    ngo_assigned="Sea Turtle Conservation Foundation",
                    status=RescueStatus.ngo_alerted,
                    created_at=datetime.now(timezone.utc)
                ),
                MarineRescue(
                    id="MAR-002",
                    species=Species.dolphin,
                    species_detail="Bottlenose Dolphin",
                    injury_severity="Low",
                    description="Stranded in intertidal sandbar during sudden low tide. Monitored by local civil defense lifeguards.",
                    beach_name="Juhu Beach Intertidal Zone",
                    latitude=19.0988,
                    longitude=72.8264,
                    ngo_assigned="Wildlife SOS Marine Wing",
                    status=RescueStatus.in_rescue,
                    created_at=datetime.now(timezone.utc)
                )
            ]
            session.add_all(sample_rescues)
            await session.commit()

        # ── Seed disasters table if empty ────────────────────────────────────
        disaster_res = await session.execute(select(Disaster))
        if not disaster_res.scalars().all():
            seed_disasters = [
                Disaster(
                    id          = str(uuid.uuid4()),
                    type        = DisasterType.cyclone,
                    severity    = SeverityLevel.severe,
                    title       = "Cyclone Biparjoy: Maharashtra Coast",
                    description = "Fishermen advised not to venture into deep sea. Wind 95 km/h, swells 4.2m.",
                    latitude    = 16.7,
                    longitude   = 73.3,
                    region      = "Maharashtra Coast",
                    state       = "Maharashtra",
                    radius_km   = 120.0,
                    source      = "IMD / INCOIS",
                    is_active   = True,
                    started_at  = datetime.now(timezone.utc),
                    created_at  = datetime.now(timezone.utc),
                ),
                Disaster(
                    id          = str(uuid.uuid4()),
                    type        = DisasterType.high_tide,
                    severity    = SeverityLevel.high,
                    title       = "High Waves Advisory: Kerala & Goa",
                    description = "Rough sea conditions with swell heights up to 3.8m. Beach access restricted.",
                    latitude    = 9.9,
                    longitude   = 76.3,
                    region      = "Kerala & Goa",
                    state       = "Kerala",
                    radius_km   = 80.0,
                    source      = "INCOIS Buoy Network",
                    is_active   = True,
                    started_at  = datetime.now(timezone.utc),
                    created_at  = datetime.now(timezone.utc),
                ),
                Disaster(
                    id          = str(uuid.uuid4()),
                    type        = DisasterType.rainfall,
                    severity    = SeverityLevel.moderate,
                    title       = "Heavy Rainfall Warning: Karnataka",
                    description = "Localized coastal waterlogging in low-lying sectors.",
                    latitude    = 13.1,
                    longitude   = 74.8,
                    region      = "Karnataka",
                    state       = "Karnataka",
                    radius_km   = 50.0,
                    source      = "IMD Regional Centre",
                    is_active   = True,
                    started_at  = datetime.now(timezone.utc),
                    created_at  = datetime.now(timezone.utc),
                ),
                Disaster(
                    id          = str(uuid.uuid4()),
                    type        = DisasterType.tsunami,
                    severity    = SeverityLevel.safe,
                    title       = "Tsunami Watch Cleared: Tamil Nadu",
                    description = "Seismic ocean activity normal, green swim flags active.",
                    latitude    = 13.0,
                    longitude   = 80.2,
                    region      = "Tamil Nadu",
                    state       = "Tamil Nadu",
                    radius_km   = 30.0,
                    source      = "NIOT / INCOIS",
                    is_active   = True,
                    started_at  = datetime.now(timezone.utc),
                    created_at  = datetime.now(timezone.utc),
                ),
            ]
            session.add_all(seed_disasters)
            await session.commit()

        # ── Seed broadcast_alerts with the initial alert if empty ────────────
        bc_res = await session.execute(select(BroadcastAlert))
        if not bc_res.scalars().all():
            session.add(BroadcastAlert(
                id          = "ALERT-INIT0001",
                alert_type  = "Cyclone Warning",
                message     = "RED ALERT: Cyclone Biparjoy approaching Maharashtra coast. Wind speed 95 km/h. Evacuate to high ground immediately.",
                sender      = "NDMA Authority",
                location    = "Ratnagiri & South Konkan",
                severity    = "CRITICAL",
                origin_mode = "Online Server Broadcast",
                created_at  = datetime.now(timezone.utc),
            ))
            await session.commit()

