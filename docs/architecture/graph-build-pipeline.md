# Graph Build Pipeline

Status: Draft

Depends on:

- docs/architecture/graph-model.md
- docs/architecture/graph-node-kinds.md
- docs/architecture/graph-edge-kinds.md
- docs/architecture/graph-storage-model.md
- docs/architecture/id-and-normalization.md
- docs/architecture/invariants.md
- docs/architecture/indexer-architecture.md
- docs/designs/indexer.md
- docs/designs/storage.md

This document defines the pipeline used to construct the code graph from a source repository.

The graph build pipeline describes the sequence of operations that transform source code into graph nodes and edges stored in the graph storage system.


---

# Scope

The pipeline applies to the v1 indexing process.

The pipeline includes:

- repository scanning
- file parsing
- symbol discovery
- relationship detection
- graph construction
- graph persistence

The pipeline must remain deterministic.


---

# Pipeline Overview

The indexing process follows this sequence:

```
Repository Scan  
↓  
File Discovery  
↓  
File Parsing  
↓  
Symbol Extraction  
↓  
Relationship Detection  
↓  
Node Construction  
↓  
Edge Construction  
↓  
Graph Validation  
↓  
Graph Persistence
```


---

# Step 1 — Repository Scan

The indexer begins by scanning the repository.

Responsibilities:

- identify source directories
- exclude ignored paths
- normalize file paths

All paths must follow normalization rules defined in:

docs/architecture/id-and-normalization.md


---

# Step 2 — File Discovery

Files are discovered and sorted.

Requirements:

- deterministic ordering
- consistent path normalization
- exclusion of unsupported files

Typical sorting strategy:

```
lexicographic path ordering
```


---

# Step 3 — File Parsing

Each file is parsed using language-specific parsers.

Responsibilities:

- construct syntax trees
- identify import statements
- detect symbol definitions

Parsing errors should not terminate the indexing process unless graph integrity is compromised.


---

# Step 4 — Symbol Extraction

The parser identifies program symbols.

Examples include:

- functions
- classes
- exported variables
- types

Each discovered symbol will become a **Symbol node**.

See:

docs/architecture/graph-node-kinds.md


---

# Step 5 — Relationship Detection

The indexer detects relationships between program elements.

Examples:

- import relationships
- function calls
- symbol references
- type instantiations

Each relationship will later become an edge.

See:

docs/architecture/graph-edge-kinds.md


---

# Step 6 — Node Construction

Nodes are created for all discovered entities.

Examples:

```
File nodes  
Symbol nodes  
Type nodes
```

Nodes must follow deterministic ID generation.

See:

docs/architecture/id-and-normalization.md


---

# Step 7 — Edge Construction

Edges represent relationships between nodes.

Examples:

```
IMPORTS  
CALLS  
REFERENCES  
INSTANTIATES  
CONTAINS
```

Edges must connect valid nodes and respect graph invariants.

See:

docs/architecture/invariants.md


---

# Step 8 — Graph Validation

Before persistence the graph must be validated.

Validation checks include:

- node ID uniqueness
- valid edge references
- edge type compatibility
- invariant compliance

If validation fails, indexing should abort.


---

# Step 9 — Graph Persistence

After validation the graph is persisted.

Possible storage strategies include:

- relational tables
- serialized files
- embedded databases

See:

docs/architecture/graph-storage-model.md


---

# Determinism Guarantees

The pipeline must ensure deterministic graph construction.

Key mechanisms include:

- stable file ordering
- canonical node identifiers
- deterministic edge ordering
- reproducible parsing behavior

Determinism is essential for:

- reliable testing
- reproducible queries
- consistent AI context generation


---

# Relationship to Query Engine

Once the graph is built, the query engine operates on the resulting graph.

See:

docs/architecture/query-engine-architecture.md
docs/designs/query-engine.md


---

# Future Extensions

Future versions may extend the pipeline with:

- incremental indexing
- parallel parsing
- language plugins

These features must preserve deterministic graph construction.


---

# Long-Term Goal

The graph build pipeline provides a clear and deterministic process for transforming source code into a structured graph representation.

A well-defined pipeline ensures:

- predictable indexing behavior
- reliable graph construction
- stable foundations for query analysis and AI-assisted development.
