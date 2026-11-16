# 6. Role claims and JSR-250 method security for web-apis

Date: 2026-11-16

## Status

Accepted

## Context

ADR-005 made web-apis an OAuth2 resource server and recorded, in its
consequences, that `@RolesAllowed("user")` on the six controllers was
**inert**: method security was not enabled and identity tokens carried no
role claim. Authentication ("who") worked, authorization ("what") did
not — every identity token, whoever it represented, reached every
endpoint.

The annotations were already there, written as if the project were
Quarkus (where `@RolesAllowed` reads the token's `groups`). web-apis is
the Java/Spring module, so the equivalent wiring had to be added.

## Decision

- **Roles travel in the `groups` claim.** `UserService` in `identity`
  signs `groups: ["user"]` into every token it issues — the MicroProfile
  JWT convention, and the same claim Quarkus `@RolesAllowed` would read.
- **web-apis maps claims to authorities.** A `JwtAuthenticationConverter`
  bean reads `groups` and prefixes each entry with `ROLE_`, producing
  `ROLE_user`.
- **Method security is enabled with JSR-250 support**:
  `@EnableMethodSecurity(jsr250Enabled = true)`. `jsr250Enabled` defaults
  to `false`, which is the specific reason the annotations were
  decorative; `@RolesAllowed` is the annotation the controllers already
  use, so it stays and nothing is rewritten to `@PreAuthorize`.

## Consequences

- `@RolesAllowed("user")` now enforces. A valid identity token without a
  `groups` claim, or with only unrelated groups, is a **403**; a token
  with `groups: ["user"]` passes. Anonymous / wrong-key / malformed stay
  **401**. `JwtAuthenticationTest` covers each of these against the real
  filter chain.
- Every identity issued today is a plain user, so `user` is the only
  role. There is no role model yet — introducing more roles means
  deciding where they live and who may grant them, not just adding a
  string.
- The pointcut matches class-level annotations, so the six controllers
  need no per-method annotations; a controller-wide
  `@RolesAllowed("user")` is enough.
- The browser keeps working unchanged: tokens from
  `POST :8080/api/identity/login` now carry `groups`, and the web-app's
  `apiFetch` already sends them.
- Issuer validation is still absent — unchanged from ADR-005.
