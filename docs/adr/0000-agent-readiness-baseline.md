# ADR 0000 — Agent-readiness baseline

Date: 2026-11-13 (baseline recorded retroactively)
Status: accepted (describes what is built)

> This repo already keeps ADRs in `docs/architecture/decisionRecords/`
> (001–003). This file is the fleet agent-readiness baseline; future
> architectural decisions belong in `decisionRecords/` per ADR-001.

## Context

DynamicSoft is a multi-component platform: a Quarkus/Kotlin modular
monolith plus React/VS Code/CLI surfaces and a Python verification
microservice. Agents need one map before touching it.

## Baseline decisions (as built)

1. **Modular monolith over microservices** (ADR-002/003): balance of
   simplicity and scalability; "don't distribute prematurely" (Fowler's
   first law).
2. **Clean architecture per module**: sharedkernel (DDD primitives) →
   domain modules → web-apis surface. Framework-free domain, use-case
   classes, repository interfaces.
3. **Kotlin for domain modules, Java for web-apis.** Quarkus on Kotlin;
   the API surface is Java/Spring-style. Mixed JVM targets (8 vs 17)
   per module — deliberate, foojay resolver enabled.
4. **Product Verification Service is a separate FastAPI service**, not
   part of the monolith — ported wholesale from the e2e framework with
   its own DB, analysis pipeline, and React viewer.
5. **React CRA for web-app** (react-scripts, Tailwind, react-flow) —
   no Vite; accepted legacy choice.
6. **Verification lifecycle is mode-driven** (`default`/`validation`/
   `discovery`) with AI analysis via Ollama/opencode — local-first.

## Consequences

- Cross-module changes must respect the sharedkernel boundary.
- PVS evolves independently — its DESIGN.md/IMPLEMENTATION.md are the
  authority for that subtree.
- Toolchain heterogeneity (JVM 8/17) means per-module verification.
