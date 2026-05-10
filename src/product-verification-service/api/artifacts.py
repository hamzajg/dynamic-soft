import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, Response

from services.artifact_store import ArtifactStore

router = APIRouter(prefix="/api/v1/verifications", tags=["artifacts"])
store = ArtifactStore()


@router.get("/{run_id}/log")
async def get_log(run_id: str, suite: str, scenario: str):
    path = store.run_dir(suite, scenario) / "test.log"
    if not path.exists():
        raise HTTPException(status_code=404, detail="Log not found")
    return Response(content=path.read_text(), media_type="text/plain")


@router.get("/{run_id}/screenshots")
async def list_screenshots(run_id: str, suite: str, scenario: str):
    files = store.list_files(suite, scenario)
    return [f for f in files if f.startswith("screenshot_") and f.endswith(".png")]


@router.get("/{run_id}/screenshots/{filename}")
async def get_screenshot(run_id: str, suite: str, scenario: str, filename: str):
    path = store.screenshot_path(suite, scenario, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Screenshot not found")
    return FileResponse(path, media_type="image/png")


@router.get("/{run_id}/frames")
async def list_frames(run_id: str, suite: str, scenario: str):
    return store.list_files(suite, scenario, subdir="frames")


@router.get("/{run_id}/frames/{filename}")
async def get_frame(run_id: str, suite: str, scenario: str, filename: str):
    path = store.frame_path(suite, scenario, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Frame not found")
    return FileResponse(path, media_type="image/jpeg")


@router.get("/{run_id}/video")
async def get_video(run_id: str, suite: str, scenario: str):
    path = store.video_path(suite, scenario)
    if not path:
        raise HTTPException(status_code=404, detail="Video not found")
    return FileResponse(path, media_type="video/webm")


@router.get("/{run_id}/report")
async def get_report(run_id: str, suite: str, scenario: str):
    path = store.run_dir(suite, scenario) / "analysis.md"
    if not path.exists():
        path = store.run_dir(suite, scenario) / "discovery.md"
    if not path.exists():
        raise HTTPException(status_code=404, detail="Report not found")
    return Response(content=path.read_text(), media_type="text/markdown")
