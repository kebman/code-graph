# Limitations and Non-Goals

> Project working title: Code Graph (temporary name)

Depends on:
- [architecture-overview.md](./architecture-overview.md)
- [project-phases.md](./project-phases.md)
- [graph-model.md](./graph-model.md)
- [graph-views.md](./graph-views.md)
- [query-engine-architecture.md](./query-engine-architecture.md)
- [implementation-strategy.md](./implementation-strategy.md)

Status: Draft

---

# 1. Purpose

This document defines the **intentional limitations and non-goals** of Code Graph.

The purpose is to prevent the system from expanding into an unbounded research project.

A large number of technically possible capabilities exist, but many of them would introduce excessive complexity without improving the system’s core mission.

Explicitly defining non-goals ensures the architecture remains focused and stable.

---

# 2. Core Mission

Code Graph exists to provide **objective structural insight into codebases**.

Its focus is on:

```
static code structure  
symbol relationships  
information flow surfaces  
contract alignment  
documentation terminology stability
```

Any capability that does not directly support these goals should be treated cautiously.

---

# 3. Static Analysis Scope

Code Graph is a **static analysis system**.

It operates on:

```
source files  
configuration files  
documentation
```

It does **not** execute code.

As a result, it cannot observe runtime behavior.

---

# 4. Dynamic Runtime Behavior (Non-Goal)

The system will not attempt to fully model runtime execution.

Examples of unsupported analysis:

```
runtime reflection  
dynamic module loading  
runtime-generated routes  
runtime code generation
```

These behaviors are inherently difficult to analyze statically and often require instrumentation or runtime tracing.

The system may record **diagnostics** when such patterns are detected.

---

# 5. Full Dataflow Analysis (Non-Goal)

Complete dataflow analysis across arbitrary code paths is outside the scope of the project.

Examples of excluded capabilities:

```
tracking every variable transformation  
symbolic execution  
automatic schema derivation  
complete type propagation across layers
```

These capabilities are closer to compiler research systems and would significantly increase implementation complexity.

Instead, Code Graph focuses on **bounded structural flow**.

---

# 6. Perfect Semantic Understanding (Non-Goal)

The system will not attempt to fully understand program semantics.

Examples of excluded capabilities:

```
understanding business logic  
interpreting algorithm intent  
automatically classifying architectural layers
```

Code Graph provides structural relationships.

Interpretation remains the responsibility of developers.

---

# 7. Universal Language Support (Non-Goal)

Early versions of Code Graph will focus on a **single language ecosystem**.

Initial support target:

```
TypeScript / Node.js
```

Adding multiple language ecosystems prematurely would introduce major complexity in:

```
parsing  
symbol resolution  
graph normalization
```

Language expansion should only occur after the architecture proves stable.

---

# 8. Fully Automatic Documentation Semantics (Non-Goal)

Documentation terminology tracking is intentionally limited.

Phase C supports:

```
glossary term detection  
alias mapping  
terminology drift reports
```

The system will not attempt:

```
automatic ontology construction  
AI-generated concept hierarchies  
semantic interpretation of arbitrary text
```

These tasks are outside the project’s scope.

---

# 9. Automated Architecture Generation (Non-Goal)

Code Graph will not automatically generate architecture diagrams or architectural decisions.

Possible outputs may include:

```
graph visualizations  
dependency graphs  
flow traces
```

However, architectural interpretation remains a human responsibility.

---

# 10. Full Security Analysis (Non-Goal)

The system is not intended to function as a security analysis platform.

Examples of excluded capabilities:

```
vulnerability scanning  
taint analysis  
exploit detection
```

While some structural information may incidentally assist security investigations, that is not a primary goal.

---

# 11. Automatic Code Modification (Non-Goal)

Code Graph is an **analysis system**, not an automated refactoring engine.

The system should not:

```
rewrite code automatically  
apply structural changes  
modify repositories
```

Any such actions should be performed by external tooling.

---

# 12. AI Replacement for Engineering Judgment (Non-Goal)

While Code Graph may support AI tooling, it does not replace developer reasoning.

The system provides:

```
structured context  
graph evidence  
structural insights
```

But it does not make design decisions.

---

# 13. Avoiding Architectural Drift

Many analysis systems fail because their scope gradually expands.

To prevent this, new features should be evaluated against the core mission.

A feature should only be introduced if it:

```
improves structural understanding  
supports developer investigation  
maintains deterministic behavior  
does not introduce unbounded complexity
```

---

# 14. When Non-Goals May Change

Non-goals are not permanent.

They may be revisited after the system proves stable in real-world validation.

However, any scope expansion must be justified by:

```
clear developer value  
manageable complexity  
alignment with core architecture
```

---

# 15. Summary

Code Graph intentionally limits its scope.

It focuses on **structural truth and drift detection**, not full program understanding.

By enforcing these boundaries, the system remains:

```
deterministic  
maintainable  
practically useful
```

These limitations are essential for keeping the project achievable.
