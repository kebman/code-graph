# Graph Traversal Rules

Status: Draft

Depends on:

- docs/architecture/graph-model.md
- docs/architecture/graph-views.md
- docs/architecture/invariants.md
- docs/architecture/edge-explanations.md
- docs/designs/query-engine.md

This document defines the rules for traversing the code graph.

Traversal rules ensure that queries behave predictably and avoid infinite loops or non-deterministic behavior.


---

# Scope

Traversal rules apply to all graph queries implemented in:

```
src/queries/
```

These rules govern how edges are followed, how paths are enumerated, and how traversal limits are enforced.

Traversal behavior must remain consistent across all query types.


---

# Traversal Principles

Graph traversal must follow several core principles.


## Deterministic Ordering

Traversal must always produce results in deterministic order.

Requirements:

- nodes must be processed in sorted identifier order
- edges must be traversed in sorted order
- path enumeration must follow deterministic expansion

This ensures repeated queries produce identical output.


---

## Cycle Awareness

The code graph may contain cycles.

Examples include:

- circular module imports
- recursive functions
- mutually dependent modules

Traversal must detect cycles and prevent infinite loops.

Typical strategies include:

- visited node tracking
- path depth limits


---

## Depth Limits

All traversal must respect explicit depth limits.

Depth limits prevent runaway traversal in large graphs.

Example default limits:

- caller search depth
- dependency path depth
- blast radius depth

Queries should expose depth configuration where appropriate.


---

# Path Construction

When traversal discovers a path between nodes, the path should include:

- ordered node sequence
- ordered edge sequence
- edge types used

Paths must be reproducible and explainable.


---

# Evidence Collection

Queries should record traversal evidence.

Evidence may include:

- nodes visited
- edges followed
- truncated paths
- cycle detection events

Evidence supports explainable query output.

See:

```
docs/architecture/edge-explanations.md
```


---

# Traversal Types

Different queries require different traversal strategies.


## Forward Traversal

Follows outgoing edges.

Examples:

- dependency paths
- blast radius

```
A → B → C
```


---

## Reverse Traversal

Follows incoming edges.

Examples:

- callers
- dependents

```
C ← B ← A
```


---

## Bidirectional Traversal

Some queries may require exploring both directions.

Examples:

- relationship discovery
- shortest path queries


---

# Traversal Boundaries

Traversal must respect boundaries defined by the graph model.

Examples include:

- symbol-level vs file-level edges
- module boundaries
- view-specific constraints

See:

```
docs/architecture/graph-views.md
```


---

# Query Consistency

All queries must follow the same traversal semantics.

Two queries operating on the same graph should produce results that are logically consistent.

This avoids confusion when interpreting query outputs.


---

# Performance Considerations

Traversal algorithms should prioritize efficiency.

Possible strategies include:

- early termination
- path pruning
- memoization

However, performance optimizations must never violate determinism.


---

# Relationship to Query Engine

Traversal rules define the operational behavior of the query engine.

See:

```
docs/architecture/query-engine-architecture.md  
docs/designs/query-engine.md
```

The query engine must implement traversal logic that conforms to these rules.


---

# Long-Term Goal

Traversal rules ensure that graph exploration remains predictable and explainable.

This is especially important for:

- developer analysis
- automated tooling
- AI-assisted workflows

A consistent traversal model makes the graph easier to reason about and extend.

