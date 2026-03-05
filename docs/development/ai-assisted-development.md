# AI-Assisted Development

Status: Draft

This document explains how the `code-graph` system supports AI-assisted development workflows.

The project is designed to enable deterministic and explainable interactions between large language models (LLMs) and source code repositories.

Rather than relying on raw file scanning, the system builds a **structured graph representation of the codebase** that AI tools can query.


---

# Motivation

Traditional AI coding workflows rely on:

- keyword search
- naive file scanning
- large context windows
- heuristic code selection

These approaches often produce:

- missing dependencies
- incomplete reasoning
- non-deterministic outputs
- hallucinated relationships

The `code-graph` system addresses these issues by providing a **deterministic code knowledge layer**.

AI systems can query the graph to retrieve relevant code structures.


---

# Core Idea

The workflow consists of four major stages.

```
Source Code  
↓  
Indexer  
↓  
Code Graph  
↓  
Query Engine  
↓  
AI Context Pack  
↓  
LLM Reasoning
```

Each stage is defined by architecture and design documents.


---

# Stage 1 — Indexing

The **indexer** converts source code into a structured graph.

See:

```
docs/architecture/indexer-architecture.md  
docs/designs/indexer.md
```

The indexer extracts:

- files
- modules
- symbols
- types
- relationships

Examples of relationships:

- imports
- function calls
- symbol references
- type instantiations

The output is a **deterministic graph model** defined in:

```
docs/architecture/graph-model.md
```


---

# Stage 2 — Graph Representation

The graph contains nodes and edges representing the structure of the codebase.

Examples:

Nodes:

- File
- Symbol
- Type
- Runtime
- Sink

Edges:

- IMPORTS
- CALLS
- REFERENCES
- INSTANTIATES

The graph model is described in:

```
docs/architecture/graph-model.md  
docs/architecture/invariants.md
```

The graph is the central knowledge representation used by the system.


---

# Stage 3 — Query Engine

The query engine allows structured exploration of the graph.

Examples of queries:

- callers
- callees
- dependency paths
- blast radius
- cycles
- dead exports

See:

```
docs/designs/query-engine.md  
docs/architecture/query-engine-architecture.md
```

Queries return deterministic results that can be used for analysis or AI workflows.


---

# Stage 4 — AI Context Packs

AI systems do not directly read the entire repository.

Instead, the system generates **context packs**.

A context pack is a curated bundle of relevant code snippets selected using graph queries.

See:

```
docs/architecture/ai-context-pack.md
```

Context packs include:

- relevant files
- dependency context
- symbol definitions
- supporting evidence


---

# Benefits

Using a graph-based system provides several advantages for AI tools.

### Deterministic selection

Context is selected based on graph relationships rather than heuristics.

### Explainable reasoning

Every selected file or snippet can be traced back to a graph query.

### Smaller context windows

Only relevant code is included in the AI prompt.

### Reduced hallucination

AI models operate on verified code relationships.


---

# Example Workflow

Example developer workflow using the system.

1. Developer asks AI to analyze a function
2. AI queries the graph for dependencies
3. System builds a context pack
4. AI receives relevant code snippets
5. AI produces analysis or suggestions

This workflow ensures the AI operates with **structured and explainable context**.


---

# Relationship to Repository Structure

Relevant subsystems in the repository:

```
src/indexer  
src/graph  
src/queries
```

These components implement the graph indexing and query engine.


---

# Long-Term Vision

The long-term goal of the project is to provide a reusable infrastructure layer for:

- AI-assisted code analysis
- dependency reasoning
- architecture exploration
- automated refactoring support

The graph model allows AI systems to reason about software structure rather than raw text.
