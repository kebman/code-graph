# Observability

> Project working title: Code Graph (temporary name)

Depends on:
- [implementation-strategy.md](./implementation-strategy.md)
- [real-world-validation.md](./real-world-validation.md)
- [graph-coverage.md](./graph-coverage.md)
- [success-criteria.md](./success-criteria.md)

Status: Draft

---

# 1. Purpose

This document defines **observability mechanisms** for Code Graph.

Observability allows developers to understand:

```
what the indexer is doing  
what the graph contains  
where failures occur  
how coverage evolves
```

Without observability, debugging the system becomes extremely difficult.

---

# 2. Observability Layers

Observability exists at several levels:

```
indexing observability  
graph integrity observability  
query execution observability  
coverage observability
```

Each layer provides different diagnostic signals.

---

# 3. Indexing Observability

The indexing pipeline should report:

```
files indexed  
symbols discovered  
edges created  
diagnostics generated
```

Example output:

```
Indexed files: 128  
Symbols discovered: 4,212  
Edges created: 7,943  
Diagnostics: 12
```

These signals help developers detect indexing problems.

---

# 4. Graph Integrity Observability

The system must continuously verify graph invariants.

Examples:

```
no orphan edges  
valid node identifiers  
consistent edge endpoints
```

Violations should produce clear diagnostics.

See:

- `invariants.md`

---

# 5. Query Observability

Query execution should expose metrics such as:

```
nodes visited  
edges traversed  
query execution time
```

Example output:

```
Traversal depth: 4  
Nodes visited: 112  
Edges traversed: 284  
Execution time: 18ms
```

This helps detect pathological queries.

---

# 6. Coverage Observability

Coverage metrics should be observable during indexing.

Examples:

```
files indexed / total files  
symbols indexed / estimated symbols  
calls resolved / call expressions
```

See:

- `graph-coverage.md`

---

# 7. Diagnostic Reporting

Diagnostics should report unsupported patterns.

Examples:

```
dynamic import detected  
unresolved symbol reference  
unsupported routing pattern
```

Diagnostics must always include:

```
file  
location  
reason
```

---

# 8. CLI Observability

The CLI should provide commands for inspecting system state.

Possible commands:

```
graph stats  
index diagnostics  
coverage report
```

These commands provide transparency into system behavior.

---

# 9. CI Observability

CI environments should collect observability signals such as:

```
indexing success/failure  
graph invariant validation  
query regression tests  
coverage metrics
```

Unexpected changes should trigger investigation.

---

# 10. Summary

Observability ensures that the system remains transparent and debuggable.

It allows developers to understand:

```
what the graph contains  
how the indexer behaves  
where limitations exist
```

A system without observability quickly becomes impossible to maintain.

