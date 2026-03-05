# Graph Edge Kinds

Status: Draft

Depends on:

- docs/architecture/graph-model.md
- docs/architecture/graph-node-kinds.md
- docs/architecture/graph-views.md
- docs/architecture/invariants.md
- docs/architecture/edge-explanations.md

This document defines the canonical edge types used in the code graph.

Edges represent relationships between nodes. These relationships describe how files, modules, symbols, and types interact within a codebase.


---

# Scope

For v1 the graph supports a limited and explicit set of edge kinds.

The goal is to capture **structural relationships visible in source code** without performing speculative inference.

Edge definitions must remain stable because they affect:

- indexer behavior
- graph storage
- query semantics
- AI context pack generation


---

# Edge Kind Overview

The graph includes the following edge kinds:

```
IMPORTS  
CALLS  
REFERENCES  
INSTANTIATES  
AGGREGATED_REFERENCE
```

Each edge kind represents a specific category of relationship.


---

# IMPORTS

Represents file or module dependencies created by import statements.

Example:

```
file A IMPORTS file B
```

Typical sources:

- ES module imports
- CommonJS require statements
- language module imports

Purpose:

- construct dependency graphs
- support module-level analysis
- detect dependency cycles


---

# CALLS

Represents a function or method invocation.

Example:

```
symbol A CALLS symbol B
```

Typical sources:

- function calls
- method calls
- static method invocations

Purpose:

- enable caller/callee queries
- analyze execution flow
- detect indirect dependencies


---

# REFERENCES

Represents usage of a symbol without invoking it.

Example:

```
symbol A REFERENCES symbol B
```

Typical cases:

- variable access
- constant usage
- type references

Purpose:

- identify usage relationships
- support dead-code detection
- trace symbol dependencies


---

# INSTANTIATES

Represents creation of a type instance.

Example:

```
symbol A INSTANTIATES type B
```

Typical cases:

- class instantiation
- constructor invocation
- generic type instantiation

Purpose:

- track object creation
- understand type usage


---

# AGGREGATED_REFERENCE

Represents an aggregated relationship derived from lower-level symbol relationships.

Example:

```
file A AGGREGATED_REFERENCE file B
```

This edge summarizes multiple symbol-level relationships between two files.

Purpose:

- simplify file-level graphs
- support View 0 representations
- improve query performance


---

# Edge Direction

Edges are directional.

Example:

```
A CALLS B
```

does **not imply**

```
B CALLS A
```

Queries may traverse edges in either direction depending on the analysis.


---

# Edge Metadata

Edges may include metadata describing the relationship.

Typical metadata fields:

- source location
- target location
- language construct
- reference type

Metadata should remain minimal in v1.


---

# Edge Identity

Edges must have deterministic identifiers.

Edge IDs should be derived from:

- source node ID
- edge type
- target node ID

Ordering must remain deterministic.

See:

docs/architecture/id-and-normalization.md


---

# Relationship to Graph Views

Different graph views expose different edge kinds.

Example:

View 0:

```
File IMPORTS File  
File AGGREGATED_REFERENCE File
```

View 1:

```
Symbol CALLS Symbol  
Symbol REFERENCES Symbol  
Symbol INSTANTIATES Type
```

See:

docs/architecture/graph-views.md


---

# Edge Constraints

Edges must respect graph invariants.

Examples:

- edges must reference valid nodes
- edge types must match node kinds
- duplicate edges should be avoided

See:

docs/architecture/invariants.md


---

# Relationship to Indexer

The indexer is responsible for detecting relationships and creating edges.

See:

docs/designs/indexer.md
docs/architecture/indexer-architecture.md

Edge definitions here guide indexer implementation.


---

# Long-Term Goal

Edge kinds provide the structural relationships necessary to analyze codebases.

Stable edge definitions ensure that:

- queries remain consistent
- graph traversal behaves predictably
- AI-assisted workflows remain explainable.

