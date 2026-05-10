# E2E Test System Design

## Overview

The Tanoshii E2E test system is a Playwright-based automated testing framework with three operational modes: **default**, **validation**, and **discovery**. It supports logging, video recording, AI-powered visual analysis, and structured report generation.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         e2e/config.py                               │
│  Env-based Config class: TEST_ENV, TEST_MODE, BROWSER, URLs, etc.  │
└────────────────┬────────────────────────────────────────────────────┘
                 │
┌────────────────┴────────────────────────────────────────────────────┐
│                         e2e/conftest.py                             │
│  Pytest hooks: pytest_addoption, pytest_configure,                  │
│  pytest_runtest_makereport (post-teardown analysis trigger)         │
│                                                                     │
│  Fixtures:                                                          │
│    • local_server (session) — http.server on port 4173             │
│    • browser_instance (session) — Playwright browser lifecycle     │
│    • logged_page (function) — LoggedPage wrapper + context setup   │
│    • orca_gateway (session) — OrcaPlatform fixture                  │
│                                                                     │
│  LoggedPage:                                                        │
│    Wraps playwright Page with:                                      │
│    • Automatic screenshot capture (discovery/validation+batch)      │
│    • Structured logging (actions, clicks, assertions)              │
│    • `wait_for_timeout` after every goto (human-read pause)         │
│    • Screenshot metadata (URL, title, label) stored per test        │
└────────────────┬────────────────────────────────────────────────────┘
                 │
    ┌────────────┼────────────┬────────────────────┐
    ▼            ▼            ▼                    ▼
┌─────────┐ ┌─────────┐ ┌──────────────┐ ┌──────────────────┐
│ Fixtures│ │  Tests  │ │  Analysis/   │ │ Shared Utilities │
│ (setup) │ │ (specs) │ │  Pipeline    │ │                  │
└─────────┘ └─────────┘ └──────────────┘ └──────────────────┘
```

---

## Three Modes

### 1. Default Mode (`TEST_MODE=default`)

**Purpose:** Fast execution — record structured logs only, no analysis.

| Aspect | Detail |
|--------|--------|
| Recording | No video, no screenshots |
| Output | `test.log` per test case |
| Analysis | None |
| Use Case | Rapid test iteration, CI smoke tests |

**Flow:**
```
pytest → logged_page fixture → test execution → test.log
```

### 2. Validation Mode (`TEST_MODE=validation`)

**Purpose:** Full assertion pass/fail analysis with AI-powered visual+text validation report.

**Two sub-paths:**

| Sub-path | `ANALYSIS_FRAME_ANALYZER_MODE` | Source | Behavior |
|----------|-------------------------------|--------|----------|
| Video-based | `single` (default) | WebM recording | ffmpeg extracts frames, vision AI analyzes each |
| Batch screenshot | `batch` | In-memory screenshots | Frames from LoggedPage._screenshots, no video |

**Flow:**
```
pytest run → logged_page (captures screenshots + video) → teardown →
pytest_runtest_makereport → pipeline.run_analysis() →
  1. Extract frames (ffmpeg) or use inline screenshots
  2. FrameAnalyzer.describe_frames() → vision descriptions
  3. OpencodeAnalyzer/OllamaAnalyzer → synthesize log + frames → report
```

**Output:** `analysis.md` — includes test info, log summary, errors, overall assessment, recommendations.

### 3. Discovery Mode (`TEST_MODE=discovery`)

**Purpose:** Exploratory analysis — AI-driven UX/UI/optimization recommendations via `DiscoveryAnalyzer`.

**Flow:**
```
pytest run → logged_page (captures screenshots per action) → teardown →
pytest_runtest_makereport → pipeline.run_discovery() →
  1. FrameAnalyzer.describe_frames() → vision descriptions
  2. DiscoveryAnalyzer → 5-category analysis:
     - UX Improvements
     - UI Representation Bugs
     - Optimization Opportunities
     - Consistency Issues
     - Alternative Suggestions
  3. Optional: UX deep-dive via delegated model (ANALYSIS_UX_MODEL)
```

**Output:** `discovery.md`

---

## Data Flow Diagram

```
                        ┌──────────────────┐
                        │   Test Fixture   │
                        │  (logged_page)   │
                        └────────┬─────────┘
                                 │
                    ┌────────────┼──────────────┐
                    ▼            ▼              ▼
            ┌────────────┐ ┌──────────┐ ┌──────────────┐
            │  test.log  │ │Screenshots│ │  video.webm  │
            │ (actions,  │ │ (PNG per  │ │ (if RECORD)  │
            │  asserts,  │ │  action)  │ │              │
            │  errors)   │ │           │ │              │
            └─────┬──────┘ └─────┬─────┘ └──────┬───────┘
                  │              │               │
                  ▼              ▼               ▼
            ┌─────────────────────────────────────────┐
            │         Analysis Pipeline                │
            │  (pipeline.py)                           │
            │                                          │
            │  ┌─────────────┐    ┌──────────────────┐ │
            │  │ Extract     │    │ FrameAnalyzer    │ │
            │  │ Frames      │───▶│ (vision AI)      │ │
            │  │ (ffmpeg /   │    │ ollama/opencode  │ │
            │  │  inline)    │    │ single/batch     │ │
            │  └─────────────┘    └────────┬─────────┘ │
            │                              │           │
            │  ┌─────────────┐             │           │
            │  │ Log         │             │           │
            │  │ Summarizer  │─────────────┼───────────┘
            │  └─────────────┘             │
            │                              ▼
            │  ┌───────────────────────────────────┐
            │  │ Text Analyzer                     │
            │  │ OpencodeAnalyzer / DiscoveryAnalyzer│
            │  │  - synthesize log + frame descs    │
            │  │  - extract errors                  │
            │  │  - generate report                 │
            │  └──────────────┬────────────────────┘
            │                 │
            └─────────────────┼─────────────────────────┘
                              ▼
                    ┌──────────────────┐
                    │  analysis.md     │
                    │  or discovery.md │
                    └──────────────────┘
```

---

## Test Fixtures

| Fixture | Scope | Purpose |
|---------|-------|---------|
| `local_server` | session | Starts `python -m http.server` for local dev testing |
| `browser_instance` | session | Playwright browser (chromium/chrome/firefox) lifecycle |
| `logged_page` | function | LoggedPage wrapper — structured logging + screenshots |
| `orca_gateway` | session | ORCA platform clone + setup + proxy lifecycle |

### LoggedPage wrapper methods

| Method | Behavior |
|--------|----------|
| `goto(url)` | Logs action, navigates, waits `PAGE_READ_TIMEOUT`ms, screenshots if active |
| `click(selector)` | Logs click, performs click, screenshots if active |
| `fill(selector, value)` | Logs fill, performs fill, screenshots if active |
| `screenshot(name)` | Captures PNG with URL/title/label metadata |

---

## Analysis Pipeline Components

### Frame Extraction (`extract_frames.py`)
- Uses `ffmpeg` to extract JPG frames at configurable intervals (`FRAME_INTERVAL`, default 5s)
- Max frames capped by `MAX_FRAMES` (default 20)
- Frame timing aligned with log timestamps via `_inject_frame_contexts`

### Frame Analyzers (`frame_analyzer.py`)

| Analyzer | Backend | Mode | Description |
|----------|---------|------|-------------|
| `OllamaFrameAnalyzer` | ollama | single | Per-frame vision description via Ollama API |
| `BatchOllamaFrameAnalyzer` | ollama | batch | All frames sent in one call for holistic analysis |
| `OpencodeFrameAnalyzer` | opencode-cli | single/batch | Vision analysis via opencode CLI with server |

### Text Analyzers

| Analyzer | Purpose | AI Backend |
|----------|---------|------------|
| `OllamaAnalyzer` | Legacy — per-frame descriptions + synthesis | Ollama API |
| `OpencodeAnalyzer` | Validation — log summary + frame descs → pass/fail report | opencode-cli |
| `DiscoveryAnalyzer` | Discovery — 5-category UX/UI analysis | opencode-cli (+ optional delegated UX model) |

### Pipeline (`pipeline.py`)

**`run_analysis()`** — Validation pipeline:
1. Extract frames (ffmpeg) or use inline screenshots
2. Describe frames via vision FrameAnalyzer
3. Summarize log
4. Run OpencodeAnalyzer → `AnalysisResult`
5. Optionally run DiscoveryAnalyzer for combined mode

**`run_discovery()`** — Discovery pipeline:
1. Describe frames via vision FrameAnalyzer
2. Summarize log
3. Run DiscoveryAnalyzer → 5-category findings
4. Optional UX deep-dive via delegated model

---

## Configuration (`config.py` + `analysis/config.py`)

### Core Config (`e2e/config.py`)

| Variable | Default | Description |
|----------|---------|-------------|
| `TEST_ENV` | `local` | `local` or `production` |
| `TEST_MODE` | `default` | `default`, `validation`, `discovery` |
| `BASE_URL_LOCAL` | `http://localhost:4173` | Local dev server |
| `BASE_URL_PROD` | `https://tanoshii-computing.com` | Production URL |
| `RECORD_SCREEN` | `false` | Enable video recording |
| `BROWSER` | `chromium` | Playwright browser type |
| `HEADLESS` | `true` | Headless mode |
| `PAGE_READ_TIMEOUT` | `1500` | Human-read pause after navigation (ms) |

### Analysis Config (`e2e/analysis/config.py`)

| Variable | Default | Description |
|----------|---------|-------------|
| `FRAME_ANALYZER_BACKEND` | `ollama` | Vision backend: `ollama` or `opencode` |
| `FRAME_ANALYZER_MODEL` | `llava` | Per-frame vision model |
| `FRAME_ANALYZER_MODE` | `single` | `single` or `batch` |
| `FRAME_ANALYZER_BATCH_MODEL` | `llama3.2-vision` | Batch vision model |
| `FRAME_INTERVAL` | `5` | Seconds between frames |
| `MAX_FRAMES` | `20` | Max frames to extract |
| `OPENCODE_MODEL` | `opencode/big-pickle` | opencode model for text analysis |
| `UX_MODEL` | (empty) | Delegated UX deep-dive model |
| `REQUEST_TIMEOUT` | `900` | API call timeout (seconds) |

---

## Test Suites

| Test File | Focus | Tests |
|-----------|-------|-------|
| `test_navigation.py` | Homepage, nav links, HTMX components | `test_homepage_loads`, `test_navigation_links`, `test_htmx_components_load` |
| `test_exploration.py` | Full page exploration (13 pages + HTMX partials) | `test_full_pages_exploration`, `test_marketplace_product_details`, `test_blog_post_details`, `test_htmx_partials_load`, `test_nav_links_clickable`, `test_footer_links_clickable`, `test_responsive_layout`, `test_all_static_assets`, `test_site_exploration_summary`, `test_full_pages_exploration_production` |
| `test_identity.py` | Identity pages (signin/signup) | `test_landing_page_loads`, `test_identity_pages_exist`, `test_signup_form_elements`, `test_signin_form_elements`, `test_navigation_between_identity_pages`, `test_signup_form_validation`, `test_signin_form_submission`, `test_signup_form_submission`, `test_social_login_buttons_exist`, `test_profile_page_without_auth` |
| `test_orca_platform_exploration.py` | ORCA platform full lifecycle | 5-phase exploration: landing→GitHub→setup→API→dashboard |
| `test_agentcraft_platform_exploration.py` | AgentCraft platform full lifecycle | 5-phase exploration with comms server validation |
| `test_ai_agent_bot_mfe_exploration.py` | AI Agent Bot MFE full lifecycle | 5-phase exploration with demo page |
| `test_dynamic_soft_platform_exploration.py` | DynamicSoft platform full lifecycle | 5-phase exploration with auth page |
| `test_streamweave_platform_exploration.py` | StreamWeave platform (likely similar pattern) | (not fully read) |

### Platform Exploration Test Pattern

Each platform exploration test follows a consistent 5-phase structure:

```
PHASE 1: Production Landing → OSS Discovery → GitHub
  - Visit tanoshii-computing.com
  - Scroll to OSS section
  - Verify OSS card (badge, status, name)
  - Navigate to GitHub repo

PHASE 2: GitHub README Scroll & Verification
  - Verify README content area
  - Scroll through README section-by-section
  - Verify repo is public (GitHub API)
  - Verify key source files exist (GitHub raw)

PHASE 3: Clone → Setup → Run (Terminal Recording)
  - Open visual terminal (about:blank + styled HTML)
  - Clone repo
  - Verify structure, install deps
  - Start server
  - Wait for ready

PHASE 4: API Validation
  - Health check, nodes/endpoints, auth lifecycle
  - Payload-based API testing (varies by platform)

PHASE 5: Dashboard/App Exploration
  - Navigate to running app
  - Verify landing page, navigation, features
  - Platform-specific sub-pages (dashboard, demo, auth)
```

---

## Shared Terminal (`shared_terminal.py`)

Styled terminal UI rendered as HTML on `about:blank` page. Used during platform exploration tests to visually display clone/setup/run progress.

Functions: `open_terminal`, `terminal_type`, `terminal_exec`, `terminal_info`, `terminal_ok`, `terminal_err`, `terminal_warn`

---

## Reports & Output Structure

```
e2e/test-results/
  └── <test_suite>_<test_case>_<timestamp>/
      ├── test.log              # Structured test log
      ├── analysis.md           # Validation report (validation mode)
      └── discovery.md          # Discovery report (discovery mode)
  (video files and frames/ dir present when RECORD_SCREEN=true)
```

---

## Key Design Decisions

1. **LoggedPage wrapper over raw Page** — enables automatic screenshot capture + structured logging without polluting test code.

2. **`pytest_runtest_makereport` as analysis trigger** — runs post-teardown so all artifacts (screenshots, video, log) are finalized before analysis starts.

3. **Two-tier analysis** — vision FrameAnalyzer describes screenshots → text Analyzer synthesizes log + descriptions. Separates concerns and allows different backends for each.

4. **Batch vs single frame analysis** — batch mode sends all frames in one API call (faster, holistic view); single mode processes each frame individually (more detailed, parallelizable).

5. **Screenshots vs video** — screenshots are faster, smaller, always available; video provides temporal context but requires ffmpeg and more storage. Screenshots used in discovery and batch-validation; video used in single-frame validation.

6. **Platform exploration tests use a reusable 5-phase pattern** — consistent structure across ORCA, AgentCraft, AI Agent Bot MFE, DynamicSoft, and StreamWeave platforms.

7. **Visual terminal rendering** — platform exploration tests render a styled terminal on about:blank to display setup progress, providing visual feedback during long-running clone/setup operations.
