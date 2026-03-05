# Architecture Overview

> Project working title: **Code Graph**
>
> The project name is temporary and may change.
> Architecture and structure are independent of branding.

---

# 1. System Purpose

Code Graph builds a **semantic, queryable representation of a TypeScript repository**.

It extracts structure from source code and runtime configuration, stores it as a graph model, and exposes a query interface for:

- File/module relationships
- Symbol references and call chains
- Information flow across boundaries
- Refactor blast radius analysis
- AI context slicing

The system is CLI-first, index-driven, and incrementally updatable.

---

# 2. High-Level Architecture

The system consists of four major subsystems:

1. **Indexer**
2. **Graph Store**
3. **Query Engine**
4. **Presentation Layer (CLI / optional UI)**

```
Repository  
│  
▼  
Indexer (TS Compiler API)  
│  
▼  
Graph Model (Nodes + Edges)  
│  
▼  
Query Engine  
│  
├── CLI  
└── Optional Visualization Layer
```

---

# 3. Core Subsystems

## 3.1 Indexer

Responsibility:
- Parse the repository
- Extract structural information
- Build/update graph model

Primary technology:
- TypeScript Compiler API

Inputs:
- Source files
- tsconfig.json
- Docker files (View 0)
- git diff (for incremental updates)

Outputs:
- Nodes
- Edges
- Metadata

Indexer must be:
- Deterministic
- Incremental
- Idempotent

---

## 3.2 Graph Model

The graph model is conceptual first, storage second.

### Node Types (v1)

- File
- Symbol (function, class, method, type, const)
- Type (explicit or derived)
- Service (runtime boundary)
- Sink (DB, HTTP response, log)

### Edge Types (v1)

- IMPORTS
- REFERENCES
- CALLS
- INSTANTIATES
- RETURNS_TYPE
- ACCEPTS_TYPE
- WRITES_DB
- RESPONDS_WITH
- BUILDS (Docker)
- DEPENDS_ON (Docker)

Edges may include metadata:
- Source location
- Count (aggregation strength)
- Transform hints

The graph is layered and query-driven.
Not all layers are materialized by default.

---

## 3.3 Graph Storage

Initial storage design:

- Node table
- Edge table
- Indexed by:
  - from_id
  - to_id
  - edge_type

Storage implementation (v1 candidate):
- SQLite (embedded)
- Or equivalent lightweight local store

The system does not require a graph-native database in v1.
Traversal logic lives in the query engine.

---

## 3.4 Query Engine

Responsibility:
- Execute graph traversals
- Rank and limit results
- Generate trace paths
- Produce AI context packs

Core query categories:

- Structural:
  - callers()
  - callees()
  - cycles()
  - blast()
- Flow-based:
  - trace()
  - paths()
- Maintenance:
  - deadExports()

Queries must:
- Be depth-bounded
- Be deterministic
- Return evidence references

The engine may implement BFS/DFS traversal internally.

---

## 3.5 Presentation Layer

v1 is CLI-first.

CLI responsibilities:
- Run indexing
- Execute queries
- Print structured output
- Export graph data
- Generate AI context packs

Optional future:
- Web-based graph viewer
- IDE integration

Visualization is secondary to query correctness.

---

# 4. Layered Graph Views

The architecture supports multiple abstraction layers.

## View 0 – Runtime Topology

- Dockerfile
- docker-compose
- Services
- Ports
- Dependencies

Purpose:
Understand runtime boundaries and service relationships.

---

## View 1 – File Graph

Nodes:
- Files

Edges:
- Imports
- Aggregated symbol references

Purpose:
Architectural overview and module clustering.

---

## View 2 – Symbol Graph

Nodes:
- Exported symbols

Edges:
- Calls
- Instantiations
- Type relationships

Purpose:
Understand logical connections.

---

## View 3 – Information Flow (Query-Based)

Nodes:
- Parameters
- Return values
- Recognized sources/sinks

Edges:
- Value propagation
- Transform steps
- DB writes
- HTTP responses

Purpose:
Trace how information moves and morphs.

This layer is generated dynamically per query.

---

# 5. Incremental Indexing

The system must avoid full re-index on every run.

Strategy:

1. Detect changed files via git diff.
2. Re-index only changed files.
3. Update:
   - Outbound edges from changed files.
   - Inbound edges to exported symbols in changed files.
4. Preserve stable node IDs where possible.

Full rebuild remains available for safety.

---

# 6. Information Flow Model

Information flow is modeled at function boundaries in v1.

Tracked transitions include:

- Parameter → function call
- Function return → call site
- DTO → DB write
- DB read → service return
- Service return → HTTP response

Transform detection is heuristic-based in v1.

Full intra-function dataflow is out of scope.

---

# 7. AI Context Pack Architecture

The system must support minimal graph slices for AI.

Pipeline:

1. Execute bounded query (trace/paths).
2. Extract:
   - Relevant files
   - Relevant symbols
   - Call chain order
   - Types involved
3. Limit by token budget.
4. Produce structured output.

This enables:
- Reduced hallucination risk
- Minimal relevant context exposure
- Deterministic reasoning surface

---

# 8. Non-Goals (Architectural)

- Full language-agnostic engine in v1
- Security-grade taint analysis
- Runtime execution tracing
- Enterprise-scale graph clustering
- Perfect modeling of dynamic dispatch

The system prioritizes clarity over completeness.

---

# 9. Architectural Risks

1. Graph explosion if locals are indexed too early.
2. Over-modeling dataflow beyond what TS can statically infer.
3. Premature adoption of graph-native DB infrastructure.
4. UI-first design before query model is stable.

Mitigation:
Keep v1 bounded to exported symbols and file-level structure.

---

# 10. Future Architectural Extensions

- Intra-procedural dataflow engine
- Schema-aware transform recognition
- Runtime instrumentation merge
- Neo4j or graph-native backend (if justified)
- Multi-language index adapters

---

# Status

Architecture is in early definition phase.

Primary objective:
Deliver a usable v1 structural + call graph with bounded flow tracing before expanding scope.

