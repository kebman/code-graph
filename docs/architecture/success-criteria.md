# Success Criteria

> Project working title: Code Graph (temporary name)

Depends on:
- [project-phases.md](./project-phases.md)
- [graph-model.md](./graph-model.md)
- [graph-views.md](./graph-views.md)
- [invariants.md](./invariants.md)
- [real-world-validation.md](./real-world-validation.md)

Status: Draft

---

# 1. Purpose

This document defines **how success is measured for Code Graph**.

Without explicit success criteria, a system can appear complete while still failing to solve real problems.

These criteria define the conditions under which the system can be considered:

```
functionally correct  
architecturally sound  
practically useful
```

Success must be demonstrated through **objective validation**, not subjective impressions.

---

# 2. Categories of Success

The system must succeed in four dimensions:

```
1. Structural correctness
2. Deterministic behavior
3. Practical developer value
4. Controlled architectural growth
```

Each dimension must be satisfied.

---

# 3. Structural Correctness

The graph must correctly represent code structure.

This includes accurate modeling of:

```
file relationships  
symbol relationships  
call relationships  
runtime topology hints
```

Queries such as:

```
callers(symbol)  
callees(symbol)  
paths(a, b)  
cycles(node)
```

must produce results that match the actual codebase.

Incorrect structural representation invalidates all higher-level analysis.

---

# 4. Deterministic Behavior

Repeated indexing of the same repository must produce identical outputs.

Determinism applies to:

```
node identifiers  
edge identifiers  
graph ordering  
query results
```

Determinism enables:

- reproducible analysis
- CI validation
- drift detection
- stable context packs for AI tooling

If determinism cannot be maintained, the system cannot be trusted.

---

# 5. Bounded Complexity

Graph traversal must remain bounded.

The system must prevent:

```
unbounded recursive traversal  
excessive graph expansion  
uncontrolled query runtime
```

Traversal limits must be enforced as defined in:

- [graph-traversal-rules.md](./graph-traversal-rules.md)

This ensures the system remains usable on large repositories.

---

# 6. Phase A Success Criteria

Phase A focuses on **code structure truth**.

Phase A is considered successful when the system can:

```
index a real TypeScript backend  
construct a stable graph  
resolve symbol relationships correctly  
support bounded traversal queries  
identify route registration and handler relationships
```

At this point, the graph becomes a reliable structural reference.

---

# 7. Phase B Success Criteria

Phase B focuses on **contract drift detection**.

Phase B succeeds when the system can:

```
extract endpoint inventory from code  
parse contract specifications  
compare endpoint inventories  
generate accurate drift reports
```

Drift classes must include:

```
missing endpoints  
phantom endpoints  
method mismatches  
path mismatches
```

Reports must include verifiable evidence references.

---

# 8. Phase C Success Criteria

Phase C focuses on **documentation terminology tracking**.

Phase C succeeds when the system can:

```
parse glossary definitions  
detect glossary term mentions  
identify undefined terms  
detect unused glossary entries  
track alias mappings
```

Terminology tracking must remain deterministic and bounded.

---

# 9. Real-World Validation

The system must demonstrate success on real repositories.

Validation must confirm that the system can:

```
index real codebases deterministically  
extract meaningful structural relationships  
identify endpoint surfaces  
detect contract drift  
track glossary terminology
```

See:

- [real-world-validation.md](./real-world-validation.md)

If the system fails on real repositories, architectural assumptions must be revisited.

---

# 10. Developer Value

A system that is technically correct but not useful is still a failure.

Developers must be able to answer questions such as:

```
what calls this function?  
which files depend on this module?  
which endpoints reach this service?  
where does this request eventually write data?
```

The system must make these questions easier to answer than manual code exploration.

---

# 11. Maintainability

The project must remain maintainable.

Indicators of maintainability include:

```
clear architecture documentation  
consistent terminology  
deterministic graph behavior  
bounded feature scope
```

Uncontrolled complexity growth indicates architectural failure.

---

# 12. Non-Goals

The following capabilities are **not required for success**:

```
full runtime tracing  
complete semantic understanding of documentation  
perfect schema inference  
universal language support
```

Attempting to achieve these goals prematurely would introduce unnecessary complexity.

---

# 13. Failure Indicators

The system should be reconsidered if any of the following occur:

```
graph output becomes non-deterministic  
graph traversal becomes unbounded  
real repositories cannot be indexed  
surfaces rely on speculative inference
```

These indicators suggest architectural drift.

---

# 14. Iterative Improvement

Success does not mean the system is complete.

Instead, success means the core architecture has proven itself.

Once this foundation exists, additional surfaces and analyses can be introduced safely.

---

# 15. Summary

Code Graph is successful when it can reliably provide **objective structural insight into real codebases**.

The system must demonstrate:

```
correct graph modeling  
deterministic behavior  
bounded traversal  
real developer usefulness
```

If these conditions are met, the system fulfills its intended purpose.
