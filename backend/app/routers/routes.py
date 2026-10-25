from typing import Optional
from fastapi import APIRouter, Request, Query, Form
from pydantic import BaseModel
from app.services.route_service import RouteService

router = APIRouter(prefix="/api/routes", tags=["Safe Routes"])

class RouteCalcRequest(BaseModel):
    from_loc: Optional[str] = "Ratnagiri Beach Area"
    to_loc: Optional[str] = "Ratnagiri Relief Camp"
    disaster: Optional[str] = "Cyclone"

@router.post("/calculate")
@router.post("/calculate-safe")
@router.get("/calculate")
async def calculate_safe_route(
    request: Request,
    from_loc: Optional[str] = Query(None),
    to_loc: Optional[str] = Query(None),
    disaster: Optional[str] = Query(None)
):
    orig = from_loc
    dest = to_loc
    distype = disaster

    content_type = request.headers.get("content-type", "")
    if "application/json" in content_type:
        try:
            body = await request.json()
            orig = orig or body.get("from_loc") or body.get("origin")
            dest = dest or body.get("to_loc") or body.get("destination")
            distype = distype or body.get("disaster") or body.get("disaster_type")
        except Exception:
            pass
    elif "form" in content_type:
        try:
            form = await request.form()
            orig = orig or form.get("from_loc") or form.get("origin")
            dest = dest or form.get("to_loc") or form.get("destination")
            distype = distype or form.get("disaster") or form.get("disaster_type")
        except Exception:
            pass

    return RouteService.calculate_safe_route(
        from_loc=orig or "Ratnagiri Beach Area",
        to_loc=dest or "Ratnagiri Relief Camp",
        disaster_type=distype or "Cyclone"
    )

