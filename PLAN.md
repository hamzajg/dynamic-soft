# Product Verification Service — Plan

## Overview

Port the existing e2e test framework from `tanoshii-computing.gitlab.io` into a standalone Python FastAPI microservice within the `dynamic-soft` monorepo. The service manages the full specification end-to-end verification lifecycle: test execution, AI-powered analysis, artifact storage, and browser-based viewing.

---

## Terminology

| Term | Meaning |
|------|---------|
| **Product Verification** | Specification end-to-end validation (replaces "e2e test") |
| **Verification Run** | A single execution of a scenario against a suite |
| **Scenario** | A single `.py` file containing Playwright-based verification steps |
| **Suite** | A named collection of scenarios with repo/service configuration |
| **Mode** | `default` (logs only), `validation` (record + AI report), `discovery` (screenshots + UX audit) |

---

## Architecture

```
POST /api/v1/verifications  {suite, scenario, mode}
  │
  ├─ DB: insert row (status=queued)
  ├─ mkdir /output/<suite>/<scenario>_<timestamp>/
  ├─ repo_manager: read <suite>.yml → clone repos → setup → start services
  ├─ spawn: pytest tests/<scenario>.py
  │     └─ env: TEST_MODE=<mode>, OUTPUT_DIR=<path>, OLLAMA_BASE_URL=...
  │
  │   ┌───────────────────────────────────────────────────┐
  │   │  pytest subprocess                                │
  │   │  ┌────────────────────────────────────────────┐   │
  │   │  │ conftest.py:                                │   │
  │   │  │  - LoggedPage wrapper + screenshot capture  │   │
  │   │  │  - browser fixture (pure engine,            │   │
  │   │  │    no platform dependencies)                │   │
  │   │  └────────────────────────────────────────────┘   │
  │   │                                                    │
  │   │  test_navigation.py → test.log                     │
  │   │                    → screenshots (discovery/batch)  │
  │   │                    → .webm video (validation)       │
  │   └──────── stdout/stderr → WebSocket broadcast ───────┘
  │
  ├─ repo_manager: stop services
  ├─ if mode != default:
  │     run_analysis(log_path, video_or_screenshots, output_dir, mode)
  │     └─ analysis/ module (self-contained, env-driven config)
  ├─ DB: update row (status, counts, report_path)
  └─ return {run_id, status, report_url}
```

---

## Directory Structure

```
src/product-verification-service/
├── requirements.txt
├── .env.example
├── main.py                          # FastAPI app entry
├── api/
│   ├── verifications.py             # POST/GET/DELETE runs
│   ├── suites.py                    # List/detail suite configs
│   ├── artifacts.py                 # Serve logs, screenshots, frames, video, reports
│   ├── ws.py                        # WebSocket live log streaming
│   └── suite_loader.py             # YAML config parser
├── core/
│   ├── config.py                    # Env-driven settings
│   ├── database.py                  # SQLite (verification_runs table)
│   └── dependencies.py
├── models/
│   ├── verification_run.py          # Pydantic + SQLite row model
│   └── suite_config.py              # Suite config model (YAML-backed)
├── services/
│   ├── spec_runner.py               # Subprocess pytest + analysis trigger
│   ├── artifact_store.py            # Filesystem artifact read/write
│   └── repo_manager.py              # Clone/setup/start/stop from YAML
├── analysis/                        # Ported from tanoshii, decoupled
│   ├── config.py, pipeline.py, models.py
│   ├── frame_analyzer.py, opencode_analyzer.py
│   ├── discovery_analyzer.py, extract_frames.py
│   └── cli.py, ollama_analyzer.py
├── suites/                          # YAML suite definitions
│   ├── navigation.yml
│   └── exploration.yml
└── tests/                           # Scenario scripts (per-file runnable)
    ├── conftest.py                  # LoggedPage + logger + browser fixture
    ├── test_navigation_homepage.py
    ├── test_navigation_links.py
    └── test_exploration_homepage.py
```

---

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/v1/spec-suites` | List available suites |
| `GET` | `/api/v1/spec-suites/{name}` | Suite detail with scenarios |
| `POST` | `/api/v1/verifications` | Trigger a verification run |
| `GET` | `/api/v1/verifications` | List runs (filterable) |
| `GET` | `/api/v1/verifications/{id}` | Run detail |
| `DELETE` | `/api/v1/verifications/{id}` | Archive a run |
| `GET` | `/api/v1/verifications/{id}/log` | Raw test.log |
| `GET` | `/api/v1/verifications/{id}/screenshots` | List screenshot PNGs |
| `GET` | `/api/v1/verifications/{id}/screenshots/{name}` | Single PNG |
| `GET` | `/api/v1/verifications/{id}/frames` | List frame JPGs |
| `GET` | `/api/v1/verifications/{id}/frames/{name}` | Single JPG |
| `GET` | `/api/v1/verifications/{id}/video` | Video `.webm` |
| `GET` | `/api/v1/verifications/{id}/report` | Analysis report `.md` |
| `WS` | `/api/v1/verifications/{id}/ws` | Live log stream |

---

## Suite Config Format

```yaml
# suites/navigation.yml
name: navigation
description: Core navigation verification
mode: validation
repos:
  - url: https://github.com/hamzajg/dynamic-soft
    type: monolith
    services:
      - name: web-app
        path: src/web-app
        type: frontend
        setup: bun install
        start: bun run start
        port: 3010
scenarios:
  - test_navigation_homepage
  - test_navigation_links
```

Supports both monolith (one repo, multiple services) and microservice (multiple repos) patterns.

---

## SQLite Schema

```sql
CREATE TABLE verification_runs (
    id              TEXT PRIMARY KEY,
    suite           TEXT NOT NULL,
    scenario        TEXT NOT NULL,
    mode            TEXT NOT NULL DEFAULT 'default',
    status          TEXT NOT NULL DEFAULT 'queued',
    passed          INTEGER DEFAULT 0,
    failed          INTEGER DEFAULT 0,
    total           INTEGER DEFAULT 0,
    duration_ms     INTEGER DEFAULT 0,
    output_dir      TEXT NOT NULL,
    report_path     TEXT,
    started_at      TEXT,
    finished_at     TEXT,
    error_message   TEXT,
    created_at      TEXT DEFAULT (datetime('now'))
);
```

---

## Output Structure

```
/output/
└── navigation/
    └── test_navigation_homepage_20260509_184558/
        ├── test.log
        ├── run.json                    # Machine-readable metadata
        ├── test_navigation_homepage_184558.webm     # (validation mode)
        ├── frames/                    # (validation, single mode)
        │   ├── frame_0001.jpg
        │   └── frame_0002.jpg
        ├── screenshot_nav_home_*.png  # (discovery / validation+batch)
        └── analysis.md                # or discovery.md
```

---

## Frontend Module

**Location:** `src/web-app/src/modules/product-verification/`

**Components:**
- `VerificationsPage.js` — Dashboard with run table + "New Run" trigger
- `RunDetail.js` — Detail view with tabs (overview, log, screenshots, report)
- `VerificationService.js` — fetch wrappers for all API endpoints
- `VerificationProvider.js` — React context for state management
- `components/RunTable.js` — Sortable/filterable run list
- `components/LogViewer.js` — Lazy-loaded log display
- `components/ScreenshotGallery.js` — Thumbnail grid + lightbox
- `components/ReportViewer.js` — Rendered markdown report
- `components/NewRunDialog.js` — Suite + scenario + mode selector
- `components/RunStatusBadge.js` — PASS/FAIL/RUNNING badge

**Nav item:** VERIFICATION (between TEAMS and LOGIN in Layout.js)

**Routes:**
- `/verification` — Dashboard
- `/verification/runs/:id` — Run detail

---

## Key Decisions

| Decision | Choice |
|----------|--------|
| Language/Framework | Python 3.11+ / FastAPI |
| Storage | Filesystem (artifacts) + SQLite (metadata) |
| Deployment | Standalone process (port 8083, not Docker) |
| Test execution | Server spawns pytest subprocess with Playwright headless |
| Test scripts location | `tests/` inside the service |
| Output location | `/<project-root>/output/` |
| Analysis config | Fully env-driven (decoupled from pytest) |
| Mode injection | Passed as REST API request body → `TEST_MODE` env var |
| Multi-repo support | Suite YAML defines repo URLs, service type, setup commands |
| Analysis tools | opencode-cli + Ollama (pluggable via FrameAnalyzer ABC) |
| CORS | `localhost:3000` (CRA dev) + `localhost:3010` |

---

## Extensibility Points

| Future Need | Mechanism |
|-------------|-----------|
| ACP integration | `FrameAnalyzer` ABC → add `ACPFrameAnalyzer` subclass |
| More analysis tools | `create_frame_analyzer()` factory — new backend, no pipeline changes |
| New repo types | Suite YAML `type` field; `repo_manager` dispatches on type |
| Per-scenario hooks | Suite YAML gains `hooks: {pre: ..., post: ...}` later |
| Parallel runs | Background task queue (arq, celery) — API unchanged |
| Full PostgreSQL | Swap `database.py` to asyncpg — same repository pattern |
| New platforms | New suite YAML + scenario `.py` — no code changes to service |

---

## Implementation Order

| # | Step | Est. |
|---|------|------|
| 1 | Scaffold service: `main.py`, `core/`, `models/`, `requirements.txt` | 1h |
| 2 | `core/config.py` + `core/database.py` | 1h |
| 3 | Port `analysis/` module from tanoshii, decouple config | 1h |
| 4 | `services/repo_manager.py` — clone/setup/start/stop from YAML | 2h |
| 5 | `services/spec_runner.py` — subprocess pytest + analysis trigger | 2h |
| 6 | `services/artifact_store.py` — filesystem + SQLite reads | 1h |
| 7 | `api/` endpoints — verifications, suites, artifacts, ws | 2h |
| 8 | `main.py` — wire routers, CORS, lifespan | 30m |
| 9 | Suite YAML configs + port tests | 1.5h |
| 10 | Frontend module (React components) | 3h |
| 11 | Wire nav + routes in Layout.js + App.js | 30m |
| **Total** | | **~14h** |
