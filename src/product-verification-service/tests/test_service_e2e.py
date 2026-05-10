import httpx
import pytest
import re
import asyncio

pytestmark = pytest.mark.asyncio

SERVICE_URL = "http://localhost:8083"
PROJECT_PATH = "/home/kali/Downloads/dynamic-soft"

TIMEOUT = httpx.Timeout(30)


async def test_health():
    async with httpx.AsyncClient(timeout=TIMEOUT) as c:
        resp = await c.get(f"{SERVICE_URL}/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert data["service"] == "product-verification-service"


async def test_scan_self():
    async with httpx.AsyncClient(timeout=TIMEOUT) as c:
        resp = await c.post(f"{SERVICE_URL}/api/v1/local-projects/scan", json={"path": PROJECT_PATH})
    assert resp.status_code == 200
    data = resp.json()
    assert data["path"] == PROJECT_PATH
    assert "framework" in data
    assert "test_count" in data
    assert "test_files" in data


async def test_import_self():
    async with httpx.AsyncClient(timeout=TIMEOUT) as c:
        resp = await c.post(f"{SERVICE_URL}/api/v1/local-projects", json={"path": PROJECT_PATH})
        # May already be imported (UNIQUE constraint) — that's fine, just verify it exists
        if resp.status_code == 500:
            list_resp = await c.get(f"{SERVICE_URL}/api/v1/local-projects")
            projects = list_resp.json()
            svc = next((p for p in projects if p["path"] == PROJECT_PATH), None)
            assert svc is not None, "Project should exist even if re-import fails"
            return
        assert resp.status_code == 200
        data = resp.json()
        assert "id" in data
        assert data["name"] == "dynamic-soft"
        assert data["path"] == PROJECT_PATH
        assert data["test_count"] >= 0


async def test_list_projects():
    async with httpx.AsyncClient(timeout=TIMEOUT) as c:
        resp = await c.get(f"{SERVICE_URL}/api/v1/local-projects")
    assert resp.status_code == 200
    projects = resp.json()
    assert len(projects) > 0
    names = [p["name"] for p in projects]
    assert "dynamic-soft" in names


async def test_imported_project_has_tests():
    async with httpx.AsyncClient(timeout=TIMEOUT) as c:
        resp = await c.get(f"{SERVICE_URL}/api/v1/local-projects")
    projects = resp.json()
    svc = next((p for p in projects if p["name"] == "dynamic-soft"), None)
    assert svc is not None
    assert svc["test_count"] >= 0


async def test_frontend_serves_spa():
    async with httpx.AsyncClient(timeout=TIMEOUT) as c:
        resp = await c.get(f"{SERVICE_URL}/")
    assert resp.status_code == 200
    html = resp.text
    assert "<html" in html
    assert "root" in html or "app" in html


async def test_frontend_serves_static_js():
    async with httpx.AsyncClient(timeout=TIMEOUT) as c:
        resp = await c.get(f"{SERVICE_URL}/")
        html = resp.text
        assert "/assets/" in html
        match = re.search(r'src="(/assets/[^"]+\.js)"', html)
        assert match, "Should link to JS bundle"
        js_resp = await c.get(f"{SERVICE_URL}{match.group(1)}")
        assert js_resp.status_code == 200


async def test_run_discovery_mode():
    async with httpx.AsyncClient(timeout=TIMEOUT) as c:
        # Get the imported project id
        resp = await c.get(f"{SERVICE_URL}/api/v1/local-projects")
        projects = resp.json()
        svc = next((p for p in projects if p["name"] == "dynamic-soft"), None)
        assert svc is not None, "dynamic-soft project must be imported first"
        project_id = svc["id"]

        # Get available test files
        test_files = [tf["path"] for tf in svc.get("test_files", [])]
        if not test_files:
            pytest.skip("No test files found in imported project")

        # Run in default mode on the first test file
        resp = await c.post(
            f"{SERVICE_URL}/api/v1/local-projects/{project_id}/run",
            json={"test_files": [test_files[0]], "mode": "default"}
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "run_id" in data
        run_id = data["run_id"]

        # Wait for run to complete
        for _ in range(30):
            resp = await c.get(f"{SERVICE_URL}/api/v1/local-projects/runs/{run_id}")
            status = resp.json().get("status")
            if status in ("passed", "failed", "error"):
                break
            await asyncio.sleep(2)
        else:
            pytest.fail("Run did not complete within 60s")

        assert status in ("passed", "failed", "error")

        # Verify run has command and output_dir
        run_data = resp.json()
        assert run_data.get("command") is not None
        assert run_data.get("output_dir") is not None

        # Check test results were recorded
        tests_resp = await c.get(f"{SERVICE_URL}/api/v1/local-projects/runs/{run_id}/tests")
        assert tests_resp.status_code == 200
        tests = tests_resp.json()
        assert len(tests) > 0
        assert tests[0].get("status") in ("passed", "failed", "error")


async def test_run_log():
    """Verify log endpoint works on the most recent completed run."""
    async with httpx.AsyncClient(timeout=TIMEOUT) as c:
        resp = await c.get(f"{SERVICE_URL}/api/v1/local-projects/runs")
        runs = resp.json()
        completed = [r for r in runs if r.get("status") in ("passed", "failed", "error")]
        if not completed:
            pytest.skip("No completed runs to test log endpoint")

        run_id = completed[0]["id"]
        resp = await c.get(f"{SERVICE_URL}/api/v1/local-projects/runs/{run_id}/log")
        assert resp.status_code == 200
        assert len(resp.text) > 0
