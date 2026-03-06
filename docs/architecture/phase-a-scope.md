# Phase A Scope

> Project working title: Code Graph (temporary name)

Depends on:
- [project-phases.md](./project-phases.md)
- [graph-model.md](./graph-model.md)
- [graph-views.md](./graph-views.md)
- [invariants.md](./invariants.md)
- [indexer-architecture.md](./indexer-architecture.md)
- [query-engine-architecture.md](./query-engine-architecture.md)
- [endpoint-surface.md](./endpoint-surface.md)

Status: Draft

---

# 1. Purpose

This document defines the **explicit technical scope of Phase A**.

Phase A is the stage where Code Graph establishes **objective structural truth about code**.

The goal is to build a deterministic graph that can answer real engineering questions without speculative inference.

This document prevents scope creep during early development.

---

# 2. Phase A Objective

Phase A must prove that Code Graph can reliably construct and query a structural graph of a real TypeScript backend codebase.

The system must be able to produce:

```
file relationships  
symbol relationships  
call relationships  
runtime topology hints  
bounded flow traversal
```


This capability forms the foundation for all later phases.

---

# 3. Supported Source Language

Phase A targets:

```
TypeScript
```

JavaScript projects may work if TypeScript analysis can resolve symbols, but they are not a primary target for Phase A.

Support for additional languages is explicitly deferred.

---

# 4. Indexed Structures

Phase A indexing must capture the following canonical structures.

## 4.1 File Nodes

Each source file becomes a node.

Examples:

```
src/routes/events.ts  
src/controllers/orderController.ts  
src/services/paymentService.ts
```

Relationships include:

```
IMPORTS  
CONTAINS
```

---

## 4.2 Symbol Nodes

Exported symbols become nodes.

Examples:

```
functions  
classes  
interfaces  
types  
constants
```

Relationships include:

```
CALLS  
REFERENCES  
INSTANTIATES  
ACCEPTS_TYPE  
RETURNS_TYPE
```

Only **exported symbols** must be indexed in v1.

Local variables inside functions are not graph nodes in Phase A.

---

## 4.3 Runtime Nodes

Phase A may include runtime-level nodes where they can be extracted deterministically.

Examples:

```
Dockerfile  
Docker Compose services  
service containers
```

Relationships include:

```
BUILDS  
RUNS  
DEPENDS_ON  
MOUNTS  
EXPOSES
```

Runtime indexing remains shallow in Phase A.

---

# 5. Traversal Capabilities

The query engine must support bounded traversal operations.

Examples:

```
callers(symbol)  
callees(symbol)  
blast(symbol)  
paths(a, b)  
cycles(node)
```

Traversal must remain depth-bounded.

This prevents runaway graph exploration.

See:

- [graph-traversal-rules.md](./graph-traversal-rules.md)

---

# 6. Flow Tracing

Phase A includes **bounded inter-function flow tracing**.

This allows the system to trace information across function boundaries.

Examples:

```
handler → service → repository  
controller → database write
```

Phase A does **not include full intra-function dataflow analysis**.

Local variable transformations inside a function body are intentionally ignored.

---

# 7. Endpoint Surface Foundation

Phase A prepares the foundation for the **Endpoint Surface**.

The system must be able to:

```
identify route registration locations  
resolve handler symbols  
associate handlers with files
```

This capability allows endpoint extraction in later phases.

See:

- [endpoint-surface.md](./endpoint-surface.md)

---

# 8. Determinism Requirements

Graph construction must be deterministic.

Repeated indexing of the same repository must produce identical:

```
node IDs  
edge IDs  
ordering  
query results
```

Determinism enables:

- reliable CI testing
- graph snapshot comparison
- contract drift detection

See:

- [id-and-normalization.md](./id-and-normalization.md)

---

# 9. Incremental Indexing

Phase A must support **incremental indexing**.

When a repository changes:

- only affected files should be re-indexed
- unchanged graph segments should remain stable

Incremental indexing ensures the system remains practical for large repositories.

---

# 10. Diagnostics

When indexing cannot resolve relationships, the system must report diagnostics.

Examples:

```
unresolved import  
dynamic import pattern  
unresolved symbol reference
```

Diagnostics must never result in fabricated graph edges.

---

# 11. Out-of-Scope Features

The following features are explicitly excluded from Phase A.

```
full intra-function variable graphs  
dynamic runtime tracing  
automatic OpenAPI generation  
automatic synonym discovery in docs  
AI semantic analysis of documentation
```

These features may appear in later phases.

---

# 12. Success Criteria

Phase A is considered successful when the system can:

```
index a real TypeScript backend repository  
produce deterministic graph output  
resolve symbol relationships correctly  
support bounded traversal queries  
extract enough route information to support endpoint surfaces
```

At this point the graph becomes a reliable structural reference for developers.

---

# 13. Relationship to Later Phases

Phase A provides the base layer for later capabilities.

```
Phase A → Code truth  
Phase B → Contract alignment  
Phase C → Documentation term tracking
```

Later phases must build on Phase A rather than bypass it.

---

# 14. Summary

Phase A establishes Code Graph as a reliable representation of code structure.

The system must demonstrate:

```
deterministic indexing  
accurate structural relationships  
bounded graph traversal  
foundation for endpoint extraction
```

Once Phase A is stable, higher-level surfaces can safely be introduced.

