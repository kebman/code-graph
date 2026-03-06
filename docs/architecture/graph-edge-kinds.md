# Graph Edge Kinds

Status: Draft

Depends on:

- [Graph Model Specification](./graph-model.md)
- [Graph Node Kinds](./graph-node-kinds.md)
- [Graph Views Specification](./graph-views.md)
- [Architectural Invariants (v1)](./invariants.md)
- [Edge Explanations Contract](./edge-explanations.md)

This document explains how canonical edge kinds are used by views and query surfaces.
Canonical edge definitions are authored only in [graph-model.md](./graph-model.md).

---

# Scope

For v1, edge kinds are bounded and evidence-based.

v1 boundaries:
- exported-symbol-only
- depth-bounded traversal
- no intra-function local flow tracking
- no speculative inference

---

# Authority

- Canonical edge kinds, endpoints, and metadata requirements are defined in [graph-model.md](./graph-model.md) Section 4.
- If this document and [graph-model.md](./graph-model.md) diverge, [graph-model.md](./graph-model.md) is authoritative.
- Any edge-kind change must update [graph-model.md](./graph-model.md) before related docs.

---

# View-to-Edge Usage

| View | Canonical edge source | Usage summary |
|---|---|---|
| View 0 (Runtime) | [graph-model.md §4.3](./graph-model.md) | Runtime topology relationships only. |
| View 1 (File) | [graph-model.md §4.1](./graph-model.md) | File-level structural traversal and file-edge explain output. |
| View 2 (Symbol) | [graph-model.md §4.1](./graph-model.md) | Exported-symbol relationship traversal and symbol explain output. |
| View 3 (Flow) | [graph-model.md §4.2](./graph-model.md) | Bounded cross-function flow traversal to terminal boundaries. |

---

# Derived / Query-Only Relationships (Not EdgeKind Enums)

- `AGGREGATED_REFERENCE`: derived relation used in explain/query output; not persisted as a canonical v1 edge kind.
- `EXPOSES`: removed as a v1 edge kind; runtime port exposure is metadata in View 0.
- `TRANSFORMS`: future extension only; not part of the v1 edge surface.

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
