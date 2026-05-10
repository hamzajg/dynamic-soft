# Product Verification Service — Implementation

> Built: 2026-05-09
> Source: Ported from `tanoshii-computing.gitlab.io/e2e/` into `dynamic-soft`

---

## Files Created

### Service Backend (39 Python files)

```
src/product-verification-service/
├── requirements.txt                  # fastapi, uvicorn, aiosqlite, playwright, etc.
├── .env.example                      # Config template
├── main.py                           # FastAPI app, CORS, lifespan, router includes
│
├── api/
│   ├── __init__.py
│   ├── verifications.py              # POST/GET/DELETE /api/v1/verifications
│   ├── suites.py                     # GET /api/v1/spec-suites
│   ├── artifacts.py                  # GET .../log, .../screenshots, .../frames, .../video, .../report
│   ├── ws.py                         # WS /api/v1/verifications/{id}/ws
│   └── suite_loader.py              # YAML → SuiteConfig parser
│
├── core/
│   ├── __init__.py
│   ├── config.py                     # Env-driven: HOST, PORT, OUTPUT_DIR, CORS, Ollama, analysis
│   ├── database.py                   # SQLite: verification_runs table, CRUD methods
│   └── dependencies.py
│
├── models/
│   ├── __init__.py
│   ├── verification_run.py           # Pydantic models: VerificationRun, TriggerRunRequest/Response
│   └── suite_config.py              # Pydantic: SuiteConfig, RepoConfig, ServiceConfig
│
├── services/
│   ├── __init__.py
│   ├── spec_runner.py                # Spawn pytest → capture logs → trigger analysis → update DB
│   ├── artifact_store.py             # Filesystem read/write for artifacts
│   └── repo_manager.py              # Git clone/pull → setup → start services → health check → stop
│
├── analysis/                         # Ported from tanoshii, decoupled from pytest
│   ├── __init__.py
│   ├── config.py                     # Env-only (no e2e.config import)
│   ├── pipeline.py                   # run_analysis(), run_discovery()
│   ├── models.py                     # Frame, AnalysisResult dataclasses
│   ├── frame_analyzer.py            # OllamaFrameAnalyzer, BatchOllamaFrameAnalyzer, OpencodeFrameAnalyzer
│   ├── opencode_analyzer.py         # OpencodeAnalyzer (validation text analysis)
│   ├── discovery_analyzer.py        # DiscoveryAnalyzer (5-category UX audit)
│   ├── ollama_analyzer.py           # Legacy OllamaAnalyzer
│   ├── extract_frames.py            # ffmpeg frame extraction
│   ├── analyzer.py                  # VideoAnalyzer ABC
│   └── cli.py                       # Standalone CLI
│
├── suites/
│   ├── __init__.py
│   ├── navigation.yml                # navigation suite: 1 repo, 1 service, 2 scenarios
│   └── exploration.yml               # exploration suite: 1 repo, 1 service, 1 scenario
│
└── tests/
    ├── __init__.py
    ├── conftest.py                   # LoggedPage + TestLogger + browser_instance fixture
    ├── test_navigation_homepage.py   # Homepage load verification
    ├── test_navigation_links.py      # Navigation links click-through
    └── test_exploration_homepage.py  # Homepage content exploration
```

### Frontend Module (11 files)

```
src/web-app/src/modules/product-verification/
├── index.js
├── VerificationService.js           # fetch() wrappers for all API endpoints
├── VerificationProvider.js           # React context (runs, suites, loading, error)
├── VerificationsPage.js             # Dashboard: run table + "New Run" trigger
├── RunDetail.js                     # Detail: tabs (overview, log, screenshots, report)
└── components/
    ├── RunStatusBadge.js            # PASS/FAIL/RUNNING badge (reuses Shared/StatusBadge)
    ├── RunTable.js                  # Sortable/filterable run list
    ├── LogViewer.js                 # Lazy-loaded log display
    ├── ScreenshotGallery.js         # Thumbnail grid + lightbox
    ├── ReportViewer.js              # Rendered markdown report
    └── NewRunDialog.js              # Suite/scenario/mode selector
```

### Modified Files (2 files)

```
src/web-app/src/App.js               # Added imports + routes for /verification and /verification/runs/:id
src/web-app/src/ui/Layout.js         # Added VERIFICATION nav item between TEAMS and LOGIN
```

---

## Architecture Changes from Tanoshii

| Aspect | Tanoshii | Product Verification Service |
|--------|----------|------------------------------|
| AnalysisConfig | Imports `e2e/config.py` (pytest-coupled) | Reads env vars only — fully decoupled |
| Mode injection | `--mode` pytest flag or `TEST_MODE` env | REST API body → injected as subprocess env var |
| Platform fixtures | Per-project classes in `fixtures/` | `RepoManager` handles all lifecycle from YAML |
| Output path | `e2e/test-results/<dir>/` | `<project-root>/output/<suite>/<scenario>_<ts>/` |
| Analysis trigger | `pytest_runtest_makereport` hook | `SpecRunner` triggers post-subprocess |
| conftest.py | Includes `local_server`, `orca_gateway`, etc. | Only `LoggedPage` + `browser_instance` — pure engine |
| Interface | CLI-only (`pytest` command) | REST API + Web UI |

---

## Data Flow

```
POST /api/v1/verifications  {suite: "navigation", scenario: "test_navigation_homepage", mode: "validation"}
  │
  ├─ 1. DB: insert row (status=running)
  ├─ 2. Create output dir: /output/navigation/test_navigation_homepage_20260509_184558/
  ├─ 3. repo_manager: clone dynamic-soft → bun install → bun run start (port 3010)
  ├─ 4. Spawn: pytest tests/test_navigation_homepage.py -v
  │      ├─ env: TEST_MODE=validation, OUTPUT_DIR=..., RECORD_SCREEN=true
  │      ├─ LoggedPage: goto() → screenshot → click() → screenshot → assertions
  │      ├─ stdout → test.log + WebSocket broadcast
  │      └─ video → .webm file
  ├─ 5. repo_manager: stop services (SIGTERM → SIGKILL)
  ├─ 6. Analysis: run_analysis(log, video, output_dir, mode)
  │      ├─ ffmpeg → frames/*.jpg
  │      ├─ Ollama/Opencode → frame descriptions
  │      └─ OpencodeAnalyzer → analysis.md
  ├─ 7. DB: update row (status=passed, counts, report_path)
  └─ 8. Return {run_id, status: "passed"}
```

---

## API Usage

```bash
# List suites
curl http://localhost:8083/api/v1/spec-suites

# Trigger a run
curl -X POST http://localhost:8083/api/v1/verifications \
  -H "Content-Type: application/json" \
  -d '{"suite": "navigation", "scenario": "test_navigation_homepage", "mode": "validation"}'

# List runs
curl http://localhost:8083/api/v1/verifications

# Get run detail
curl http://localhost:8083/api/v1/verifications/<run_id>

# Get log
curl "http://localhost:8083/api/v1/verifications/<run_id>/log?suite=navigation&scenario=test_navigation_homepage"

# Get report
curl "http://localhost:8083/api/v1/verifications/<run_id>/report?suite=navigation&scenario=test_navigation_homepage"

# Health check
curl http://localhost:8083/api/health
```

---

## Extensibility Points

| Need | How Plan Supports It |
|------|----------------------|
| ACP integration | `FrameAnalyzer` ABC + `create_frame_analyzer()` factory — add `ACPFrameAnalyzer` subclass |
| More analysis tools | Same factory pattern — new backend, no pipeline changes |
| New repo types | Suite YAML `type` field; `repo_manager` dispatches on type |
| Per-project hooks | Suite YAML gains `hooks: {pre: ..., post: ...}` later |
| Parallel/queued runs | `spec_runner` swaps to background task queue later — API unchanged |
| Full PostgreSQL | `database.py` swaps to asyncpg — same repository pattern |
| New platforms | New suite YAML + scenario `.py` — no code changes to service |
