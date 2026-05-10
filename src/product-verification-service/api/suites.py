from fastapi import APIRouter, HTTPException

from api.suite_loader import list_suites, get_suite

router = APIRouter(prefix="/api/v1/spec-suites", tags=["suites"])


@router.get("")
async def list_spec_suites():
    return [s.model_dump() for s in list_suites()]


@router.get("/{name}")
async def get_spec_suite(name: str):
    suite = get_suite(name)
    if not suite:
        raise HTTPException(status_code=404, detail=f"Suite '{name}' not found")
    return suite.model_dump()
