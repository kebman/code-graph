# ADR-001: Graph Node Model

Status: Draft

## Context
The project needs a stable node model to keep indexing, storage, and query behavior deterministic in v1.
Node kinds must stay consistent with canonical architecture docs.

## Decision
TBD.

## Consequences
- Node kind changes must be explicit and reviewed.
- Indexer and query docs must stay aligned to the same canonical node enum set.

## Links
- [Graph Model Specification](../architecture/graph-model.md)
- [Graph Node Kinds](../architecture/graph-node-kinds.md)
- [Architectural Invariants](../architecture/invariants.md)
