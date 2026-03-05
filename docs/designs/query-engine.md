# Query Engine Design (v1)

> Project working title: Code Graph (temporary name)

This document defines the concrete implementation design of the **Query Engine** for v1.

It must conform to:

- `architecture/graph-model.md`
- `architecture/graph-views.md`
- `architecture/invariants.md`
- `roadmap/roadmap-v1.md`

The Query Engine operates strictly on indexed graph data.

---

# 1. Responsibilities

The Query Engine must:

1. Accept structured queries (CLI or programmatic)
2. Validate input (symbol/file existence)
3. Perform bounded traversal
4. Rank and limit results
5. Provide evidence-backed output
6. Generate AI context packs

The Query Engine must not:

- Modify the graph
- Perform indexing
- Introduce speculative edges
- Perform unbounded traversal

---

# 2. High-Level Structure

Proposed internal structure:

```
src/  
query-engine/  
resolver.ts  
traversal.ts  
ranking.ts  
limits.ts  
explain.ts  
output-format.ts  
context-pack.ts
```

Each module must be single-responsibility.

---

# 3. Input Model

All queries operate on:

- Node ID (preferred)
- Symbol name (resolved to ID)
- File path (resolved to ID)

Resolution rules:

- Symbol name must be unambiguous or require explicit disambiguation.
- File paths must be normalized.

Failure must produce explicit error messages.

---

# 4. Traversal Strategy

## Default Algorithm: Breadth-First Search (BFS)

Reasons:

- Finds shortest paths first
- Predictable depth layering
- Suitable for blast and caller/callee queries

DFS may be used for cycle detection only.

---

# 5. Depth Control

Every traversal must enforce:

- Explicit depth parameter OR
- Safe default depth (e.g., 3)

Traversal must terminate when:

- Depth limit reached
- Node expansion limit reached
- Terminal boundary encountered (flow queries)

---

# 6. Core Query Implementations

---

## 6.1 callers(symbol, depth)

Algorithm:

1. Resolve symbol to node ID.
2. Traverse incoming CALLS edges.
3. Depth-bounded BFS.
4. Collect paths.
5. Rank by path length.
6. Return unique caller symbols.

Output includes:

- Caller symbol
- File location
- Example call site(s)

---

## 6.2 callees(symbol, depth)

Same as callers, but traverse outgoing CALLS edges.

---

## 6.3 blast(symbol)

Traverse:

- Incoming REFERENCES
- Incoming CALLS
- Incoming IMPORTS (file-level)

Goal:

Identify all nodes potentially affected by change.

Traversal rules:

- Use BFS
- Limit depth
- Deduplicate results

---

## 6.4 cycles()

Cycle detection strategies:

### File Graph

Use DFS with recursion stack detection.

### Symbol Graph

Detect cycles in CALLS graph only.

Output:

- List of cycle paths
- Minimal cycle length first

---

## 6.5 deadExports()

Algorithm:

1. Select all exported symbols.
2. For each:
   - Check inbound REFERENCES and CALLS edges.
3. Return symbols with zero inbound edges.

Exclude:

- Entry points (optional future rule)
- Public API roots (if configured)

---

## 6.6 paths(from, to, depth)

Algorithm:

1. Resolve start and end nodes.
2. Perform BFS from start.
3. Stop when end reached.
4. Collect shortest paths first.
5. Enforce path count limit.

Output:

- Ordered hop list
- Edge type per hop
- Evidence metadata

---

## 6.7 trace(source, sink, depth) (v1 limited)

Supported transitions:

- CALLS
- RETURNS_TYPE
- ACCEPTS_TYPE
- WRITES_DB
- RESPONDS_WITH

Traversal rules:

- Stop at terminal sinks
- Do not enter local variable tracking
- Depth bounded

Flow ranking:

- Prefer shorter path
- Prefer paths with terminal sink

---

# 7. Edge Filtering

Traversal may filter edges by type.

Examples:

- callers(): only CALLS
- blast(): CALLS + REFERENCES + IMPORTS
- trace(): CALLS + flow-related edges

Edge filtering must be explicit and deterministic.

---

# 8. Ranking Rules

When multiple paths exist:

1. Shorter paths rank higher.
2. Fewer file transitions rank higher.
3. Strong edges (CALLS) rank higher than weak (REFERENCES).
4. Deterministic tie-breaking by node ID.

Ranking must not be probabilistic.

---

# 9. Result Limits

Hard limits:

- Max depth (default 3)
- Max nodes visited (e.g., 1000)
- Max paths returned (e.g., 20)

If exceeded:

- Truncate results
- Indicate truncation in output

Limits must be configurable.

---

# 10. Output Format

CLI output must support:

- Human-readable mode
- JSON mode (structured)

Each hop in path output must include:

- Node ID
- Node kind
- File path
- Line/column (if applicable)
- Edge kind

Example:

```
UserController.createUser  
CALLS →  
UserService.createUser  
WRITES_DB →  
db.users.insert
```

---

# 11. Explain Module

The Query Engine must provide edge explanation metadata.

For file-level edges:

- Primary cause
- Symbol list
- Reference count
- Example location

For symbol-level edges:

- Call site(s)
- Reference count
- Type context (if available)

This enables future UI “click edge → explain” behavior.

---

# 12. AI Context Pack

Command:

```
pack --from X --to Y --max-tokens N
```

Process:

1. Execute bounded path query.
2. Identify unique files in path(s).
3. Extract minimal relevant snippets.
4. Preserve call order.
5. Enforce token limit.

Snippets must include:

- File path
- Line numbers
- Surrounding context window

Context pack must be deterministic.

---

# 13. Error Handling

The Query Engine must:

- Fail gracefully on unknown symbol
- Report ambiguous symbol names
- Indicate unresolved nodes
- Never crash due to traversal overflow

---

# 14. Testing Requirements

Required tests:

- callers() returns correct direct callers
- callees() returns correct direct callees
- cycles() detects simple import cycle
- blast() includes direct dependents
- deadExports() identifies unused exports
- trace() stops at DB or HTTP sink
- Deterministic ordering across runs

Snapshot tests recommended for path outputs.

---

# 15. Known Limitations (v1)

- Does not detect runtime-only call relationships
- Does not model dynamic dispatch precisely
- Does not include local variable propagation
- Flow tracing limited to cross-function boundaries

These are acceptable within v1 scope.

---

# 16. Definition of Done (Query Engine v1)

Query Engine is complete when:

- All structural queries operate correctly.
- Traversal respects depth and limits.
- Output is deterministic.
- Context pack generation works.
- No invariant violations.

---

# Status

This document defines the concrete Query Engine design for v1.

Any expansion beyond exported-symbol-level traversal requires scope update.

