# Graph Validation

Status: Draft

Depends on:

- [Graph Model Specification](./graph-model.md)
- [Graph Node Kinds](./graph-node-kinds.md)
- [Graph Edge Kinds](./graph-edge-kinds.md)
- [Graph Storage Model](./graph-storage-model.md)
- [ID and Normalization Rules](./id-and-normalization.md)
- [Architectural Invariants (v1)](./invariants.md)

This document defines the validation rules that determine whether a constructed graph is valid.

Validation occurs after graph construction and before graph persistence or query execution.

The purpose of validation is to ensure that the graph satisfies all structural invariants required by the system.


---

# Scope

Validation applies to graphs produced by the indexing pipeline.

See:

[graph-build-pipeline.md](./graph-build-pipeline.md)

Validation ensures that:

- graph structure is internally consistent
- node and edge identifiers are valid
- edges reference existing nodes
- graph invariants are satisfied


---

# Validation Stages

Graph validation consists of several stages.

```
Node Validation  
↓  
Edge Validation  
↓  
Relationship Validation  
↓  
Invariant Validation
```

Each stage verifies a different class of constraints.


---

# Node Validation

Each node must satisfy the following rules.

### Unique Identifier

Every node must have a unique identifier.

Duplicate node IDs are not allowed.

### Valid Node Kind

Node kinds must match the allowed kinds defined in:

[graph-node-kinds.md](./graph-node-kinds.md)

### Required Fields

Nodes must contain required fields such as:

- id
- kind
- name

Optional metadata fields may be omitted.


---

# Edge Validation

Each edge must satisfy the following rules.

### Valid Node References

Both source and target nodes must exist.

Edges referencing missing nodes are invalid.

### Valid Edge Kind

Edge kinds must match definitions in:

[graph-edge-kinds.md](./graph-edge-kinds.md)

### Deterministic Edge ID

Edge IDs must follow deterministic generation rules.

See:

[id-and-normalization.md](./id-and-normalization.md)


---

# Relationship Validation

Relationships between node kinds must be valid.

Examples:

Valid:

```
File → IMPORTS → File  
Symbol → CALLS → Symbol  
Symbol → REFERENCES → Symbol  
Symbol → INSTANTIATES → Symbol
```

Invalid examples:

```
File → CALLS → Symbol  
Type → IMPORTS → File
```

Relationship compatibility is defined by the graph model.


---

# Duplicate Edge Detection

Duplicate edges must be avoided.

Two edges are considered duplicates if:

- source node is identical
- target node is identical
- edge kind is identical

Duplicate edges should be merged or ignored.


---

# Invariant Validation

The graph must satisfy all invariants defined in:

[invariants.md](./invariants.md)

Examples include:

- no invalid node references
- deterministic ordering
- consistent identifiers

Invariant violations should cause validation failure.


---

# Validation Failure

If validation fails, indexing should stop.

Typical responses include:

- reporting validation errors
- logging problematic nodes or edges
- aborting graph persistence

Invalid graphs must not be persisted or used by queries.


---

# Validation Output

Validation may produce a report containing:

- number of nodes
- number of edges
- detected violations
- validation status

This information can help diagnose indexing issues.


---

# Long-Term Goal

Graph validation ensures that the system operates on a consistent and reliable graph structure.

A validated graph enables:

- deterministic queries
- accurate dependency analysis
- reliable AI-assisted workflows.
