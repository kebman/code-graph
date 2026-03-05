# Implementation Roadmap

Status: Draft

This document describes the practical development sequence for implementing the `code-graph` system.

While the official delivery milestones are defined in:

```
docs/roadmaps/milestones-v1.md
```

this document focuses on **implementation order inside the repository**.


---

# Guiding Principle

The system should be implemented **from foundations upward**.

The correct development order is:

```
Graph Model  
↓  
Indexer  
↓  
Storage  
↓  
Query Engine  
↓  
CLI  
↓  
AI Context Packs
```

Each layer depends on the previous one.


---

# Phase 1 — Graph Core

Location:

```
src/graph/
```

This is the foundational layer of the system.

Responsibilities:

- node definitions
- edge definitions
- graph container
- node/edge identifiers
- normalization logic

Relevant documents:

```
docs/architecture/graph-model.md  
docs/architecture/id-and-normalization.md  
docs/architecture/invariants.md
```

Goals for this phase:

- deterministic node IDs
- deterministic edge ordering
- simple in-memory graph representation


---

# Phase 2 — Indexer

Location:

```
src/indexer/
```

The indexer converts source code into graph structures.

Responsibilities:

- scanning files
- parsing imports/exports
- symbol discovery
- building graph edges

Relevant documents:

```
docs/architecture/indexer-architecture.md  
docs/designs/indexer.md
```

Goals for this phase:

- exported symbol discovery
- import relationships
- stable indexing results


---

# Phase 3 — Storage

Location:

```
storage/
```

Storage provides persistence for graph data.

Responsibilities:

- node storage
- edge storage
- snapshot persistence
- query input data

Relevant documents:

```
docs/designs/storage.md
```

For v1 the system may start with:

- in-memory graph
- optional serialized snapshots


---

# Phase 4 — Query Engine

Location:

```
src/queries/
```

The query engine enables analysis of the graph.

Example queries:

- callers
- callees
- dependency paths
- cycle detection
- dead exports

Relevant documents:

```
docs/architecture/query-engine-architecture.md  
docs/designs/query-engine.md
```

Goals for this phase:

- deterministic traversal
- bounded-depth search
- explainable results


---

# Phase 5 — CLI

CLI commands expose system capabilities to users.

Location:

```
src/
```

Commands include:

- index
- callers
- callees
- blast
- paths
- cycles
- deadExports
- trace
- pack

Relevant documents:

```
docs/designs/cli.md
```

Goals:

- clear command structure
- machine-readable output (JSON)
- human-readable output


---

# Phase 6 — AI Context Packs

AI context packs bundle relevant code fragments for AI reasoning.

Relevant document:

```
docs/architecture/ai-context-pack.md
```

Responsibilities:

- selecting relevant nodes
- retrieving associated files/snippets
- building deterministic context bundles


---

# Development Discipline

Each phase should produce:

- working code
- tests
- documentation updates

Large features should be implemented incrementally.


---

# Example Development Timeline

Example progression of commits:

```
feat(graph): add node and edge schema  
feat(graph): implement graph container  
feat(indexer): parse imports  
feat(indexer): discover exports  
feat(query): implement callers query  
feat(cli): add index command  
feat(pack): build context pack generator
```

This progression ensures stable growth of the system.


---

# Long-Term Goal

Following this roadmap helps ensure the project evolves in a predictable way while preserving architectural guarantees.

The system should always remain:

- deterministic
- explainable
- modular

