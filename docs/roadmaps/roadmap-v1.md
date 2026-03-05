# Roadmap – v1 (Structural + Call Graph Core)

> Project working title: Code Graph (temporary)

This roadmap defines the bounded path to a usable v1.
Scope discipline is critical. v1 must ship before expanding into deeper dataflow.

---

# 0. Success Criteria for v1

v1 is complete when:

- A TypeScript repo can be indexed.
- File dependency graph is queryable.
- Exported symbol graph is queryable.
- Callers / callees queries work.
- Basic blast radius query works.
- Cycles can be detected.
- Output is stable and deterministic.
- Incremental re-indexing works via git diff.

No UI required.
No intra-function dataflow required.

---

# Phase 1 – Foundation (Week 1)

## Goals
Establish project skeleton and indexing baseline.

## Deliverables

- Project scaffold (Node + TypeScript)
- CLI entrypoint
- TypeScript program loader
- Basic file discovery
- Extract file-level imports
- Persist:
  - File nodes
  - IMPORTS edges

## Exit Criteria

- `index` command builds file dependency graph
- `files` query lists nodes
- `imports <file>` works

---

# Phase 2 – Symbol Indexing (Week 2)

## Goals
Build exported symbol graph.

## Deliverables

- Extract exported:
  - Functions
  - Classes
  - Types
  - Constants
- Store Symbol nodes
- Extract REFERENCES across files
- Link symbols to files

## Queries Added

- `symbols <file>`
- `references <symbol>`
- `blast <symbol>`

## Exit Criteria

- Can detect unused exports
- Can list all files referencing a symbol

---

# Phase 3 – Call Graph (Week 3)

## Goals
Introduce call relationships.

## Deliverables

- Detect function call expressions
- Resolve target symbol (best effort)
- Store CALL edges
- Depth-limited traversal

## Queries Added

- `callers <symbol>`
- `callees <symbol>`
- `paths <symbolA> <symbolB>`

## Exit Criteria

- Call chains are traceable
- Depth limit prevents explosion
- Output includes file + line evidence

---

# Phase 4 – Structural Analysis Utilities (Week 4)

## Goals
Add practical refactor tools.

## Deliverables

- Cycle detection in file graph
- Cycle detection in symbol graph
- Dead export detection
- Import density analysis
- Module clustering is TBD and only included if the Phase 4 `cluster` decision is accepted.

## Queries Added

- `cycles`
- `deadExports`
- TODO (needs decision): `cluster` (not part of required v1 CLI surface unless explicitly accepted).

## Exit Criteria

- Can detect import cycles
- Cluster-related exit criteria apply only if the Phase 4 `cluster` TODO is accepted.
- Can detect unused public symbols

---

# Phase 5 – Incremental Indexing (Week 5)

## Goals
Avoid full rebuilds.

## Deliverables

- Detect changed files via git
- Re-index changed files only
- Recompute inbound/outbound edges
- Stable node ID strategy

## Exit Criteria

- Running `index` after small change is fast
- No stale edges remain

---

# Phase 6 – Minimal Flow Tracing (Week 6)

> Bounded and controlled.

## Goals
Introduce cross-function boundary flow tracing.

## Deliverables

- Track:
  - Parameter → call argument
  - Return → call site
- Recognize known sinks:
  - HTTP response
  - DB write
- Depth-bounded trace traversal

## Queries Added

- `trace <symbol> --to sink`
- `trace <symbolA> <symbolB>`

## Exit Criteria

- Can trace controller → service → DB path
- Results are readable and limited

---

# Explicitly Deferred to v2

- Intra-function variable flow
- Local variable tracking
- Runtime tracing
- Web UI
- Neo4j integration
- Multi-language support

---

# Technical Stack (v1 Target)

- Node.js
- TypeScript
- SQLite (or equivalent embedded store)
- CLI-first

Graph DB is not required in v1.

---

# Risk Control

## Primary Risk
Graph explosion.

Mitigation:
- Exported symbols only in v1.
- Depth limits.
- Aggregated file edges.

## Secondary Risk
Scope creep.

Mitigation:
- Ship Phase 3 before adding Phase 6.
- No UI before call graph is stable.

---

# Definition of "v1 Shipped"

When:

- You can run:

```
code-graph index  
code-graph callers createUser  
code-graph blast TicketOffer  
code-graph trace createUser --to db
```

- And get correct, bounded, stable output.

Then v1 is complete.

Everything else is expansion.
