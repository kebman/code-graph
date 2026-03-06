# Documentation Authority Map

Depends on:
- [Documentation Authority Model](./doc-authority.md)
- [Graph Model Specification](./graph-model.md)
- [Graph Views Specification](./graph-views.md)
- [Glossary (v1)](./glossary.md)
- [Architectural Invariants (v1)](./invariants.md)

Status: Draft

---

## Purpose

This document defines the authority hierarchy for documentation under `docs/**`.
It makes ownership boundaries explicit so downstream docs cannot silently redefine canonical concepts.

---

## Authority Hierarchy

### Layer 1: Canonical Authority

Root authority documents:

- [graph-model.md](./graph-model.md)
- [graph-views.md](./graph-views.md)
- [glossary.md](./glossary.md)
- [invariants.md](./invariants.md)

Authority owned in this layer:

- canonical node kinds
- canonical edge kinds
- canonical terminology
- system invariants

### Layer 2: Architecture

Architecture docs extend Layer 1 and must reference canonical docs.
They must not redefine canonical inventories owned by Layer 1.

Primary examples:

- [indexer-architecture.md](./indexer-architecture.md)
- [query-engine-architecture.md](./query-engine-architecture.md)
- [graph-storage-model.md](./graph-storage-model.md)
- [graph-traversal-rules.md](./graph-traversal-rules.md)
- [graph-validation.md](./graph-validation.md)
- [query-semantics.md](./query-semantics.md)

### Layer 3: Design

Design docs define implementation strategy and command/data contracts.
They must reference architecture docs for canonical semantics and must not redefine architecture-owned concepts.

Examples:

- [../designs/indexer.md](../designs/indexer.md)
- [../designs/query-engine.md](../designs/query-engine.md)
- [../designs/storage.md](../designs/storage.md)
- [../designs/cli.md](../designs/cli.md)
- [../designs/output-format.md](../designs/output-format.md)

### Layer 4: Roadmap

Roadmaps define execution order and milestones.
They may reference architecture/design decisions but must not define architecture concepts.

Examples:

- [../roadmaps/roadmap-v1.md](../roadmaps/roadmap-v1.md)
- [../roadmaps/milestones-v1.md](../roadmaps/milestones-v1.md)

### Layer 5: Development

Development/process docs define workflow and validation policy.
They may reference any layer but must not redefine architecture concepts.

Examples:

- [../development/repo-structure.md](../development/repo-structure.md)
- [../development/contribution-guidelines.md](../development/contribution-guidelines.md)
- [../development/codex-workflow.md](../development/codex-workflow.md)
- [doc-validation.md](./doc-validation.md)
- [doc-linking-policy.md](./doc-linking-policy.md)

---

## Authority Diagram

```text
Canonical Authority
   ↓
Architecture
   ↓
Design
   ↓
Roadmaps
   ↓
Development
```

---

## Enforcement Summary

- Canonical definitions are owned only by Layer 1.
- `Depends on:` headers must point to same-layer or higher-authority docs.
- Architecture/Design/Roadmap docs must include `Depends on:` headers.
- Duplicate canonical inventories in downstream docs must be replaced by references to Layer 1.
