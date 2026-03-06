# Documentation Invariants

> Project working title: Code Graph (temporary name)

Depends on:
- [doc-authority.md](./doc-authority.md)
- [graph-model.md](./graph-model.md)
- [graph-views.md](./graph-views.md)
- [invariants.md](./invariants.md)
- [glossary.md](./glossary.md)

Status: Draft

---

# 1. Purpose

This document defines **non-negotiable documentation invariants** for the project.

Documentation invariants are rules that **must always remain true** across the documentation system.

These rules exist to prevent:

- documentation drift
- duplicate definitions
- contradictory terminology
- architecture/design confusion
- accidental AI-generated inconsistencies

Unlike general documentation guidelines, **invariants must never be violated**.

---

# 2. Core Principle

Documentation must form a **directed authority graph**.

Information flows in **one direction only**:

```
Architecture → Design → Development → Roadmaps
```

Lower layers may reference higher layers, but **never redefine them**.

Violations of this rule create documentation drift.

---

# 3. Canonical Architecture Authorities

The following documents define the **canonical model of the system**.

They are the root authority for architecture concepts.

```
graph-model.md
graph-views.md
invariants.md
glossary.md
```

These documents define:

- node kinds
- edge kinds
- graph semantics
- system invariants
- canonical terminology

No other document may redefine these concepts.

---

# 4. Definition Ownership

Every concept must have **exactly one authoritative definition**.

Examples:

```
Node types        → graph-model.md
Edge types        → graph-model.md
Graph views       → graph-views.md
System invariants → invariants.md
Terminology       → glossary.md
```

Other documents may reference these definitions but must not duplicate them.

Duplicate definitions are a primary source of documentation drift.

---

# 5. Terminology Invariant

All documentation must use **canonical terminology**.

The glossary is the single source of truth:

```
docs/architecture/glossary.md
```

Rules:

- New technical terms must be added to the glossary.
- Synonyms should be avoided.
- Abbreviations must be defined once in the glossary.

Terminology inconsistencies must be corrected immediately.

---

# 6. Architecture Redefinition Prohibition

Design documents must **never redefine architecture concepts**.

Allowed:

```
"Indexer reads NodeKind values defined in graph-model.md"
```

Not allowed:

```
"The indexer uses node kinds: File, Symbol, Type"
```

In the second example, node kinds are being redefined outside the architecture document.

All architecture concepts must be referenced, not restated.

---

# 7. Design Scope Invariant

Design documents may only define:

- algorithms
- module boundaries
- data flow
- implementation structure

They must not define:

- node types
- edge types
- graph semantics
- architectural invariants

These belong exclusively to architecture documents.

---

# 8. Roadmap Scope Invariant

Roadmap documents may define:

- project phases
- milestones
- delivery sequence
- implementation priorities

They must not define architecture.

Example violation:

```
Phase 2 introduces a new node type.
```

Architecture must be defined **before** roadmap planning.

---

# 9. Dependency Declaration Invariant

All documentation files must declare their upstream authorities.

Example:

```
Depends on:

- graph-model.md
- graph-views.md
- invariants.md
```

This makes the documentation graph explicit and easier to validate.

Documents without dependency declarations are harder to reason about.

---

# 10. Downstream Consistency Rule

When an architecture document changes:

1. Architecture documents are updated first.
2. Design documents must be updated to match.
3. Development documents must be updated next.
4. Roadmap documents must be updated last.

Updating downstream documents without updating architecture first violates the authority model.

---

# 11. Reference Instead of Duplication

Documents must prefer **references instead of copied definitions**.

Allowed:

```
Node kinds are defined in [graph-model.md].
```

Not allowed:

```
Node kinds:
- File
- Symbol
- Type
- Runtime
```

Even if identical, duplicated definitions eventually diverge.

---

# 12. Stable Architecture Principle

Architecture documents should change **rarely and deliberately**.

Frequent architecture edits increase the risk of:

- documentation drift
- partial updates
- broken references
- inconsistent terminology

Architecture changes should be reviewed carefully before merging.

---

# 13. Documentation Graph Integrity

The documentation system forms a **concept dependency graph**.

This graph must remain:

- acyclic
- hierarchical
- authority-directed

Example valid structure:

```
graph-model
   ↓
indexer-architecture
   ↓
designs/indexer
```

Invalid structure:

```
design → architecture
```

Cycles between documents must never occur.

---

# 14. AI-Assisted Editing Safeguards

When AI tools modify documentation:

- canonical architecture documents must not be rewritten automatically
- duplicated definitions must not be introduced
- glossary terminology must remain unchanged
- dependency declarations must be preserved

AI edits should focus on:

- link normalization
- formatting
- clarity improvements

Semantic architecture edits require manual review.

---

# 15. Drift Detection

Documentation drift can be detected by checking:

- duplicated concept definitions
- inconsistent terminology
- conflicting architecture references
- missing dependency declarations

The **Documentation Term Graph** supports automated detection of these issues.

See:

- [docs-term-graph.md](./docs-term-graph.md)

---

# 16. Summary

The documentation system follows three core invariants:

1. **Single authority for each concept**
2. **One-direction documentation hierarchy**
3. **References instead of duplication**

Together these rules keep the documentation:

- consistent
- maintainable
- machine-analyzable
- resistant to drift

Maintaining these invariants ensures the project documentation remains reliable as the system evolves.

