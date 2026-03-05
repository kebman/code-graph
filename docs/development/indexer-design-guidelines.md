# Indexer Design Guidelines

Status: Draft

This document defines guidelines for implementing the source code indexer in the `code-graph` system.

The indexer is responsible for converting raw source code into the structured graph representation used by the rest of the system.

Because the indexer directly affects graph correctness, it must be implemented carefully and deterministically.


---

# Responsibilities of the Indexer

The indexer performs several core tasks:

- scanning source files
- parsing language constructs
- discovering symbols
- identifying relationships
- constructing graph nodes and edges

The output of the indexer must conform to the graph model defined in:

docs/architecture/graph-model.md


---

# Core Principles

The indexer should follow several important principles.


## Deterministic Behavior

The same repository indexed twice must produce the same graph.

Determinism depends on:

- canonical path normalization
- stable node identifiers
- deterministic traversal order

See:

docs/architecture/id-and-normalization.md


---

## Minimal Inference

The indexer should extract **only explicit relationships** present in the source code.

Avoid speculative inference.

Examples of acceptable extraction:

- import statements
- exported symbols
- function calls
- type instantiations

Avoid:

- guessing relationships
- analyzing runtime behavior
- speculative dependency detection


---

## Exported Symbol Focus

For v1, the indexer primarily focuses on **exported symbols**.

Reasons:

- reduces graph size
- simplifies indexing
- improves query performance

Internal symbols may be included later as the system evolves.


---

# File Processing

The indexer should process files using a predictable pipeline.

Typical workflow:

```
File Discovery  
↓  
Parsing  
↓  
Symbol Extraction  
↓  
Relationship Detection  
↓  
Graph Construction
```

Each step should produce deterministic output.


---

# File Discovery

The indexer should discover files in a stable order.

Recommended strategy:

- sort file paths lexicographically
- ignore generated files if necessary
- normalize paths before indexing

Stable file ordering is essential for deterministic graph construction.


---

# Symbol Extraction

The indexer should extract symbols such as:

- functions
- classes
- types
- modules

Symbols must receive stable identifiers.


---

# Relationship Detection

The indexer must detect relationships between symbols and files.

Examples include:

- IMPORTS
- CALLS
- REFERENCES
- INSTANTIATES

Edge types must match the definitions in:

docs/architecture/graph-model.md


---

# Graph Construction

The indexer should construct graph elements using the graph API.

Typical operations include:

- creating nodes
- creating edges
- attaching metadata

Graph invariants must always be respected.

See:

docs/architecture/invariants.md


---

# Error Handling

The indexer should handle parsing errors gracefully.

Typical strategies include:

- skipping invalid files
- recording warnings
- continuing indexing where possible

Indexer failures should not crash the entire process unless the graph becomes invalid.


---

# Incremental Indexing

v1 requires incremental indexing support aligned with the roadmap.

Possible strategies include:

- tracking file modification timestamps
- updating affected nodes only
- rebuilding impacted edges

Incremental mode in v1 should prioritize correctness and determinism over aggressive optimization.


---

# Testing the Indexer

Indexer behavior must be validated through tests.

Tests should verify:

- symbol discovery
- edge detection
- deterministic graph output

See:

docs/development/testing-philosophy.md


---

# Relationship to the Query Engine

The indexer produces the graph that the query engine consumes.

See:

docs/designs/query-engine.md
docs/architecture/query-engine-architecture.md

If the indexer produces incorrect graph structures, queries will also produce incorrect results.


---

# Long-Term Goal

The long-term goal is a reliable indexer capable of extracting structural information from large repositories.

A well-designed indexer ensures the graph remains:

- deterministic
- explainable
- useful for analysis and AI workflows.
