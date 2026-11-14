# AGENTS.md — dynamic-soft

Guidance for AI agents (and humans) working in this repository.

## Project

DynamicSoft is a platform for SMBs modernising operations: a **modular
monolith** of Quarkus/Kotlin services (marketplace, sharedkernel, identity,
subscription, web-apis) plus satellite components — a React web app, a
VS Code extension, a CLI tool, and a Python FastAPI **Product Verification
Service** (e2e/spec-verification microservice ported from
tanoshii-computing.gitlab.io). Marketplace of pre-built projects + custom
dev requests.
Stack: Kotlin/Java on Quarkus (Gradle multi-project), React 18 CRA,
Python 3/FastAPI, VS Code extension (TS).

## Commands

Verified 2026-11-13 against CI (`.github/workflows/ci.yml`) and build files.

| Task | Command |
|---|---|
| JVM tests | `sh gradlew test --no-daemon` (CI: JDK 17) |
| JVM build | `sh gradlew build` |
| Run a service | `cd src/<module> && sh ../../gradlew quarkusDev` (Quarkus dev mode) |
| Product Verification svc | `cd src/product-verification-service && uvicorn main:app --port 8083 --reload` (see its README) |
| Web app | `cd src/web-app && npm start` / `npm run build` (react-scripts) |

Requires: JDK 17 for Gradle; Kotlin toolchains vary per module
(`jvmToolchain(8)` in marketplace/sharedkernel, 17 elsewhere — foojay
resolver is configured in `settings.gradle`).

## Architecture

```
dynamic-soft/  (Gradle multi-project, settings.gradle maps src:* → modules)
├── src/
│   ├── sharedkernel/      Kotlin DDD kernel: CommandHandler, DomainEvent, …
│   ├── marketplace/       Kotlin Quarkus — marketplace use cases/commands
│   ├── identity/          Kotlin Quarkus — IdGenerator, IdentityResource
│   ├── subscription/      Kotlin Quarkus (early-stage)
│   ├── web-apis/          Java Spring-style APIs: controllers, services,
│   │                      repositories, DTOs (Board/Project/Solution/Team/
│   │                      Diagram + CodeGenChat)
│   ├── web-app/           React 18 CRA + Tailwind + react-flow (visual
│   │                      architecture canvas) + swagger-ui-react
│   ├── vscode-extension/  VS Code extension (TS)
│   ├── cli-tool/          CLI
│   └── product-verification-service/  Python FastAPI + React frontend —
│                                     spec e2e verification lifecycle
│                                     (see its DESIGN.md/IMPLEMENTATION.md)
├── docs/architecture/decisionRecords/  ADRs 001–003 (authoritative!)
├── PLAN.md / IMPLEMENTATION.md         PVS port plan + file manifest
└── docker-compose.yml
```

**ADR practice already exists**: `docs/architecture/decisionRecords/` uses
date-prefixed markdown ADRs (001 record-architecture-decisions,
002 evolutionary-architecture, 003 clean-modular-monolith). New decisions
go THERE, following that format — not in `docs/adr/`.

## Conventions

- **Modular monolith, clean architecture per module** (ADR-003): domain
  framework-free, use-case classes, repositories behind interfaces.
  Quarkus for Kotlin modules; web-apis is the Java/Spring-style API
  surface.
- Kotlin style in `sharedkernel`/`marketplace`/`identity`/`subscription`;
  Java in `web-apis`. Match the module's language — don't cross-pollinate.
- PVS is Python (FastAPI) with its own `requirements.txt`, `core/`,
  `api/`, `analysis/`, `services/`, `frontend/` — self-contained; keep
  changes inside it unless touching shared contracts.
- KISS/SOLID/DRY; ADR-002 (evolutionary architecture) means prefer
  reversible decisions.

## Landmines

- **Default branch is `main`.**
- Mixed JVM targets: `marketplace`/`sharedkernel` still on
  `jvmToolchain(8)`, others 17 — check each module's build.gradle before
  assuming the toolchain.
- `web-apis` has both Java and Kotlin sources/tests — it's the hybrid
  module; check which language a given class is in.
- PVS was *ported* from another repo — `IMPLEMENTATION.md` lists exactly
  what was created; check it before assuming structure.
- `src/product-verification-service` has committed runtime dirs
  (`analysis/`, `models/`, `services/` may hold generated output) — check
  .gitignore scope before adding files.
- React app is react-scripts (CRA) — old but working; no Vite here.
- `docker-compose.yml` at root may not cover every module — check per-module.

## Agent rules

- Branch from `main`; name branches `feat/*`, `fix/*`, `chore/*`, `docs/*`.
- Docs-only changes still go through a PR; never commit to `main` directly.
- Verify before claiming: `sh gradlew test --no-daemon` for JVM changes;
  PVS has its own test path (`tests/`); report the real result.
- Keep changes minimal and consistent with the module's language/style.
  No drive-by refactors across module boundaries.
- **New architectural decisions → `docs/architecture/decisionRecords/`**
  in the existing ADR format; update this file + `docs/ARCHITECTURE.md`
  when layout/contracts change.
