# Graph Edge Kinds

Status: Draft

Depends on:

- [Graph Model Specification](./graph-model.md)
- [Graph Node Kinds](./graph-node-kinds.md)
- [Graph Views Specification](./graph-views.md)
- [Architectural Invariants (v1)](./invariants.md)
- [Edge Explanations Contract](./edge-explanations.md)

This document defines canonical edge kinds for v1.
Canonical EdgeKind enums must match [graph-model.md](./graph-model.md).

---

# Scope

For v1, edge kinds are bounded and evidence-based.

v1 boundaries:
- exported-symbol-only
- depth-bounded traversal
- no intra-function local flow tracking
- no speculative inference

---

# Edge Kind Overview (Canonical)

## Structural edges

```
IMPORTS
CONTAINS
REFERENCES
CALLS
INSTANTIATES
ACCEPTS_TYPE
RETURNS_TYPE
```

## Flow edges (v1 limited)

```
WRITES_DB
RESPONDS_WITH
VALUE_FLOW
```

## Runtime edges

```
BUILDS
RUNS
DEPENDS_ON
MOUNTS
```

---

# Structural Edges

## IMPORTS
File -> File

## CONTAINS
File -> Symbol

## REFERENCES
Symbol -> Symbol

## CALLS
Symbol -> Symbol

## INSTANTIATES
Symbol -> Symbol

## ACCEPTS_TYPE
Symbol -> Type/Symbol

## RETURNS_TYPE
Symbol -> Type/Symbol

---

# Flow Edges

## WRITES_DB
Symbol -> Sink

## RESPONDS_WITH
Symbol -> Sink

## VALUE_FLOW
Symbol -> Symbol (cross-function boundary only in v1)

---

# Runtime Edges

## BUILDS
Compose -> Dockerfile

## RUNS
Compose -> Service

## DEPENDS_ON
Service -> Service

## MOUNTS
Service -> File

---

# Derived Relationships (Not EdgeKind Enums)

The following are useful derived/explain relationships, but are not canonical persisted EdgeKind enums in v1:
- `AGGREGATED_REFERENCE` (file-level projection derived from symbol-level evidence)
- `TRANSFORMS` (heuristic flow annotation metadata)
- `EXPOSES` (runtime topology detail; represent via metadata unless promoted by model update)

TODO (needs decision):
- If any derived relationship becomes a first-class edge kind, update [graph-model.md](./graph-model.md), [graph-views.md](./graph-views.md), and [invariants.md](./invariants.md) together.

---

# Edge Identity

Edge IDs must be deterministic and aligned with [id-and-normalization.md](./id-and-normalization.md).

---

# Relationship to Views

View mapping must match [graph-views.md](./graph-views.md):
- View 0: runtime topology (runtime edges)
- View 1: file dependency (file-level structural edges)
- View 2: symbol relationships (symbol-level structural edges)
- View 3: information flow (flow edges)

---

# Long-Term Goal

Keep edge enums consistent across indexer, query, and output documentation to prevent semantic drift.
