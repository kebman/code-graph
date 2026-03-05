# Graph Model Specification

> Project working title: Code Graph (temporary name)

This document defines the canonical **graph data model** used by the system.

It specifies:

- Node types
- Edge types
- Required metadata
- ID strategy
- Storage-neutral schema
- Aggregation rules
- Invariants

This document is the source of truth for what the graph *is*.
The Indexer writes to this model.
The Query Engine reads from it.

---

# 1. Design Principles

The Graph Model must be:

- Explicit
- Typed
- Deterministic
- Storage-agnostic
- Stable across re-index runs
- Bounded (v1 scope enforced)

The model must not:

- Depend on a specific database
- Encode traversal logic
- Store redundant inferred paths

---

# 2. Core Entity Types (Nodes)

All nodes must have:

- `id` (stable)
- `kind` (enum)
- `metadata` (JSON object)
- `created_at` (optional)
- `updated_at` (optional)

---

## 2.1 File

Represents a source file.

Required metadata:

- `path` (canonical normalized path)
- `extension`
- `is_external` (boolean)

ID strategy:

```
file::<normalized_path>
```

Example:

```
file::src/controllers/user.ts
```

---

## 2.2 Symbol

Represents exported program elements.

Symbol kinds (v1):

- function
- class
- method (exported only)
- type
- const

Required metadata:

- `name`
- `file_id`
- `symbol_kind`
- `is_default_export`
- `is_reexport`

ID strategy:

```
symbol::<file_id>::<symbol_name>::<symbol_kind>
```

Must remain stable across re-index if declaration unchanged.

---

## 2.3 Type (Optional Explicit Node)

May represent:

- Interface
- Type alias
- Explicit schema

Required metadata:

- `name`
- `file_id`

If types are merged into Symbol nodes in v1, this node type may be deferred.

---

## 2.4 Runtime Node (View 0)

Represents:

- Dockerfile
- Service
- Compose file

Required metadata:

- `name`
- `type` (dockerfile, service, compose)

ID strategy:

```
runtime::::
```

---

## 2.5 Sink

Represents terminal boundaries.

Sink types:

- db_write
- http_response
- logger
- external_api (future)

Required metadata:

- `category`
- `file_id`
- `line`

ID strategy:

```
sink::::<file_id>::
```

---

# 3. Edge Model

All edges must have:

- `id`
- `from_id`
- `to_id`
- `kind` (enum)
- `metadata`
- `weight` (optional, default 1)

Edges are directional.

---

# 4. Edge Types (v1)

---

## 4.1 Structural Edges

### IMPORTS
File → File

Metadata:

- import type (default, named, namespace)
- source location

---

### CONTAINS
File → Symbol

Represents symbol declaration ownership.

---

### REFERENCES
Symbol → Symbol

Represents cross-symbol usage.

Metadata:

- file_id
- line
- column
- reference_count (optional aggregation)

---

### CALLS
Symbol → Symbol

Represents function invocation.

Metadata:

- file_id
- line
- column
- call_count (optional)

---

### INSTANTIATES
Symbol → Symbol

Class instantiation relationship.

---

### ACCEPTS_TYPE
Symbol → Type/Symbol

Represents parameter type.

---

### RETURNS_TYPE
Symbol → Type/Symbol

Represents return type.

---

## 4.2 Flow Edges (v1 Limited)

### WRITES_DB
Symbol → Sink

Represents DB write boundary.

---

### RESPONDS_WITH
Symbol → Sink

Represents HTTP response boundary.

---

### VALUE_FLOW (v1 limited)

Symbol → Symbol

Used only for cross-function boundary flow.

Not used for intra-function tracking.

---

## 4.3 Runtime Edges

### BUILDS
Compose → Dockerfile

### RUNS
Compose → Service

### DEPENDS_ON
Service → Service

### MOUNTS
Service → File

---

# 5. Edge Aggregation Rules

To prevent explosion:

- Multiple references between same pair may be aggregated.
- Metadata must preserve:
  - Example source location(s)
  - Total count

Aggregation must not remove evidence capability.

---

# 6. ID Stability Rules

Node IDs must remain stable if:

- File path unchanged
- Symbol name unchanged
- Symbol kind unchanged

If file is renamed:
- File ID changes
- Dependent Symbol IDs change

No random or time-based ID generation allowed.

---

# 7. Storage-Neutral Schema

Minimum logical schema:

Nodes:
- id (PK)
- kind
- metadata (JSON)

Edges:
- id (PK)
- from_id (indexed)
- to_id (indexed)
- kind (indexed)
- metadata (JSON)

Indexes required:

- nodes.kind
- edges.from_id
- edges.to_id
- edges.kind

Traversal logic must not depend on database engine.

---

# 8. Graph Invariants (v1)

1. No local variables as nodes.
2. Only exported symbols indexed.
3. All edges must have valid node endpoints.
4. No implicit bidirectional edges.
5. All traversal must be depth-bounded.
6. No synthetic inferred edges unless explicitly defined.

---

# 9. Determinism Requirements

For identical repository state:

- Node set must be identical.
- Edge set must be identical.
- Node IDs must be identical.
- Edge IDs must be identical.

Sorting and normalization must be applied before persistence.

---

# 10. Graph Size Constraints (v1 Target)

For medium repository (~100k LOC):

- File nodes: O(number of files)
- Symbol nodes: O(number of exported symbols)
- Edge count:
  - IMPORTS: O(file dependencies)
  - CALLS: bounded by exported usage
  - REFERENCES: aggregated

Graph must remain manageable in memory.

---

# 11. Explicitly Out of Scope (v1)

- Intra-function variable nodes
- Property-level object flow tracking
- Full type inference graph
- Runtime execution nodes
- Probabilistic edges

---

# 12. Future Model Extensions

- LocalVariable node
- FlowNode (parameter/return/field granularity)
- TRANSFORMS edge with structured metadata
- RuntimeTrace node
- Schema-aware morph edges
- Weighted edges for ranking

All additions must update this document before implementation.

---

# Status

This document defines the canonical Graph Model for v1.

No new node or edge type may be introduced without updating this specification.

