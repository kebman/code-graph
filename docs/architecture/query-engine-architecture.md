# Query Engine Architecture

> Project working title: Code Graph (temporary name)

The Query Engine is responsible for traversing the Graph Model and producing deterministic, bounded, explainable results.

It does not parse source code.
It does not modify the graph.
It operates strictly on indexed Nodes and Edges.

---

# 1. Purpose

The Query Engine:

- Executes structural graph queries
- Performs bounded traversals (BFS/DFS)
- Ranks and limits results
- Produces evidence-backed output
- Generates AI context packs

The Query Engine does **not**:

- Perform indexing
- Mutate graph structure
- Recompute symbol resolution
- Execute unbounded traversals

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
│  
├── CLI Output  
└── AI Context Pack
```

The Query Engine is read-only with respect to the Graph Store.

---

# 3. Core Responsibilities

The Query Engine must:

1. Accept structured queries (CLI or programmatic)
2. Validate query parameters
3. Execute bounded traversal
4. Aggregate and rank results
5. Return deterministic output
6. Provide evidence references (file + location)

---

# 4. Query Categories (v1)

## 4.1 Structural Queries

These operate on file and symbol relationships.

### callers(symbol, depth)
Return all symbols that call the given symbol.

### callees(symbol, depth)
Return all symbols called by the given symbol.

### blast(symbol)
Return all files and symbols directly or transitively dependent on the given symbol (bounded depth).

### cycles()
Detect cycles in:
- File import graph
- Symbol call graph

### deadExports()
Return exported symbols with zero inbound REFERENCES edges.

---

## 4.2 Path Queries

### paths(from, to, depth)
Return possible paths between two nodes.

Constraints:
- Depth-bounded
- Deterministic ordering
- Path count limited

---

## 4.3 Flow-Oriented Queries (v1 Limited)

### trace(source, sink, depth)

Trace cross-function boundary flow.

Supported transitions:
- Parameter → call argument
- Return → call site
- Symbol → WRITES_DB edge
- Symbol → RESPONDS_WITH edge

No intra-function variable tracking in v1.

---

# 5. Traversal Model

The Query Engine uses graph traversal strategies.

## Default Strategy: BFS (Breadth-First Search)

Reasons:
- Shortest path preference
- Predictable depth layering
- Suitable for blast radius queries

## Depth Limits

All traversal must:

- Require explicit depth or default safe limit
- Prevent infinite recursion
- Prevent graph explosion

---

# 6. Determinism Rules

The Query Engine must:

- Sort candidate edges before traversal
- Use stable node ordering
- Produce identical output for identical graph state
- Avoid randomness

Determinism is required for:
- Reproducibility
- Testing
- AI context generation

---

# 7. Edge Interpretation Rules

The Query Engine does not treat all edges equally.

Edge types may be:

- Strong (CALLS, IMPORTS)
- Weak (REFERENCES aggregated)
- Terminal (WRITES_DB, RESPONDS_WITH)

Traversal policies may:

- Prioritize strong edges
- Filter by edge type
- Stop at terminal edges

---

# 8. Aggregation and Ranking

When multiple paths exist:

- Prefer shortest paths
- Prefer strong-edge paths
- Limit number of returned paths
- Provide path count summary

Example ranking factors:

1. Path length
2. Edge strength
3. Directness (fewer intermediate files)

---

# 9. Output Contract

All query results must include:

- Node ID
- Node type
- File path (if applicable)
- Evidence:
  - Source file
  - Line/column
- Edge type between hops

Example path output structure:

```
UserController.createUser  
CALLS →  
UserService.createUser  
WRITES_DB →  
db.users.insert
```

Evidence metadata must be included per hop.

---

# 10. Edge Explanation Contract

When presenting a relationship (especially file-level edges), the Query Engine must provide:

- Primary cause (e.g., import, call)
- Involved symbols
- Reference count (if aggregated)
- Source locations

This enables “click edge → explain” behavior in future UI.

---

# 11. Safety Constraints

The Query Engine must enforce:

- Maximum depth limit
- Maximum node count limit
- Maximum path count limit

If limits are exceeded:

- Return partial results
- Clearly indicate truncation

---

# 12. AI Context Pack Mode

The Query Engine must support:

```
pack --from X --to Y --max-tokens N
```

Behavior:

1. Execute bounded path query.
2. Collect involved files.
3. Extract relevant snippets only.
4. Respect token limit.
5. Preserve call order in output.

The pack must include:

- Path explanation
- Types involved (if available)
- Evidence locations

AI packs must be deterministic and reproducible.

---

# 13. Performance Expectations

v1 targets:

- Sub-second query execution for medium repos
- Depth-limited traversal under typical developer workflows
- No full graph scan for simple queries

Query performance must not depend on UI layer.

---

# 14. Error Handling

The Query Engine must:

- Fail gracefully on invalid symbols
- Report unknown node IDs
- Indicate unresolved edges
- Never crash due to traversal overflow

---

# 15. Non-Goals (v1)

- Full taint analysis
- Probabilistic dynamic dispatch resolution
- Runtime execution modeling
- Infinite-depth reasoning
- Automatic refactor suggestions

---

# 16. Future Extensions (Post v1)

- Intra-function dataflow engine
- Weighted edge learning
- Query DSL expansion
- Cypher-like syntax
- Interactive graph exploration layer

---

# Status

This document defines the structural behavior of the Query Engine for v1.

All query capabilities beyond exported-symbol-level traversal require explicit scope approval.

