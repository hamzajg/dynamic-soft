import asyncio
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect, UploadFile, File
from fastapi.responses import FileResponse, PlainTextResponse
from pathlib import Path
from typing import List, Optional
from models.local_project import (
    LocalProjectSuite, ScanRequest, ScanResult, RunOptions,
    TestFramework, TestFile, FrameAnnotationSave, FrameAnalyzeRequest
)
from services.local_project_scanner import LocalProjectScanner
from services.local_runner import LocalRunner
from core.database import db
from api.ws import broadcast
from core.config import Config
import uuid
import json
from datetime import datetime

router = APIRouter(prefix="/api/v1/local-projects", tags=["local-projects"])
scanner = LocalProjectScanner()
runner = LocalRunner(ws_broadcast=broadcast)


@router.post("/scan", response_model=ScanResult)
async def scan_project(request: ScanRequest):
    try:
        result = scanner.scan(request.path)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scan failed: {str(e)}")


@router.post("", response_model=LocalProjectSuite)
async def import_project(request: ScanRequest):
    try:
        scan_result = scanner.scan(request.path)
        project_id = uuid.uuid4().hex[:12]

        suite = LocalProjectSuite(
            id=project_id,
            name=Path(request.path).name,
            path=request.path,
            framework=scan_result.framework,
            test_files=scan_result.test_files,
            test_count=scan_result.test_count,
            created_at=datetime.now().isoformat(),
            last_synced_at=datetime.now().isoformat()
        )

        await db.insert_local_project(suite.model_dump())
        return suite
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")


@router.get("", response_model=List[LocalProjectSuite])
async def list_projects():
    projects = await db.list_local_projects()
    return [LocalProjectSuite(**p) for p in projects]


@router.get("/runs")
async def list_local_runs():
    """List all runs from local projects (verification_runs where suite matches a local project)."""
    projects = await db.list_local_projects()
    project_names = [p["name"] for p in projects]
    all_runs = []
    for name in project_names:
        runs = await db.list_runs(suite=name)
        all_runs.extend(runs)
    all_runs.sort(key=lambda r: r.get("created_at", ""), reverse=True)
    return all_runs


@router.websocket("/runs/{run_id}/ws")
async def local_run_ws(websocket: WebSocket, run_id: str):
    """WebSocket for real-time local run updates."""
    await websocket.accept()
    q: asyncio.Queue = asyncio.Queue()
    from api.ws import _clients
    _clients.setdefault(run_id, set()).add(q)
    try:
        while True:
            message = await q.get()
            await websocket.send_text(message)
    except WebSocketDisconnect:
        _clients.get(run_id, set()).discard(q)


@router.get("/runs/{run_id}")
async def get_run(run_id: str):
    """Get run details."""
    run = await db.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    tests = await db.get_test_results(run_id)
    run["test_results"] = tests
    return run


@router.get("/{project_id}", response_model=LocalProjectSuite)
async def get_project(project_id: str):
    project = await db.get_local_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return LocalProjectSuite(**project)


@router.post("/{project_id}/sync", response_model=LocalProjectSuite)
async def sync_project(project_id: str):
    project = await db.get_local_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    try:
        scan_result = scanner.scan(project["path"])
        updated = LocalProjectSuite(
            id=project_id,
            name=project["name"],
            path=project["path"],
            framework=scan_result.framework,
            test_files=scan_result.test_files,
            test_count=scan_result.test_count,
            created_at=project["created_at"],
            last_synced_at=datetime.now().isoformat()
        )
        await db.update_local_project(project_id, updated.model_dump())
        return updated
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sync failed: {str(e)}")


@router.delete("/{project_id}")
async def delete_project(project_id: str):
    project = await db.get_local_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    await db.delete_local_project(project_id)
    return {"status": "deleted"}


def _build_command_preview(
    project_path: str, framework: TestFramework,
    test_files: list[str], mode: str,
    env_vars: dict[str, str] = None,
    output_dir: str = None
) -> str:
    """Build a full command preview string with env vars."""
    path_obj = Path(project_path)
    tf = test_files[0] if test_files else None

    if framework == TestFramework.PLAYWRIGHT:
        has_pytest_ini = (path_obj / "pytest.ini").exists() or (path_obj / "e2e" / "pytest.ini").exists()
        is_python = tf and tf.endswith(".py")
        if is_python or has_pytest_ini:
            cmd_parts = ["pytest"]
            if tf:
                cmd_parts.append(tf)
            cmd_parts.extend(["-v", "--tb=short"])
        else:
            cmd_parts = ["npx", "playwright", "test", "--reporter=json"]
            if tf:
                cmd_parts.append(tf)
    elif framework == TestFramework.CYPRESS:
        cmd_parts = ["npx", "cypress", "run", "--reporter", "json"]
        if tf:
            cmd_parts.extend(["--spec", tf])
    elif framework == TestFramework.VITEST:
        cmd_parts = ["npx", "vitest", "run", "--reporter", "json"]
        if tf:
            cmd_parts.append(tf)
    elif framework == TestFramework.JEST:
        cmd_parts = ["npx", "jest", "--json"]
        if tf:
            cmd_parts.append(tf)
    else:
        is_python = tf and tf.endswith(".py")
        if is_python:
            cmd_parts = ["pytest"]
            if tf:
                cmd_parts.append(tf)
            cmd_parts.extend(["-v", "--tb=short"])
        else:
            cmd_parts = ["npm", "test"]

    # Build env var prefix matching what local_runner._build_command sets
    env_entries = {}
    if output_dir:
        env_entries["OUTPUT_DIR"] = output_dir
    env_entries["TEST_MODE"] = mode or "default"
    env_entries["CI"] = "true"
    env_entries["ANALYSIS_ENABLED"] = "false"
    if mode == "validation":
        env_entries["RECORD_SCREEN"] = "true"
    elif mode == "discovery":
        env_entries["CAPTURE_SCREENSHOTS"] = "true"

    if env_vars:
        for k, v in env_vars.items():
            env_entries[k] = v

    env_prefix = " ".join(f"{k}={v}" for k, v in env_entries.items())
    return f"{env_prefix} {' '.join(cmd_parts)}"


@router.post("/{project_id}/run")
async def run_project_tests(project_id: str, options: RunOptions):
    """Run tests for a project with selected options. Queues run and returns immediately."""
    project = await db.get_local_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    run_id = uuid.uuid4().hex[:12]
    path_obj = Path(project["path"])
    project_name = path_obj.name

    # Insert queued run entry so frontend can track it
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    base_output = str(Path(Config.OUTPUT_DIR) / "local" / f"{project_name}_{ts}_{run_id}")

    command = _build_command_preview(
        project["path"],
        TestFramework(project["framework"]),
        options.test_files,
        options.mode,
        env_vars=options.env_vars,
        output_dir=base_output
    )
    await db.insert_run(
        run_id=run_id,
        suite=project_name,
        scenario="all",
        mode=options.mode or "default",
        output_dir=base_output,
        command=command
    )

    # Start the actual test execution in background
    asyncio.create_task(runner.run(
        project_path=project["path"],
        framework=TestFramework(project["framework"]),
        test_files=options.test_files,
        mode=options.mode,
        env_vars=options.env_vars,
        run_id=run_id
    ))

    return {"run_id": run_id, "status": "queued"}


@router.get("/runs/{run_id}/tests")
async def get_run_tests(run_id: str):
    """Get per-test results for a run."""
    run = await db.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    tests = await db.get_test_results(run_id)
    return tests


@router.get("/runs/{run_id}/log")
async def get_run_log(run_id: str, test_file: str = None, log_type: str = "runner"):
    """Serve test.log for a run.
    - log_type=runner: main pytest runner output
    - log_type=detail: per-test-case detailed logs concatenated
    Optionally filter by test_file."""
    run = await db.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    output_dir = Path(run["output_dir"])

    if test_file:
        safe = test_file.replace("/", "_").replace("\\", "_").replace(".", "_")
        log_path = output_dir / safe / "test.log"
        if log_path.exists():
            return PlainTextResponse(log_path.read_text())

    if log_type == "detail":
        # Collect all per-test-case logs (dirs without results.json, not runner dirs)
        detail_logs = sorted(
            [p for p in output_dir.rglob("test.log")
             if not p.parent.joinpath("results.json").exists()
             and p.parent.name != output_dir.name],
            key=lambda p: p.stat().st_mtime
        )
        if detail_logs:
            parts = []
            for lp in detail_logs:
                header = f"{'='*60}\n# {lp.parent.name}\n{'='*60}\n"
                parts.append(header + lp.read_text())
            return PlainTextResponse("\n\n".join(parts))
        raise HTTPException(status_code=404, detail="No detail logs found")

    # Runner log: prefer logs with sibling results.json (runner dirs), newest first
    runner_logs = sorted(
        [p for p in output_dir.rglob("test.log") if p.parent.joinpath("results.json").exists()],
        key=lambda p: p.stat().st_mtime, reverse=True
    )
    if runner_logs:
        return PlainTextResponse(runner_logs[0].read_text())

    # Try the main output dir
    log_path = output_dir / "test.log"
    if log_path.exists():
        return PlainTextResponse(log_path.read_text())

    # Last resort: any test.log, newest first
    logs = sorted(output_dir.rglob("test.log"), key=lambda p: p.stat().st_mtime, reverse=True)
    if logs:
        return PlainTextResponse(logs[0].read_text())

    raise HTTPException(status_code=404, detail="No log file found")


@router.get("/runs/{run_id}/video")
async def get_run_video(run_id: str):
    """Serve video recording for a run."""
    run = await db.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    output_dir = Path(run["output_dir"])
    videos = list(output_dir.rglob("*.webm"))
    if not videos:
        raise HTTPException(status_code=404, detail="No video found")
    return FileResponse(str(videos[0]), media_type="video/webm")


@router.get("/runs/{run_id}/frames")
async def list_run_frames(run_id: str):
    """List extracted frame files for a run."""
    run = await db.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    output_dir = Path(run["output_dir"])
    frames = sorted(output_dir.rglob("frame_*.jpg"))
    return [f.name for f in frames]


@router.get("/runs/{run_id}/frames/{frame_name}")
async def get_run_frame(run_id: str, frame_name: str):
    """Serve a single frame image."""
    run = await db.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    output_dir = Path(run["output_dir"])
    for f in output_dir.rglob(frame_name):
        return FileResponse(str(f), media_type="image/jpeg")
    raise HTTPException(status_code=404, detail="Frame not found")


@router.post("/runs/{run_id}/frames/upload")
async def upload_run_frame(run_id: str, frame: UploadFile = File(...)):
    """Upload an extracted frame image for a run."""
    run = await db.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    output_dir = Path(run["output_dir"])
    ts = datetime.now().strftime("%H%M%S%f")
    name = frame.filename or f"frame_{ts}.jpg"
    if not name.endswith(".jpg"):
        name = name.rsplit(".", 1)[0] + ".jpg" if "." in name else f"frame_{ts}.jpg"
    out_path = output_dir / name
    out_path.parent.mkdir(parents=True, exist_ok=True)
    content = await frame.read()
    out_path.write_bytes(content)
    return {"frame_name": name}


@router.delete("/runs/{run_id}/frames/{frame_name}")
async def delete_run_frame(run_id: str, frame_name: str):
    """Delete an extracted frame."""
    run = await db.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    output_dir = Path(run["output_dir"])
    for f in output_dir.rglob(frame_name):
        f.unlink()
        return {"status": "deleted", "frame_name": frame_name}
    raise HTTPException(status_code=404, detail="Frame not found")


@router.get("/runs/{run_id}/screenshots")
async def list_run_screenshots(run_id: str):
    """List screenshot files for a run."""
    run = await db.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    output_dir = Path(run["output_dir"])
    screenshots = sorted(output_dir.rglob("screenshot_*.png"))
    return [f.name for f in screenshots]


@router.get("/runs/{run_id}/screenshots/{screenshot_name}")
async def get_run_screenshot(run_id: str, screenshot_name: str):
    """Serve a single screenshot."""
    run = await db.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    output_dir = Path(run["output_dir"])
    for f in output_dir.rglob(screenshot_name):
        return FileResponse(str(f), media_type="image/png")
    raise HTTPException(status_code=404, detail="Screenshot not found")


@router.get("/runs/{run_id}/report")
async def get_run_report(run_id: str):
    """Serve analysis report for a run."""
    run = await db.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    output_dir = Path(run["output_dir"])
    for name in ["analysis.md", "discovery.md"]:
        report_path = output_dir / name
        if report_path.exists():
            return PlainTextResponse(report_path.read_text())
    raise HTTPException(status_code=404, detail="No report found")


@router.get("/runs/{run_id}/results")
async def get_run_results(run_id: str):
    """Serve parsed test results (results.json) for a run."""
    run = await db.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    output_dir = Path(run["output_dir"])
    results_files = list(output_dir.rglob("results.json"))
    if results_files:
        return json.loads(results_files[0].read_text())
    # Fallback: build from database test_results
    tests = await db.get_test_results(run_id)
    if tests:
        return {
            "framework": run.get("mode", "default"),
            "total": run.get("total", 0),
            "passed": run.get("passed", 0),
            "failed": run.get("failed", 0),
            "errors": 0,
            "duration_ms": run.get("duration_ms", 0),
            "results": [{"name": t["test_file"], "status": t["status"]} for t in tests]
        }
    raise HTTPException(status_code=404, detail="No results found")


@router.post("/runs/{run_id}/frames/{frame_name}/annotations")
async def save_frame_annotation(run_id: str, frame_name: str, annotation: FrameAnnotationSave):
    """Save annotations for a frame."""
    run = await db.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    ann_id = uuid.uuid4().hex[:12]
    await db.save_annotation(ann_id, run_id, frame_name, annotation.shapes, annotation.description)
    return {"id": ann_id, "status": "saved"}


@router.get("/runs/{run_id}/frames/{frame_name}/annotations")
async def get_frame_annotation(run_id: str, frame_name: str):
    """Get annotations for a frame."""
    ann = await db.get_annotation(run_id, frame_name)
    if not ann:
        return {"id": "", "run_id": run_id, "frame_name": frame_name, "shapes": [], "description": ""}
    return ann


@router.post("/runs/{run_id}/frames/{frame_name}/analyze")
async def analyze_frame(run_id: str, frame_name: str, opts: FrameAnalyzeRequest = None):
    """Run AI analysis on a single frame.
    Optional body: { "backend": "ollama"|"opencode", "model": "llava" }"""
    run = await db.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")

    output_dir = Path(run["output_dir"])
    frame_path = None
    for f in output_dir.rglob(frame_name):
        frame_path = f
        break

    if not frame_path or not frame_path.exists():
        raise HTTPException(status_code=404, detail="Frame not found")

    try:
        from analysis.pipeline import describe_single_frame
        backend = opts.backend if opts and opts.backend else None
        model = opts.model if opts and opts.model else None
        description = await describe_single_frame(str(frame_path), backend=backend, model=model)
        return {"frame_name": frame_name, "description": description, "backend": backend or "default", "model": model or "default"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
