"""
FastAPI Router: Safe Route Recommendation
"""
from fastapi import APIRouter
from app.services.route_service import RouteService

router = APIRouter(prefix="/api/routes", tags=["Safe Routes"])

@router.post("/calculate-safe")
def calculate_safe_route(from_loc: str = "Ratnagiri Beach Area", to_loc: str = "Ratnagiri Relief Camp", disaster: str = "Cyclone"):
    return RouteService.calculate_safe_route(from_loc, to_loc, disaster)
