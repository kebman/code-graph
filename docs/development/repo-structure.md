# Repository Structure

Status: Draft

This document explains the repository layout and the responsibilities of each top-level directory.

The goal is to keep the project:

- easy to navigate
- aligned with architecture documents
- resistant to structural drift

All contributors should follow this layout unless an architecture decision changes it.


---

# Top-Level Structure

```
docs/  
src/  
storage/  
tools/  
README.md  
.gitignore
```

Each directory has a specific responsibility.


---

# docs/

The `docs/` directory contains **all project documentation**.

Subdirectories:

```
docs/  
architecture/  
designs/  
roadmaps/  
development/
```

### architecture/

Defines the **system architecture and conceptual model**.

Examples:

- graph-model
- graph views
- invariants
- indexer architecture
- query engine architecture

These documents define **what the system must guarantee**.

Architecture documents are the highest-level technical specification.


---

### designs/

Design documents explain **how architecture is implemented**.

Examples:

- indexer design
- query engine design
- CLI design
- storage design
- output formats

Design documents translate architecture requirements into implementation strategy.


---

### roadmaps/

Roadmaps define **project milestones and execution phases**.

Examples:

- roadmap-v1
- milestones-v1

These documents describe delivery order and exit criteria.


---

### development/

Development documentation describes **project conventions and contributor guidance**.

Examples:

- git commit conventions
- repository structure

These documents help maintain consistency across contributors and tooling.


---

# src/

The `src/` directory contains the actual implementation.

Current structure:

```
src/  
di/  
graph/  
indexer/  
queries/
```

Responsibilities:

### graph/

Core graph model implementation.

Includes:

- node definitions
- edge definitions
- graph storage interfaces
- graph utilities

This layer represents the **core data model of the system**.


---

### indexer/

Source code analysis and graph construction.

Responsibilities:

- parsing source files
- discovering symbols
- extracting imports/exports
- building graph nodes and edges

The indexer converts source code into the graph model.


---

### queries/

Graph query engine.

Responsibilities:

- callers / callees queries
- dependency traversal
- blast radius analysis
- cycle detection
- dead export detection

The query layer operates on the graph produced by the indexer.


---

### di/

Dependency injection and service wiring.

Responsibilities:

- configuration
- service composition
- module wiring

This layer connects indexer, graph storage, and query services.


---

# storage/

The `storage/` directory contains persistence infrastructure.

Examples may include:

- graph snapshots
- test fixtures
- local development data

Storage implementation details are defined in:

```
docs/designs/storage.md
```


---

# tools/

Utility scripts used during development.

Example:

```
tools/tree.sh
```

Typical tools include:

- repository inspection
- indexing utilities
- developer helpers

Tools must remain lightweight and optional.


---

# Structural Principles

The repository follows several design principles.

### Clear architectural separation

```
docs → specification  
src → implementation
```

Documentation drives implementation.


---

### Stable subsystem boundaries

Major subsystems are reflected in both documentation and source layout:

```
graph  
indexer  
queries
```

These boundaries should remain stable.


---

### Implementation follows architecture

Architecture documents define:

- graph model
- invariants
- system guarantees

Implementation must conform to these documents.


---

# When to Change the Structure

Repository structure should only change when:

- architecture changes
- subsystem boundaries change
- major implementation requirements emerge

Any structural change should update this document.


---

# Related Documents

Architecture:

```
docs/architecture/architecture-overview.md  
docs/architecture/graph-model.md  
docs/architecture/invariants.md
```

Designs:

```
docs/designs/indexer.md  
docs/designs/query-engine.md  
docs/designs/storage.md
```

