# AI Context Pack (v1)

Status: Draft

Depends on:

- [Graph Views Specification](./graph-views.md)
- [Query Semantics](./query-semantics.md)
- [Context Pack Selection](./context-pack-selection.md)
- [Output Format Design](../designs/output-format.md)

This document is a placeholder entry point for AI context pack behavior in v1.
The concrete selection algorithm and output constraints are defined in [Context Pack Selection](./context-pack-selection.md).

## Scope

v1 context packs are:
- query-driven
- depth-bounded
- deterministic
- limited by explicit truncation/token constraints

No intra-function flow modeling is introduced by this document.

## Decision Status

Detailed semantics remain defined in:
- [Context Pack Selection](./context-pack-selection.md)
- [Query Semantics](./query-semantics.md)
- [CLI Design](../designs/cli.md)

## TODO (needs decision)

- Confirm whether this file should remain a short index document or absorb a canonical end-to-end context-pack contract.
