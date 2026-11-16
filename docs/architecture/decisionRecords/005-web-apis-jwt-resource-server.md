# 5. web-apis as an OAuth2 resource server for identity JWTs

Date: 2026-11-16

## Status

Accepted

## Context

ADR-004 documented that web-apis' `anyRequest().authenticated()` chain
had no credential source: no JWT decoder, no auth controller, and —
worse, found while implementing this — `@SpringBootApplication` scanned
only `com.hamzajg.dynamicsoft.apis`, so the `services`/`repositories`
packages were never component-scanned and **the app failed to start at
all** (`UnsatisfiedDependencyException` on every controller). The
identity module already issues RS256 JWTs via smallrye-jwt
(`Jwt.sign()`), signed with a local `jwt-private.pem` that is
gitignored. Token issuance therefore stays in `identity`; web-apis only
needs to *verify*.

## Decision

- `@SpringBootApplication(scanBasePackages = "com.hamzajg.dynamicsoft")`
  so the sibling `services`/`repositories` packages are actually wired.
- `spring-boot-starter-oauth2-resource-server` + a `JwtDecoder` bean
  (`NimbusJwtDecoder.withPublicKey`) built from an RSA public key in PEM
  format at `security.jwt.public-key-location`
  (env override `JWT_PUBLIC_KEY_LOCATION`).
- **Key distribution**: identity keeps signing with `jwt-private.pem`
  (gitignored, per environment). The public half is derived once per
  environment — `openssl rsa -in jwt-private.pem -pubout -out
  ../web-apis/jwt-public.pem` — and is also gitignored because it is
  environment-specific, not because it is secret. The app **fails fast**
  at startup if the key is missing/unreadable: a clear boot error beats
  silently 401-ing every request.
- Public endpoints remain: `/api/v1/auth/**` (reserved for a future
  facade), `/v3/api-docs/**`, `/swagger-ui/**`, `/swagger-ui.html`,
  `/webjars/**` (required for the Swagger UI assets themselves).
- No auth controller in web-apis: register/login already live in the
  identity module (`/api/identity/register|login`); duplicating them
  would fork the credential path.

## Consequences

- Endpoints are reachable for the first time: anonymous → 401, valid
  identity JWT → through, wrong-key/malformed/expired → 401. Covered by
  `JwtAuthenticationTest` (@SpringBootTest + MockMvc, throwaway RSA
  keypair — no key files needed in CI).
- `@RolesAllowed("user")` on controllers was shipped here **inert** —
  method security was not enabled and identity tokens carried no role
  claim. Superseded by ADR-006, which signs a `groups` claim into the
  token and turns on JSR-250 method security.
- Issuer is not validated — verification is pinned to the public key
  only. Acceptable for a single-issuer learning deployment; add
  `JwtValidators`/`JwtDecoder` issuer checks if a second issuer appears.
- The web-app logs in against the real `POST /api/identity/login` and
  sends `Authorization: Bearer` on every API call
  (`src/web-app/src/modules/api/client.js`); a 401 clears the stored
  token and returns to `/authentication`.
- Per-user scoping (ADR-004's deferred "identity-aware" behavior) is now
  unblocked: controllers can read the `Jwt` authentication principal.
