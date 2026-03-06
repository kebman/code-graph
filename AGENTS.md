# AGENTS.md

This file defines repository rules and implementation guidance for coding agents working in this project.

Agents must treat this file as operational guidance, not optional context.

---

# 1. Project Overview

This repository implements **Code Graph**, a deterministic static analysis system that builds a structured graph representation of a codebase.

The system is designed to support:

- structural code understanding
- information-flow tracing
- API contract alignment
- documentation terminology tracking
- AI context pack generation

Current implementation priority is **Phase A: Structural Graph**.

The immediate goal is a minimal, deterministic TypeScript indexer built on top of the existing graph core.

---

# 2. Canonical Architecture Authority

The following documents are authoritative and must be treated as the source of truth:

## Graph schema and invariants
- `docs/architecture/graph-model.md`
- `docs/architecture/graph-node-kinds.md`
- `docs/architecture/graph-edge-kinds.md`
- `docs/architecture/invariants.md`
- `docs/architecture/id-and-normalization.md`
- `docs/architecture/graph-validation.md`
- `docs/architecture/graph-storage-model.md`

## Component architecture
- `docs/architecture/indexer-architecture.md`
- `docs/architecture/query-engine-architecture.md`

## Implementation design
- `docs/designs/indexer.md`
- `docs/designs/query-engine.md`
- `docs/designs/storage.md`
- `docs/designs/cli.md`
- `docs/designs/output-format.md`

Agents must not invent architecture that contradicts these documents.

If implementation appears to require a schema or invariant change, stop and propose the change instead of silently introducing it.

---

# 3. Graph Core Is Canonical

The graph core lives in:

- `src/graph/types.ts`
- `src/graph/graph.ts`
- `src/graph/ids.ts`
- `src/graph/normalize.ts`
- `src/graph/order.ts`
- `src/graph/validate.ts`

Agents must treat `src/graph/**` as the canonical implementation of the graph model.

Do not:

- duplicate graph types elsewhere
- create alternate graph containers
- redefine node or edge records
- invent parallel ID formats
- bypass graph validation if the graph is being constructed

Graph-producing code should build data that is valid for the existing graph core.

---

# 4. Canonical Graph Schema

The canonical node kinds are defined in `src/graph/types.ts`:

```text
File
Symbol
Type
Runtime
Sink
````

The canonical edge kinds are defined in `src/graph/types.ts`:

```text
IMPORTS
CONTAINS
REFERENCES
CALLS
INSTANTIATES
ACCEPTS_TYPE
RETURNS_TYPE
WRITES_DB
RESPONDS_WITH
VALUE_FLOW
BUILDS
RUNS
DEPENDS_ON
MOUNTS
```

Agents must not invent new node kinds or edge kinds.

For the initial TypeScript indexer slice, support only the smallest needed subset, but use the canonical names exactly. The preferred first slice is:

## Initial node kinds to emit

- `File`
- `Symbol`

## Initial edge kinds to emit

- `IMPORTS`
- `CONTAINS`
- `CALLS`

Do not emit broader edge coverage unless explicitly instructed.

---

# 5. Canonical Graph Records

The canonical graph records are:

## Node

Defined in `src/graph/types.ts`:

- `id`
- `kind`
- `metadata`
- optional timestamps

## Edge

Defined in `src/graph/types.ts`:

- `id`
- `from_id`
- `to_id`
- `kind`
- `metadata`
- optional `weight`
- optional timestamps

Agents must not reshape these records or introduce alternative field names.

Use `metadata` for additional structured information when needed.

---

# 6. Graph Container Behavior

`src/graph/graph.ts` defines the canonical in-memory graph container.

Important properties:

- duplicate node IDs are rejected
- duplicate edge IDs are rejected
- edges require existing source and target nodes
- canonical node IDs are enforced
- canonical edge IDs are enforced
- `File` nodes require normalized `metadata.path`
- deterministic ordering is built into:
    - `nodes()`
    - `edges()`
    - `outEdges()`
    - `inEdges()`
- `validate()` is the convenience entry point for full graph validation

Agents must preserve these expectations.

When building indexer code, assume the graph core is strict on purpose.

---

# 7. Determinism Is Mandatory

All implementation work must preserve determinism.

Required properties:

- stable file discovery order
- stable path normalization
- stable symbol extraction order
- stable node emission order
- stable edge emission order
- stable diagnostics ordering where practical

Non-deterministic behavior is considered a defect.

Avoid:

- unordered iteration when output order matters
- ambient filesystem order
- speculative set/list output
- unstable IDs
- concurrency that changes output ordering

---

# 8. Static Evidence Only

The system is based on explicit static evidence.

Agents must prefer syntax-backed, mechanically explainable extraction.

Allowed examples:

- import declarations
- function declarations
- class declarations
- method declarations
- direct identifier call expressions where the target name is syntactically obvious
- containment relationships visible from the AST

Do not introduce:

- speculative call resolution
- runtime inference
- semantic guessing
- dynamic execution
- inferred edges without clear static support

If a relationship cannot be supported conservatively, omit the edge and optionally surface a diagnostic.

---

# 9. ID and Path Rules

IDs are canonical and must follow the rules enforced by `src/graph/ids.ts`.

Normalization rules are canonical and must follow `src/graph/normalize.ts`.

Important rule already enforced by the graph core:

- `File` node `metadata.path` must already be normalized before insertion
- `File` node ID must match the canonical file-node ID generated from the normalized path

Agents must not hand-wave path handling. Normalize paths deliberately and consistently.

---

# 10. Validation Rules

Validation is part of the architecture, not an optional afterthought.

Relevant sources:

- `src/graph/validate.ts`
- `docs/architecture/graph-validation.md`

If code constructs a graph, it should be possible to validate that graph using the canonical validator.

Agents must not:

- bypass validation by inventing looser local assumptions
- redefine what counts as a valid node or edge
- suppress invariant violations with silent fallback behavior

Fail conservatively.

---

# 11. Indexer Scope Rules

The indexer should live in `src/indexer/`.

Expected responsibilities:

- file discovery
- AST parsing
- symbol extraction
- relationship extraction
- graph emission
- diagnostics

For the first implementation slice, keep scope narrow.

Prefer:

- TypeScript source files only
- import declarations
- function declarations
- class declarations
- method declarations
- direct call expressions with obvious syntax evidence

Do not expand into:

- full type analysis
- semantic symbol resolution across the whole program
- runtime topology inference
- API drift detection
- documentation terminology indexing
- storage backend design work

Those belong to later phases or later milestones.

---

# 12. Query Layer Rules

The query layer should live in `src/queries/`.

Queries operate on an already-built graph.

They should:

- read graph data
- use deterministic traversal
- return stable results
- avoid speculative interpretation

Good early query helpers include:

- find importers of a file
- find contained symbols for a file
- find callers of a symbol name
- find dependencies of a file

Do not build a full query language or DSL unless explicitly requested.

---

# 13. Diagnostics Rules

Diagnostics are allowed and encouraged where they improve trust.

Useful early diagnostics include:

- unreadable files
- parse failures
- unresolved imports
- unresolved obvious call targets

Diagnostics should be:

- conservative
- deterministic where possible
- non-speculative
- clearly separated from graph facts

Do not encode uncertain analysis as graph edges.

---

# 14. Documentation Governance

Documentation in this repo follows a formal authority model.

Relevant docs:

- `docs/architecture/doc-authority.md`
- `docs/architecture/doc-invariants.md`
- `docs/architecture/doc-validation.md`

Agents must not:

- redefine architecture in design docs
- duplicate canonical definitions casually
- introduce terminology drift
- run broad documentation rewrite campaigns unless explicitly instructed

If editing docs, prefer minimal, scoped, mechanically justified changes.

---

# 15. Forbidden Moves

Unless explicitly requested, agents must not:

- modify `src/graph/**` to work around indexer mistakes
- invent new node or edge kinds
- create alternate graph schema types
- add semantic/type inference beyond the requested slice
- add storage backends or database integrations
- add network/API features
- rewrite broad documentation surfaces
- introduce non-deterministic behavior
- emit speculative edges

If the requested task appears to require one of these, stop and surface the constraint.

---

# 16. Preferred Engineering Style

Prefer:

- clarity over cleverness
- small vertical slices
- explicit data flow
- deterministic output
- simple APIs
- readable code
- direct use of canonical helpers

Avoid:

- unnecessary abstraction
- hidden magic
- partial shadow schemas
- broad speculative frameworks
- premature extensibility that obscures current behavior

---

# 17. Practical Working Pattern

For new implementation work, the preferred sequence is:

```text
read authoritative docs
read canonical graph core
implement the smallest useful slice
validate output
add minimal harness/tests
add small query helpers
harden determinism and diagnostics
```

This repository favors incremental, reviewable progress.

---

# 18. Summary

Agents working in this repository must follow three core rules:

1. **Respect architecture authority**
2. **Preserve graph-core invariants**
3. **Prefer explicit static evidence over inference**

If there is tension between convenience and determinism, choose determinism.

If there is tension between coverage and correctness, choose correctness.

If there is tension between cleverness and clarity, choose clarity.

