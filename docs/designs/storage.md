# Storage Design (v1, Storage-Neutral)

Depends on:
- [Architecture Overview](../architecture/architecture-overview.md)
- [Graph Model Specification](../architecture/graph-model.md)
- [ID and Normalization Rules](../architecture/id-and-normalization.md)
- [Architectural Invariants (v1)](../architecture/invariants.md)
- [Roadmap – v1](../roadmaps/roadmap-v1.md)

Status: Draft

---

## Scope

This design is constrained to v1:
- exported-symbol-only
- depth-bounded
- no intra-function flow
- no speculative inference

See also: [Graph Model](../architecture/graph-model.md), [Graph Views](../architecture/graph-views.md), [Invariants](../architecture/invariants.md), [Roadmap v1](../roadmaps/roadmap-v1.md).

---

## Goals

- Persist primitive graph entities (nodes, edges) only.
- Stay storage-engine neutral.
- Support deterministic reads/writes and incremental updates.
- Avoid graph-native DB dependency in v1.

---

## Logical Schema

### `nodes`

Required columns:
- `id` (PK, text)
- `kind` (text, indexed)
- `metadata` (JSON/text)
- `created_at` (optional)
- `updated_at` (optional)

### `edges`

Required columns:
- `id` (PK, text)
- `kind` (text, indexed)
- `from_id` (text, indexed)
- `to_id` (text, indexed)
- `metadata` (JSON/text)
- `weight` (optional numeric, default `1`)
- `created_at` (optional)
- `updated_at` (optional)

Foreign-key behavior is implementation-specific, but logical integrity must hold: no edge may point to missing nodes.

---

## Required Indexes

Minimum required indexes:
- `nodes(kind)`
- `edges(kind)`
- `edges(from_id)`
- `edges(to_id)`
- `edges(from_id, kind)`
- `edges(to_id, kind)`

Rationale:
- `callers`/`references` depend on fast inbound edge lookup.
- `callees`/`paths` depend on outbound edge lookup.
- `cycles` and `blast` rely on filtered traversal by kind.

---

## Transaction Strategy

### Full Rebuild

Use one atomic transaction:
1. Begin transaction.
2. Replace node and edge sets (or swap from staging tables).
3. Commit only if both node/edge writes succeed.
4. Roll back on any failure.

### Incremental Re-index

For each changed-file batch, one transaction:
1. Begin transaction.
2. Remove stale outbound edges and affected symbol rows.
3. Insert/upsert recomputed nodes and edges.
4. Commit.

Rules:
- No partial committed graph state.
- Full rebuild remains available fallback.

---

## Storage-Neutral Constraints

- No persisted transitive closures.
- No persisted multi-hop paths.
- No traversal logic in storage procedures.
- Query traversal remains in Query Engine.

This follows [invariants.md](../architecture/invariants.md) and [query-engine-architecture.md](../architecture/query-engine-architecture.md).

---

## Why a Graph-Native DB Is Not Required in v1

A graph-native DB is not required for v1 because:
- v1 stores primitive edges only and keeps traversal bounded.
- Required query set (`callers`, `callees`, `blast`, `paths`, `cycles`, `deadExports`, `trace`) can be served efficiently with indexed edge tables.
- Deterministic local CLI workflows favor embedded storage simplicity.
- Premature infrastructure complexity is an explicit architectural risk in v1.

This is aligned with [architecture-overview.md](../architecture/architecture-overview.md) and [roadmap-v1.md](../roadmaps/roadmap-v1.md).

---

## TODO (needs decision)

- Decide whether to include optional denormalized helper tables/materialized views for read performance in late v1 without violating "primitive edges only" persistence.
- Decide if WAL mode (or equivalent) is mandatory for the default embedded engine.
