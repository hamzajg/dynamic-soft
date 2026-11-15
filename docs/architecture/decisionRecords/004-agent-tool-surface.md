# 4. Agent tool surface over the Ollama chat client

Date: 2026-11-15

## Status

Accepted

## Context

The queued agent-facing increment was an "identity-aware assistant". On
inspection, true identity-awareness is not yet buildable: the `identity`
module issues smallrye JWTs signed by a local private key
(`smallrye.jwt.sign.key.location`), while `web-apis` runs Spring Security
with `anyRequest().authenticated()` but **no JWT decoder and no auth
controller** — every endpoint is effectively unreachable over HTTP (the
test suite exercises controllers directly, so this went unnoticed).
Verifying identity tokens requires key distribution plus fixing that
security chain — a separate, larger decision.

Meanwhile `web-apis` already has the same AI surface as the odeev-kata
PoC (`CodeGenChatController` + `ArchitectureContextService`), so the
honest increment is the tool-contract layer, with architecture state as
the grounding payload this repo uniquely has.

## Decision

- `services/AgentToolRegistry` — named-tool map over `OllamaChatClient`,
  same contract as odeev-kata (`GET /api/agent/tools` discovery,
  `POST /api/agent/tools/call {tool,input}` → `{tool,ok,output,error}`;
  unknown→404, missing param→400, LLM failure→502).
- Tools: `architecture_context` (deterministic — counts + named catalog
  via `ArchitectureContextService`, no LLM), `generate_code`,
  `architecture_advice` (LLM grounded in live architecture state).
- `ArchitectureContextService.getEntityCatalog()` added — named listing
  per entity type; context logic stays in the service, not the registry.
- Read/generate only; no domain mutations.

## Consequences

- Agents get a stable, discoverable contract; prompts/grounding evolve
  without breaking callers. Caller owns orchestration — no tool-calling
  loop here.
- Identity-aware behavior is **deferred**, not faked: when JWT
  verification lands (decoder + shared key + a working auth path),
  per-user scoping becomes a registry-level concern, not an endpoint
  rewrite.
- Landmine documented in AGENTS.md: web-apis' `authenticated()` chain
  has no credential source — fix before exposing the API beyond tests.
