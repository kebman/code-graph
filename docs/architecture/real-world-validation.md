# Real-World Validation

> Project working title: Code Graph (temporary name)

Depends on:
- [project-phases.md](./project-phases.md)
- [phase-a-scope.md](./phase-a-scope.md)
- [phase-b-contract-alignment.md](./phase-b-contract-alignment.md)
- [phase-c-doc-terminology.md](./phase-c-doc-terminology.md)
- [endpoint-surface.md](./endpoint-surface.md)
- [../development/test-cases.md](../development/test-cases.md)
- [graph-model.md](./graph-model.md)
- [graph-views.md](./graph-views.md)
- [invariants.md](./invariants.md)

Status: Draft

---

# 1. Purpose

This document defines how Code Graph is validated against **real software projects**.

Synthetic examples are necessary for early development, but they are insufficient to prove the system’s value.

Real-world validation ensures that the system:

- scales to real repository complexity
- handles imperfect code organization
- produces meaningful developer insights
- solves actual engineering problems

---

# 2. Why Real-World Validation Matters

Small examples rarely expose the true problems that developers face.

Real repositories contain:

- inconsistent naming conventions
- partial type coverage
- framework-specific patterns
- evolving architecture
- documentation drift
- contract drift

A system that only works on clean examples is not considered successful.

---

# 3. Validation Philosophy

Validation follows a layered approach:

```
synthetic fixtures  
→ controlled synthetic repositories  
→ real-world repositories
```


Each layer reveals different classes of problems.

---

# 4. Required Properties

When tested against a real repository, the system must demonstrate:

```
deterministic indexing  
stable node and edge identities  
bounded graph traversal  
meaningful query results
```


Failure to maintain determinism or bounded traversal indicates architectural flaws.

---

# 5. Phase A Validation

Phase A focuses on **code structure truth**.

A real repository must confirm that the system can correctly represent:

```
file dependencies  
symbol relationships  
call graphs  
runtime configuration hints
```


Typical queries used during validation:

```
callers(symbol)  
callees(symbol)  
blast(symbol)  
paths(symbolA, symbolB)  
cycles(node)
```

These queries should produce understandable and verifiable results.

---

# 6. Endpoint Surface Validation

Phase A and early Phase B validation should confirm that the **Endpoint Surface** functions correctly.

See:

- [endpoint-surface.md](./endpoint-surface.md)

The system should be able to identify:

```
route method  
route path  
handler symbol  
handler file  
registration location
```

Optional evidence may include:

```
request validators  
DTO usage  
response sinks  
database interactions
```

Unsupported patterns must be reported rather than guessed.

---

# 7. Contract Alignment Validation

Phase B validation tests whether contract drift can be detected.

See:

- [phase-b-contract-alignment.md](./phase-b-contract-alignment.md)

The system must be able to detect:

```
missing endpoints  
phantom endpoints  
method mismatches  
path mismatches
```

Drift reports must include **evidence references**.

---

# 8. Documentation Terminology Validation

Phase C validation confirms that documentation terminology tracking works.

See:

- [phase-c-doc-terminology.md](./phase-c-doc-terminology.md)

The system should detect:

```
undefined glossary terms  
unused glossary entries  
competing synonyms
```

The system must only track explicitly defined glossary concepts.

---

# 9. Repository Characteristics

A suitable validation repository typically includes:

```
20–200 source files  
REST endpoints  
controller/service layers  
database interactions  
documentation files  
optional API contracts
```

This complexity level exposes realistic structural patterns without overwhelming early implementations.

---

# 10. Diagnostic Expectations

When indexing a real repository, the system should produce diagnostics for unsupported situations.

Examples:

```
dynamic route registration  
runtime-generated imports  
unresolvable handler references
```

Diagnostics are preferable to speculative graph edges.

---

# 11. Determinism Checks

Real-world validation must verify that repeated indexing produces identical outputs.

Required invariants:

```
node IDs remain stable  
edge IDs remain stable  
query results remain stable
```

If these properties fail, incremental indexing or normalization logic must be corrected.

---

# 12. CI Integration

Real-world validation should eventually run in automated CI environments.

CI responsibilities:

```
index repository  
validate graph invariants  
run snapshot queries  
compare outputs
```

Unexpected differences should fail the build.

---

# 13. Iterative Expansion

Real-world validation should expand gradually.

Example progression:

```
single backend service  
→ multi-service backend  
→ monorepo
```

The system should only move to more complex repositories once earlier validation succeeds.

---

# 14. Success Criteria

Real-world validation is considered successful when the system can:

```
index the repository deterministically  
extract meaningful structural relationships  
support useful engineering queries  
identify endpoint structures  
detect contract drift  
track glossary terminology
```

If developers cannot answer real engineering questions using the system, the validation has failed.

---

# 15. Summary

Real-world validation ensures that Code Graph remains grounded in practical developer needs.

Synthetic examples prove correctness.

Real repositories prove usefulness.

Both are required before the system can be considered reliable.

