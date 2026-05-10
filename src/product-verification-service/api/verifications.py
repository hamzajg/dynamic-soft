from fastapi import APIRouter, HTTPException, Depends
from typing import Optional

from ..models.verification_run import TriggerRunRequest, TriggerRunResponse
from ..core.database import get_db
from .suite_loader import get_suite
from ..services.spec_runner import SpecRunner
from ..services.repo_manager import RepoManager
from ..services.artifact_store import ArtifactStore

router = APIRouter(prefix="/api/v1/verifications", tags=["verifications"])

_ws_clients = {}

def ws_broadcast(run_id, message):
    clients = _ws_clients.get(run_id, set())
    import asyncio
    for q in list(clients):
        try:
            q.put_nowait(message)
        except Exception:
            pass


@router.post("")
async def trigger_run(req: TriggerRunRequest):
    suite = get_suite(req.suite)
    if not suite:
        raise HTTPException(status_code=404, detail=f"Suite '{req.suite}' not found")
    if req.scenario not in suite.scenarios:
        raise HTTPException(status_code=400, detail=f"Scenario '{req.scenario}' not in suite '{req.suite}'")
    if req.mode not in ("default", "validation", "discovery"):
        raise HTTPException(status_code=400, detail=f"Invalid mode '{req.mode}'")

    repo_manager = RepoManager()
    runner = SpecRunner(repo_manager, ws_broadcast=ws_broadcast)
    db = await get_db()
    run_id = await runner.run(suite, req.scenario, req.mode)

    run = await db.get_run(run_id)
    return TriggerRunResponse(run_id=run_id, status=run["status"] if run else "error", message="Run completed")


@router.get("")
async def list_runs(
    suite: Optional[str] = None,
    mode: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
):
    db = await get_db()
    return await db.list_runs(suite=suite, mode=mode, status=status, limit=limit, offset=offset)


@router.get("/{run_id}")
async def get_run(run_id: str):
    db = await get_db()
    run = await db.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    return run


@router.delete("/{run_id}")
async def delete_run(run_id: str):
    db = await get_db()
    run = await db.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    await db.delete_run(run_id)
    return {"message": "Run deleted"}
