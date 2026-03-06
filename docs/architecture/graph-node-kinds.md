# Graph Node Kinds

Status: Draft

Depends on:

- [Graph Model Specification](./graph-model.md)
- [Graph Views Specification](./graph-views.md)
- [Architectural Invariants (v1)](./invariants.md)
- [ID and Normalization Rules](./id-and-normalization.md)

This document is a usage guide for node kinds across views and query surfaces.
The canonical node model is defined only in [graph-model.md](./graph-model.md).

---

# Scope

For v1, node kinds are bounded to canonical graph-model entities.

v1 boundaries:
- exported-symbol-only
- depth-bounded traversal
- no intra-function flow nodes
- no speculative inferred nodes

---

# Authority

- Canonical node kinds, definitions, required metadata, and ID strategy are defined in [graph-model.md](./graph-model.md) Section 2.
- If this document and [graph-model.md](./graph-model.md) diverge, [graph-model.md](./graph-model.md) is authoritative.
- Any node-kind change must update [graph-model.md](./graph-model.md) before related docs.

---

# Canonical Node Kinds (Reference Index)

| Node kind | Canonical definition | Primary view usage |
|---|---|---|
| `File` | [graph-model.md §2.1](./graph-model.md) | View 1 |
| `Symbol` | [graph-model.md §2.2](./graph-model.md) | View 2 and View 3 |
| `Type` (optional explicit node) | [graph-model.md §2.3](./graph-model.md) | View 2 and View 3 |
| `Runtime` | [graph-model.md §2.4](./graph-model.md) | View 0 |
| `Sink` | [graph-model.md §2.5](./graph-model.md) | View 3 |

---

# Derived Concepts (Not Node Kinds)

The following may appear in architecture/query output, but are not canonical NodeKind enums in v1:
- module/group/cluster
- parameter and return-value flow markers (represented as evidence/metadata, not required persisted node kinds)

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
