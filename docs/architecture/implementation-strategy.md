# Implementation Strategy

> Project working title: Code Graph (temporary name)

Depends on:
- [architecture-overview.md](./architecture-overview.md)
- [project-phases.md](./project-phases.md)
- [phase-a-scope.md](./phase-a-scope.md)
- [graph-model.md](./graph-model.md)
- [graph-views.md](./graph-views.md)
- [indexer-architecture.md](./indexer-architecture.md)
- [query-engine-architecture.md](./query-engine-architecture.md)
- [../designs/indexer.md](../designs/indexer.md)
- [../designs/query-engine.md](../designs/query-engine.md)
- [../designs/storage.md](../designs/storage.md)

Status: Draft

---

# 1. Purpose

This document defines the **practical implementation strategy** for building Code Graph.

While architecture documents define *what the system must represent*, this document explains **how development should proceed in practice**.

The strategy emphasizes:

- incremental capability growth
- deterministic behavior
- early validation on real repositories
- minimal speculative complexity

---

# 2. Implementation Philosophy

Code Graph should be built according to four principles.

## Deterministic First

Every component must produce deterministic results.

Non-deterministic behavior introduces instability in:

- CI testing
- graph snapshots
- drift detection
- AI context packs

Determinism must be validated continuously.

---

## Evidence Over Inference

The system should only represent relationships that are supported by **static code evidence**.

The system must not:

- guess runtime behavior
- invent relationships
- infer schema transformations without explicit signals

When evidence is incomplete, the system should report diagnostics rather than fabricate graph edges.

---

## Narrow Vertical Progress

Development should proceed through **vertical slices**.

Each slice should produce a working capability:

```
index → graph → query → useful result
```

Examples of vertical slices:

- file dependency extraction
- symbol call graph
- endpoint surface extraction
- contract drift report

This approach prevents architectural layers from diverging.

---

## Real Repository Testing

Synthetic examples are insufficient.

New capabilities should be tested against real repositories early.

Real code reveals:

- inconsistent structure
- unexpected patterns
- edge cases in symbol resolution

---

# 3. Implementation Layers

The implementation consists of several cooperating layers.

```
Source Analysis  
→ Graph Construction  
→ Storage  
→ Query Engine  
→ Surfaces
```

Each layer has a clearly defined responsibility.

---

# 4. Source Analysis Layer

The source analysis layer reads code and extracts structural information.

Primary responsibilities:

- parse TypeScript source
- resolve imports
- resolve symbol references
- detect call expressions
- detect exported symbols

This layer produces **raw structural events** that are later transformed into graph nodes and edges.

---

# 5. Graph Construction Layer

The graph construction layer converts analysis results into canonical graph structures.

Responsibilities:

- create node objects
- create edge objects
- normalize identifiers
- enforce invariants
- ensure deterministic ordering

This layer implements the canonical model defined in:

- [graph-model.md](./graph-model.md)

---

# 6. Storage Layer

The storage layer persists graph data.

Responsibilities:

- store nodes
- store edges
- support efficient traversal queries
- support incremental updates

The storage layer must remain **implementation-agnostic**.

The architecture should not depend on a specific database.

See:

- [../designs/storage.md](../designs/storage.md)

---

# 7. Query Engine

The query engine provides traversal capabilities.

Responsibilities:

- implement graph traversal primitives
- enforce traversal depth limits
- aggregate evidence across nodes and edges
- provide structured query results

Examples of queries:

```
callers(symbol)  
callees(symbol)  
paths(a, b)  
blast(node)  
cycles(node)
```

See:

- [query-engine-architecture.md](./query-engine-architecture.md)

---

# 8. Surface Layer

Surfaces transform graph queries into **developer-oriented outputs**.

Examples:

- endpoint surface
- contract drift reports
- documentation terminology reports

Surfaces should not modify graph data.

They should derive their results from queries.

---

# 9. Implementation Order

The recommended development order follows the project phases.

### Phase A

Implement:

```
TypeScript source analysis  
file dependency graph  
symbol graph  
call graph  
bounded traversal queries
```

### Phase B

Add:

```
endpoint surface extraction  
contract inventory comparison  
drift report generation
```

### Phase C

Add:

```
glossary parsing  
documentation term graph  
terminology drift reports
```

---

# 10. Incremental Indexing

The indexer must support incremental updates.

Workflow:

```
detect file changes  
re-index affected files  
update nodes and edges  
preserve unchanged graph segments
```

Incremental indexing ensures the system remains usable on large repositories.

---

# 11. Diagnostics

When the system encounters unsupported patterns, it must report diagnostics.

Examples:

```
dynamic imports  
unresolvable symbols  
unsupported route registration
```

Diagnostics allow developers to understand system limitations without corrupting graph data.

---

# 12. Validation Strategy

Validation should occur continuously.

Validation methods include:

- synthetic fixtures
- structured synthetic repositories
- real-world repositories

See:

- [real-world-validation.md](./real-world-validation.md)
- [../development/test-cases.md](../development/test-cases.md)

---

# 13. Tooling

The system should provide a CLI interface.

Typical commands:

```
index  
callers  
callees  
paths  
blast  
trace
```

See:

- [../designs/cli.md](../designs/cli.md)

The CLI serves both developers and automated workflows.

---

# 14. CI Integration

Continuous integration should validate:

- graph invariants
- deterministic indexing
- query results
- regression tests

CI helps detect structural regressions early.

---

# 15. Avoiding Overengineering

Several tempting directions should be avoided early.

Examples:

- full dataflow analysis
- dynamic runtime tracing
- universal language support
- automatic documentation ontology

These features dramatically increase complexity and should only be explored after the core system proves reliable.

---

# 16. Success Criteria

The implementation strategy is successful when the system can:

- index real repositories
- construct a stable graph
- answer structural queries
- support useful developer surfaces

At that point, Code Graph becomes a practical engineering tool rather than a research experiment.

---

# 17. Summary

The implementation strategy emphasizes:

```
deterministic behavior  
incremental capability growth  
evidence-based graph construction  
real-world validation
```

Following this approach ensures the project grows in a controlled and practical way.

