# 3. Clean architecture modular monolith architectural style

Date: 2023-11-09

## Status

Accepted <!-- [Draft, Proposed, Accepted, Deprecated, Superseded by [ADR-0005](0005-example.md)] -->

## Context

Establish a clear separation of concerns to simplify maintenance and scalability of the system. Improve testing procedures by addressing tightly coupled components, enabling effective unit tests and integration tests. Enhance dependency management to alleviate difficulties associated with integrating new features or updating existing ones.

## Decision

To address these challenges, we has decided to adopt a Clean Architecture Modular Monolith style. This architectural style is characterized by a clear separation of concerns into layers (Entities, Use Cases, Interface Adapters, and Frameworks), promoting maintainability, testability, and flexibility.

## Consequences

Maintainability: Clean Architecture Modular Monolith promotes a maintainable codebase, making it easier for developers to understand, modify, and extend the system.

Testability: Improved testability enables comprehensive testing, reducing the likelihood of bugs and regressions.

Flexibility: The modular structure allows for the introduction of new features or changes without affecting the entire codebase.
