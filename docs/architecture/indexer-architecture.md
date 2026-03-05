# Indexer Architecture

> Project working title: Code Graph (temporary name)

The Indexer is responsible for transforming a TypeScript repository into a structured, queryable graph representation.

It is the foundation of the entire system.

---

# 1. Purpose

The Indexer:

- Parses a TypeScript project
- Extracts structural and semantic relationships
- Produces Nodes and Edges for the Graph Model
- Supports incremental re-indexing
- Guarantees deterministic output

The Indexer does **not**:

- Execute code
- Perform runtime tracing
- Perform full intra-function dataflow analysis (v1)
- Attempt perfect dynamic resolution

---

# 2. Architectural Position

```
Repository  
│  
▼  
Indexer  
│  
▼  
Graph Store (Nodes + Edges)  
│  
▼  
Query Engine
```

The Indexer is write-only with respect to the Graph Store.
It does not perform query traversal.

---

# 3. Inputs

## 3.1 Required Inputs

- `tsconfig.json`
- Source files included in the TS program
- File system structure

## 3.2 Optional Inputs

- `docker-compose*.yml`
- `Dockerfile`
- Git metadata (for incremental mode)

---

# 4. Indexing Scope (v1)

v1 indexing is intentionally bounded.

## Included

- File nodes
- Import relationships
- Exported symbols:
  - functions
  - classes
  - methods (exported only)
  - types
  - constants
- Symbol references across files
- Call expressions (best-effort resolution)
- Class instantiations
- Return type relationships
- Parameter type relationships

## Excluded

- Local variable tracking
- Full intra-function dataflow
- Dynamic `require()` inference
- Reflection-based symbol resolution
- Runtime behavior modeling

---

# 5. Indexing Phases

The Indexer operates in phases to maintain clarity and incremental capability.

---

## Phase 1 – Program Construction

- Load TypeScript Program via Compiler API
- Resolve module graph
- Normalize file paths
- Establish internal file ID mapping

Output:
- Canonical file list

---

## Phase 2 – File-Level Extraction

For each file:

- Extract import declarations
- Record IMPORT edges
- Record file metadata

Output:
- File nodes
- IMPORT edges

---

## Phase 3 – Exported Symbol Extraction

For each file:

- Extract exported declarations:
  - Named exports
  - Default exports
  - Re-exports
- Assign stable Symbol IDs
- Record FILE → SYMBOL relationships

Output:
- Symbol nodes
- CONTAINS edges (File → Symbol)

---

## Phase 4 – Reference Extraction

Traverse AST to:

- Detect symbol references
- Resolve referenced symbol
- Record REFERENCES edges

Aggregation rules:
- Multiple references between same File/Symbol may be aggregated
- Source location stored as metadata

---

## Phase 5 – Call Graph Extraction

For each call expression:

- Resolve target symbol (best effort)
- Record CALLS edge

If resolution fails:
- Edge may be marked as unresolved
- No speculative linking in v1

Depth is not computed here; traversal happens in Query Engine.

---

## Phase 6 – Type Relationships

For each function/method:

- Extract parameter types
- Extract return type
- Record:
  - ACCEPTS_TYPE
  - RETURNS_TYPE

No deep type propagation in v1.

---

# 6. Graph Model Interaction

The Indexer writes:

- Nodes:
  - File
  - Symbol
  - Type (optional explicit node)
- Edges:
  - IMPORTS
  - CONTAINS
  - REFERENCES
  - CALLS
  - INSTANTIATES
  - ACCEPTS_TYPE
  - RETURNS_TYPE

Edge metadata may include:
- File path
- Line/column
- Count (aggregation)

The Indexer must not:
- Perform multi-hop traversal
- Compute cycles
- Rank paths

Those belong to Query Engine.

---

# 7. ID Strategy

Each node must have a stable ID.

## File ID
- Normalized absolute path
- Or hashed canonical path

## Symbol ID
- File ID + symbol name + kind
- Must remain stable across re-index if unchanged

Stability is required for incremental updates.

---

# 8. Incremental Indexing

Goal:
Avoid full rebuild when only a subset of files changes.

## Strategy

1. Detect changed files via `git diff`.
2. For each changed file:
   - Remove outbound edges.
   - Re-index file.
3. Update inbound edges for affected symbols.
4. Preserve unchanged node IDs.

Full rebuild remains available as fallback.

---

# 9. Determinism Requirements

The Indexer must produce identical graph output for identical repository state.

Requirements:

- Stable traversal order
- Sorted output where applicable
- No time-dependent metadata
- No non-deterministic ID generation

Determinism is critical for:
- Debugging
- Diffing
- AI context reproducibility

---

# 10. Performance Considerations

v1 target:

- Medium-sized repos (< 200k LOC)
- Indexing under ~10 seconds on modern hardware
- Incremental re-index significantly faster than full rebuild

Performance optimization is secondary to correctness in v1.

---

# 11. Error Handling

Indexer must:

- Fail loudly on TS program construction errors
- Log unresolved symbol resolutions
- Avoid partial graph corruption
- Support clean rebuild mode

---

# 12. Architectural Risks

1. Symbol resolution complexity in large codebases.
2. Re-export chains complicating ID stability.
3. Graph explosion if non-exported locals are indexed prematurely.

Mitigation:
v1 strictly indexes exported symbols only.

---

# 13. Future Extensions (Post v1)

- Intra-function dataflow extraction
- Schema-aware transform detection
- Multi-language indexing adapters
- Runtime trace merging
- Advanced type propagation

These are not part of v1 scope.

---

# Status

This document defines the structural responsibilities of the Indexer for v1.

All expansions beyond exported-symbol-level indexing require explicit scope approval.

