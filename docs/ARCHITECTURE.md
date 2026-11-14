# Architecture — dynamic-soft

Current-state map. Descriptive, not aspirational. **Authoritative ADRs:
`docs/architecture/decisionRecords/` (001–003)** — this file is the map,
those are the whys.

## System shape

```
┌─ Gradle multi-project modular monolith (Quarkus/Kotlin/Java) ─────────┐
│ sharedkernel → marketplace · identity · subscription · web-apis        │
│   (DDD kernel → use-case modules → API surface)                       │
└───────────────────────────────────────────────────────────────────────┘
        ▲ REST/JSON                          ▲
┌───────┴────────┐                  ┌───────┴─────────┐
│ web-app (React │                  │ vscode-extension│
│ CRA + react-   │                  │ cli-tool        │
│ flow canvas)   │                  └─────────────────┘
└────────────────┘
┌─ Product Verification Service (Python FastAPI, :8083) ─────────────────┐
│ api/ → services/ → core/ (db, config) ; analysis/ (Playwright frames,  │
│ Ollama/opencode analyzers) ; frontend/ (React viewer) ; tests/ (pytest)│
└───────────────────────────────────────────────────────────────────────┘
```

## Modules

| Module | Lang | Role |
|---|---|---|
| `sharedkernel` | Kotlin | DDD primitives: CommandHandler, DomainEvent, base types |
| `marketplace` | Kotlin/Quarkus | marketplace use cases + commands (jvmToolchain 8) |
| `identity` | Kotlin/Quarkus | IdGenerator, IdentityResource (jvmToolchain 17) |
| `subscription` | Kotlin/Quarkus | early-stage (jvmToolchain 17) |
| `web-apis` | Java (+Kotlin tests) | REST surface: Board/Project/Solution/Team/Diagram controllers, services, repositories, DTOs, CodeGenChat |
| `web-app` | React 18 (CRA) | visual architecture canvas (react-flow), swagger-ui |
| `vscode-extension` / `cli-tool` | TS / — | IDE + CLI surfaces |
| `product-verification-service` | Python FastAPI + React | spec e2e verification: suite/scenario/mode lifecycle, AI analysis (Ollama/opencode), artifact storage, browser viewer |

## Design rules (from ADR-003)

Clean-architecture modular monolith: domain framework-free, use cases in
application layer, infrastructure behind interfaces, APIs thin. Modules
share via `sharedkernel` — don't create cross-module dependencies outside
it.

## PVS request flow

`POST /api/v1/verifications {suite, scenario, mode}` → DB row →
repo_manager clones/configures suite repos → spawns pytest scenario →
analysis pipeline (frames + Ollama/opencode) → artifacts under
`/output/<suite>/`. Modes: `default` / `validation` / `discovery`
(same taxonomy as the source e2e framework).
