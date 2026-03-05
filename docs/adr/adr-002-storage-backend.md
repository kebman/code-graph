# ADR-002: Storage Backend

Status: Draft

## Context
The project needs a practical persistence approach for deterministic local indexing and querying in v1.
Storage must remain engine-neutral while supporting required traversal access patterns.

## Decision
TBD.

## Consequences
- Storage docs and schema field names must remain aligned with canonical model docs.
- Query traversal logic remains in the query engine, not in storage-specific features.

## Links
- [Storage Design](../designs/storage.md)
- [Graph Storage Model](../architecture/graph-storage-model.md)
- [Graph Model Specification](../architecture/graph-model.md)
