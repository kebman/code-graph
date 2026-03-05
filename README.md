# Code Graph (Working Title)

> ⚠️ **Name is temporary.**
>
> `code-graph` is a placeholder name used during early design and prototyping.
> The final name may change due to clarity, scope, or trademark reasons.
> Do not assume branding stability at this stage.

---

# Overview

**Code Graph** is a structural, queryable representation of a software repository.

Its purpose is to:

- Make file and symbol relationships explicit
- Enable traceable information flow analysis
- Reduce refactor risk by exposing blast radius
- Generate minimal, precise context slices for AI tooling
- Provide a layered graph view of system architecture

This is **not** an IDE replacement and not a full static analysis research project.

It is a practical developer tool for understanding medium-sized TypeScript/Docker-first systems.

---

# Problem Statement

Modern TypeScript backends (especially Docker-first systems) are difficult to reason about at scale:

- File dependencies are implicit
- Call chains span controllers → services → DB layers
- Data shapes morph through validation, mapping, serialization
- Refactors risk unintended side effects
- AI assistants lack structured minimal context

There is no unified, queryable structural representation of:

- File/module relationships
- Symbol references and call chains
- Information flow between system boundaries
- Transformations of data across layers

Code Graph aims to solve that.

---

# Core Principles

1. **Layered Graph, Not Monolithic**
   - Different abstraction levels
   - Avoid graph explosion

2. **Queries Drive Exploration**
   - Graph view visualizes query results
   - CLI-first

3. **Default = Files + Exported Symbols**
   - No local-variable explosion in v1

4. **Incremental Indexing**
   - Git-aware
   - Re-index only changed files

5. **AI Context Slicing**
   - Must support minimal context packs

6. **Bounded Scope**
   - Build something usable, not theoretical perfection

---

# Graph Layers

## View 0 – Runtime / Docker Graph

Nodes:
- Dockerfile
- docker-compose.yml
- Services
- Volumes
- Environment files

Edges:
- builds
- runs
- depends_on
- mounts
- exposes

Purpose:
Understand runtime topology and service relationships.

---

## View 1 – File Dependency Graph

Nodes:
- Files

Edges:
- imports
- aggregated symbol references

Purpose:
Architecture overview and refactor blast radius.

---

## View 2 – Symbol Graph

Nodes:
- Exported functions
- Classes
- Methods
- Types
- Constants

Edges:
- calls
- instantiates
- references
- returns_type
- accepts_type

Purpose:
Understand how logic is connected across boundaries.

---

## View 3 – Information Flow (Query-Driven)

Nodes:
- Parameters
- Return values
- Types
- Recognized sources/sinks

Edges:
- value flows to
- transforms
- writes_db
- responds_with

Purpose:
Trace how information originates, morphs, and terminates.

---

# v1 Scope

Included:

- TypeScript projects only
- File import graph
- Exported symbol graph
- Call graph (best effort)
- Recognized sinks:
  - Express/Koa handlers
  - HTTP responses
  - Kysely queries
  - Logger calls
- CLI query interface

Excluded:

- Full intra-function dataflow
- Local variable tracking
- Dynamic runtime instrumentation
- Perfect dynamic inference
- IDE plugin integration

---

# Query Model (v1)

Initial supported commands:

- `callers(symbol, depth)`
- `callees(symbol, depth)`
- `blast(symbol)`
- `trace(source, sink, depth)`
- `paths(from, to)`
- `deadExports()`
- `cycles()`

Output:

- Ranked paths
- Evidence references (file + location)
- Transform summaries (if detectable)

---

# AI Context Pack Mode

Given a query:

```
pack --from X --to Y --max-tokens 2000
```

The tool outputs:

- Minimal relevant files
- Call chain(s)
- Types involved
- Transform summaries
- Snippets with file references

Purpose:
Generate bounded, relevant context for AI-assisted reasoning.

---

# Indexing Strategy (Planned)

- TypeScript Compiler API
- Per-file symbol extraction
- Reverse reference map
- Git diff-based incremental indexing
- Local storage (SQLite or equivalent)

Database choice is implementation detail.
Graph model is conceptual first.

---

# Non-Goals

- Replace IDE navigation
- Perform security-grade taint analysis
- Support every language in v1
- Perfect modeling of dynamic behavior
- Enterprise-scale graph infrastructure

---

# Future Directions (Post v1)

- Intra-function dataflow
- Schema-aware transform tracking
- Runtime trace integration
- Graph clustering and module auto-detection
- Web-based interactive visualization
- Multi-language support

---

# Status

Early design phase.

The architecture, storage model, and CLI surface are subject to iteration.
The project is intentionally bounded to ensure a usable v1 can be delivered.

---

# License

TBD

