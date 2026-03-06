# Operational Workflows

> Project working title: Code Graph (temporary name)

Depends on:
- [implementation-strategy.md](./implementation-strategy.md)
- [observability.md](./observability.md)
- [real-world-validation.md](./real-world-validation.md)
- [graph-coverage.md](./graph-coverage.md)
- [query-engine-architecture.md](./query-engine-architecture.md)

Status: Draft

---

# 1. Purpose

This document describes **typical operational workflows** for using Code Graph.

Operational workflows explain **how developers interact with the system during real development work**.

These workflows demonstrate how the graph supports tasks such as:

```
understanding unfamiliar code  
debugging structural issues  
tracing information flow  
detecting contract drift
```

The goal is to make the system practical for everyday engineering use.

---

# 2. Basic Workflow

The most common workflow follows three steps:

```
index repository  
run structural queries  
investigate results
```

Example sequence:

```
index  
blast src/services/paymentService.ts  
callers processPayment  
paths validateOrder writeInvoice
```

This allows developers to quickly explore structural relationships.

---

# 3. Repository Indexing Workflow

Indexing builds the graph representation of a repository.

Typical process:

```
run index command  
analyze indexing diagnostics  
review coverage report
```

Example:

```
index  
coverage  
diagnostics
```

If indexing reports unresolved patterns, developers can investigate before relying on graph queries.

---

# 4. Code Exploration Workflow

When encountering unfamiliar code, developers often want to understand dependencies.

Example workflow:

```
blast targetFile
```

This query reveals:

```
files that depend on the target  
files the target depends on
```

Developers can then drill deeper using symbol-level queries.

---

# 5. Function Investigation Workflow

When debugging behavior, developers often want to trace function relationships.

Example:

```
callers processPayment  
callees processPayment
```

This reveals:

```
who calls the function  
what the function calls
```

This workflow helps identify unexpected dependencies.

---

# 6. Information Flow Workflow

Sometimes developers want to understand how information moves through the system.

Example:

```
paths requestValidator writeInvoice
```

This reveals structural paths between two symbols.

These paths may represent:

```
data transformation chains  
service boundaries  
database writes
```

---

# 7. Endpoint Investigation Workflow

When working with backend services, developers often investigate HTTP endpoints.

Example workflow:

```
endpoints  
blast handlerSymbol
```

This reveals:

```
registered endpoints  
handler functions  
downstream dependencies
```

This workflow is particularly useful when diagnosing API behavior.

---

# 8. Contract Alignment Workflow

In projects that use API specifications, developers may compare code endpoints with contract definitions.

Example workflow:

```
extract endpoint inventory  
compare with OpenAPI contract  
generate drift report
```

Drift categories may include:

```
missing endpoints  
phantom endpoints  
method mismatches  
path mismatches
```

This workflow helps ensure that implementation and contract remain aligned.

---

# 9. Documentation Terminology Workflow

Documentation drift can also be investigated.

Example workflow:

```
scan glossary  
detect undefined terms  
detect unused glossary entries
```

Example output:

```
Undefined term: Service Boundary  
Unused glossary entry: Execution Domain
```

This workflow helps maintain consistent project terminology.

---

# 10. Graph Diagnostics Workflow

When queries produce unexpected results, developers may inspect graph diagnostics.

Example commands:

```
graph stats  
coverage  
diagnostics
```

This reveals potential issues such as:

```
unresolved symbol references  
unsupported patterns  
coverage gaps
```

---

# 11. Continuous Integration Workflow

Code Graph can be integrated into CI pipelines.

Typical CI workflow:

```
index repository  
validate graph invariants  
run regression queries  
check coverage thresholds
```

Example CI checks:

```
no invariant violations  
deterministic indexing  
stable query outputs
```

This ensures structural integrity remains stable over time.

---

# 12. Architectural Investigation Workflow

In larger systems, developers may use the graph to study architectural structure.

Example questions:

```
which services depend on this module?  
which components call this subsystem?  
which endpoints write to this database?
```

Queries such as `blast` and `paths` can reveal these relationships.

---

# 13. AI Context Workflow

AI-assisted development can benefit from graph queries.

Example workflow:

```
identify relevant symbols  
trace structural relationships  
build context pack
```

This allows AI tools to receive **precisely targeted structural context** instead of scanning entire repositories.

---

# 14. Investigating Structural Drift

Over time, architecture may degrade.

Graph queries can reveal signals such as:

```
growing dependency fan-out  
new cyclic dependencies  
unexpected call chains
```

These signals help maintain architectural health.

---

# 15. Summary

Operational workflows demonstrate how Code Graph supports real engineering tasks.

By combining indexing, traversal queries, and diagnostics, developers can:

```
understand complex systems  
trace information flow  
detect contract drift  
maintain documentation consistency
```

These workflows illustrate the practical value of the Code Graph system.
