# ADR-003: Symbol Identity

Status: Draft

## Context
Stable symbol identity is required for deterministic output, incremental indexing, and reproducible query results.
ID generation must be consistent across platforms and repository states.

## Decision
TBD.

## Consequences
- Symbol identity changes can affect incremental correctness and snapshot stability.
- ID normalization rules must stay synchronized with indexer and query behavior.

## Links
- [ID and Normalization Rules](../architecture/id-and-normalization.md)
- [Graph Model Specification](../architecture/graph-model.md)
- [Indexer Architecture](../architecture/indexer-architecture.md)
