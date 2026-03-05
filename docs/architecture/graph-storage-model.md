# Graph Storage Model

Status: Draft

Depends on:

- docs/architecture/graph-model.md
- docs/architecture/graph-node-kinds.md
- docs/architecture/graph-edge-kinds.md
- docs/architecture/id-and-normalization.md
- docs/architecture/invariants.md
- docs/designs/storage.md

This document defines the storage representation used for the code graph.

The storage model specifies how nodes and edges are persisted in a deterministic and queryable structure.


---

# Scope

For v1 the graph storage model is intentionally simple.

The system stores graph data using two primary collections:

```
nodes  
edges
```

This structure is storage-neutral and can be implemented using:

- relational databases
- embedded databases
- serialized files

The architecture does **not require a graph-native database**.


---

# Nodes Table

Nodes represent entities in the codebase.

Typical schema:

```
## nodes

id TEXT PRIMARY KEY  
kind TEXT  
name TEXT  
file_path TEXT  
metadata JSON (optional)
```

Field descriptions:

| Field | Description |
|------|-------------|
| id | deterministic node identifier |
| kind | node kind (File, Symbol, Type, Runtime, Sink) |
| name | human-readable name |
| file_path | normalized file path (if applicable) |
| metadata | optional structured metadata |

Node identifiers must follow the normalization rules defined in:

```
docs/architecture/id-and-normalization.md
```


---

# Edges Table

Edges represent relationships between nodes.

Typical schema:

```
## edges

id TEXT PRIMARY KEY  
from_id TEXT  
to_id TEXT  
kind TEXT  
metadata JSON (optional)
```

Field descriptions:

| Field | Description |
|------|-------------|
| id | deterministic edge identifier |
| from_id | source node identifier |
| to_id | target node identifier |
| kind | edge kind |
| metadata | optional relationship metadata |

Edge kinds must match definitions in:

```
docs/architecture/graph-edge-kinds.md
```


---

# Deterministic Edge IDs

Edge IDs should be derived from:

```
from_id + edge_kind + to_id
```

This ensures:

- deterministic graph structure
- duplicate edge prevention
- stable storage behavior


---

# Required Indexes

To support efficient queries the following indexes are recommended.

```
index_edges_from  
index_edges_to  
index_nodes_kind  
index_edges_kind
```

Example relational representation:

```
CREATE INDEX idx_edges_from ON edges(from_id);  
CREATE INDEX idx_edges_to ON edges(to_id);  
CREATE INDEX idx_edges_kind ON edges(kind);  
CREATE INDEX idx_nodes_kind ON nodes(kind);
```


---

# Graph Snapshots

Graph state may optionally be stored as snapshots.

Snapshots allow:

- faster startup
- reproducible analysis
- testing fixtures

Snapshots may include:

```
nodes.json  
edges.json
```

or equivalent serialized formats.


---

# Incremental Updates

v1 requires incremental indexing support aligned with the roadmap.

Possible strategies include:

- updating affected nodes
- recalculating impacted edges
- partial graph rebuilds

The storage model must support incremental updates without violating determinism.


---

# Relationship to Query Engine

The query engine reads graph data from storage.

See:

```
docs/architecture/query-engine-architecture.md  
docs/designs/query-engine.md
```

Queries must operate on the storage model defined here.


---

# Relationship to Indexer

The indexer writes graph nodes and edges.

See:

```
docs/architecture/indexer-architecture.md  
docs/designs/indexer.md
```

The indexer must generate nodes and edges that conform to this schema.


---

# Storage Flexibility

The architecture deliberately avoids locking the system into a specific storage engine.

Possible implementations include:

- SQLite
- PostgreSQL
- embedded key-value stores
- in-memory graph structures

The schema defined here remains consistent across implementations.


---

# Long-Term Goal

The storage model provides a stable foundation for representing code graphs.

Keeping the schema simple ensures that:

- indexing remains deterministic
- queries remain efficient
- the system remains easy to deploy.
