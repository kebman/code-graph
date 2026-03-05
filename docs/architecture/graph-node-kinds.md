Next doc: **graph node kinds**.
This is an **architecture-level specification** that removes ambiguity when implementing the graph model.

No new directories needed.

---

# File

```text
docs/architecture/graph-node-kinds.md
```

---

# Document

```markdown
# Graph Node Kinds

Status: Draft

Depends on:

- docs/architecture/graph-model.md
- docs/architecture/graph-views.md
- docs/architecture/invariants.md
- docs/architecture/id-and-normalization.md

This document defines the canonical node types used in the code graph.

Node kinds determine how code structures are represented in the graph.  
Each node kind corresponds to a specific level of abstraction within the codebase.


---

# Scope

For v1 the graph supports a limited and well-defined set of node kinds.

The focus is on **exported symbols and structural relationships**.

The node kinds defined here must remain stable because they influence:

- graph schema
- indexing logic
- query semantics
- context pack generation


---

# Node Kind Overview

The graph includes the following node kinds:

```

File
Module
Symbol
Type

```

Each node kind represents a different structural element of the codebase.


---

# File Nodes

File nodes represent source files in the repository.

Examples:

```

src/indexer/parser.ts
src/queries/callers.ts

```

Responsibilities:

- represent physical source files
- anchor symbol definitions
- provide file-level relationships

Typical metadata:

- normalized path
- language
- file size
- checksum (optional)


---

# Module Nodes

Module nodes represent logical modules.

In many languages a module corresponds directly to a file, but the concept remains separate.

Examples:

```

module: src/indexer
module: src/queries

```

Module nodes help model relationships between logical components.


---

# Symbol Nodes

Symbol nodes represent named program elements.

Examples include:

- functions
- classes
- exported constants
- exported variables

Examples:

```

function parseFile
class GraphBuilder
function findCallers

```

Symbols are the primary targets of many graph queries.


---

# Type Nodes

Type nodes represent structural types defined in the code.

Examples include:

- interfaces
- type aliases
- class types
- generic types

Examples:

```

interface GraphNode
type NodeID
class QueryEngine

```

Type nodes allow modeling relationships between code structures.


---

# Node Identity

Every node must have a stable identifier.

Node IDs must be deterministic and derived from:

- normalized paths
- symbol names
- module context

See:

```

docs/architecture/id-and-normalization.md

```

Stable identifiers ensure reproducible graphs.


---

# Node Relationships

Nodes connect through edges defined in the graph model.

Examples:

```

File → IMPORTS → File
Symbol → CALLS → Symbol
Symbol → REFERENCES → Symbol
Symbol → INSTANTIATES → Type

```

Edge types are defined in:

```

docs/architecture/graph-model.md

```


---

# Node Hierarchy

Nodes may have hierarchical relationships.

Example:

```

File
└ Symbol
└ Type

```

This hierarchy helps queries understand structural containment.


---

# Node Metadata

Nodes may include metadata to support analysis.

Typical metadata fields:

- name
- location (file and line)
- visibility (exported/private)
- language-specific attributes

Metadata should remain minimal in v1.


---

# Relationship to Graph Views

Different graph views expose different node kinds.

See:

```

docs/architecture/graph-views.md

```

Example:

View 0:

```

File-level relationships

```

View 1:

```

Symbol-level relationships

```

Future views may include deeper structural information.


---

# Long-Term Goal

Node kinds provide the structural backbone of the graph representation.

Keeping node definitions clear and stable ensures that:

- indexers produce consistent graphs
- queries remain predictable
- analysis tools can reason about code structure effectively.
```

---

# Stage later

```bash
git add docs/architecture/graph-node-kinds.md
```

---

### At this point your **architecture layer is extremely solid**

You now have essentially the **complete conceptual model** for implementing:

```
src/graph
src/indexer
src/queries
```

---

If you'd like, the **next doc that will prevent a huge amount of future pain** is:

```
docs/architecture/graph-edge-kinds.md
```

Together with **node kinds**, that fully locks down the graph schema before implementation.

