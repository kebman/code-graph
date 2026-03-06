# Milestones – v1 (M1..M6)

Depends on:
- [Roadmap – v1](./roadmap-v1.md)
- [Architecture Overview](../architecture/architecture-overview.md)
- [Graph Model Specification](../architecture/graph-model.md)
- [Architectural Invariants (v1)](../architecture/invariants.md)
- [Indexer Design (v1)](../designs/indexer.md)
- [Query Engine Design (v1)](../designs/query-engine.md)

Status: Draft

---

## Scope

These milestones are constrained to v1:
- exported-symbol-only
- depth-bounded
- no intra-function flow
- no speculative inference

See also: [Graph Model](../architecture/graph-model.md), [Graph Views](../architecture/graph-views.md), [Invariants](../architecture/invariants.md), [Roadmap v1](./roadmap-v1.md).

---

## Milestone Map

### M1 - Foundation and File Graph

Goal:
- establish indexer baseline and View 1 file graph persistence/queryability.

Exit criteria:
- `index` produces deterministic `File` nodes and `IMPORTS` edges.
- basic file graph listing/import query works.
- output is stable across repeated runs on unchanged repository.

Primary references:
- [roadmap-v1.md](./roadmap-v1.md)
- [indexer.md](../designs/indexer.md)
- [graph-model.md](../architecture/graph-model.md)

### M2 - Exported Symbol Indexing

Goal:
- add View 2 exported symbol extraction and symbol/file linkage.

Exit criteria:
- exported `Symbol` nodes are indexed deterministically.
- `REFERENCES` extraction across files is available with evidence.
- `deadExports` prerequisites are satisfied.

Primary references:
- [roadmap-v1.md](./roadmap-v1.md)
- [indexer.md](../designs/indexer.md)
- [invariants.md](../architecture/invariants.md)

### M3 - Call Graph Queries

Goal:
- implement `CALLS` extraction and bounded caller/callee/path traversal.

Exit criteria:
- `callers`, `callees`, and `paths` work with depth limits.
- output includes evidence locations and deterministic ordering.
- no unbounded traversal possible.

Primary references:
- [query-engine.md](../designs/query-engine.md)
- [query-engine-architecture.md](../architecture/query-engine-architecture.md)
- [invariants.md](../architecture/invariants.md)

### M4 - Structural Analysis Utilities

Goal:
- deliver cycle detection and dead export analysis as practical maintenance utilities.

Exit criteria:
- `cycles` detects file and symbol call cycles.
- `deadExports` reports exported symbols with zero inbound usage.
- truncation and limit signaling are explicit in outputs.

Primary references:
- [roadmap-v1.md](./roadmap-v1.md)
- [query-engine.md](../designs/query-engine.md)
- [output-format.md](../designs/output-format.md)

### M5 - Incremental Indexing Reliability

Goal:
- make incremental re-indexing correct and stable.

Exit criteria:
- changed-file re-index leaves no stale outbound/inbound edges.
- unchanged entities retain stable IDs.
- incremental results match full rebuild results for same repository state.

Primary references:
- [indexer-architecture.md](../architecture/indexer-architecture.md)
- [id-and-normalization.md](../architecture/id-and-normalization.md)
- [invariants.md](../architecture/invariants.md)

### M6 - Minimal Flow Tracing and Context Pack

Goal:
- ship bounded View 3 flow tracing and AI context-pack generation.

Exit criteria:
- `trace` reaches terminal sink boundaries (`WRITES_DB`, `RESPONDS_WITH`) with bounded traversal.
- `pack` generates deterministic, token-bounded output from bounded paths.
- no intra-function flow modeling is introduced.

Primary references:
- [roadmap-v1.md](./roadmap-v1.md)
- [graph-views.md](../architecture/graph-views.md)
- [query-engine.md](../designs/query-engine.md)

---

## Cross-Milestone Guardrails

- Scope guardrails in [invariants.md](../architecture/invariants.md) apply to every milestone.
- ID stability and normalization rules in [id-and-normalization.md](../architecture/id-and-normalization.md) are mandatory from M2 onward.
- Edge explainability contract in [edge-explanations.md](../architecture/edge-explanations.md) is required for user-facing query results.
