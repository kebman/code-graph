# Graph Node Kinds

Status: Draft

Depends on:

- [Graph Model Specification](./graph-model.md)
- [Graph Views Specification](./graph-views.md)
- [Architectural Invariants (v1)](./invariants.md)
- [ID and Normalization Rules](./id-and-normalization.md)

This document defines the canonical node kinds used in the graph.
Canonical node enums must match [graph-model.md](./graph-model.md).

---

# Scope

For v1, node kinds are bounded to canonical graph-model entities.

v1 boundaries:
- exported-symbol-only
- depth-bounded traversal
- no intra-function flow nodes
- no speculative inferred nodes

---

# Node Kind Overview (Canonical)

The canonical node kinds in v1 are:

```
File
Symbol
Type (optional explicit node)
Runtime
Sink
```

Notes:
- `Type` may be represented via `Symbol` nodes in v1, but remains a canonical kind.
- `Runtime` covers View 0 runtime entities (for example Dockerfile, compose, service).

---

# File

Represents a source file.

Typical metadata:
- normalized path
- extension
- external/internal flag

Primary view:
- View 1 (File Dependency View)

---

# Symbol

Represents exported program elements.

Supported symbol kinds (v1):
- function
- class
- method (exported only)
- type
- const

Primary view:
- View 2 (Symbol View)

---

# Type

Represents explicit type structures when materialized as separate nodes.

Examples:
- interface
- type alias

In v1 this kind is optional as explicit storage and may be merged into `Symbol` representation.

Primary views:
- View 2
- View 3 (when type context is part of flow evidence)

---

# Runtime

Represents runtime topology entities.

Examples:
- Dockerfile
- compose file
- service

Primary view:
- View 0 (Runtime / Topology View)

---

# Sink

Represents terminal boundaries for flow traversal.

Examples:
- db_write
- http_response
- logger

Primary view:
- View 3 (Information Flow View)

---

# Derived Concepts (Not Node Kinds)

The following may appear in documentation as derived concepts, but are not canonical NodeKind enums in v1:
- module/group/cluster
- parameter and return-value flow markers (represented as evidence/metadata, not required persisted node kinds)

TODO (needs decision):
- If module/group becomes a first-class node kind post-v1, update [graph-model.md](./graph-model.md), [graph-views.md](./graph-views.md), and [invariants.md](./invariants.md) together.

---

# Relationship to Views

View mapping must match [graph-views.md](./graph-views.md):
- View 0: runtime topology
- View 1: file dependencies
- View 2: symbol relationships
- View 3: information flow

---

# Node Identity

Node identifiers must follow [id-and-normalization.md](./id-and-normalization.md).
No random or time-based identifiers are allowed.

---

# Long-Term Goal

Keep node kinds explicit, stable, and aligned across architecture/design docs so indexer and query behavior remain deterministic.
