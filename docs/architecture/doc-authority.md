# Documentation Authority Model

> Project working title: Code Graph (temporary name)

Depends on:
- [architecture-overview.md](./architecture-overview.md)
- [graph-model.md](./graph-model.md)
- [graph-views.md](./graph-views.md)
- [invariants.md](./invariants.md)
- [project-phases.md](./project-phases.md)

Status: Draft

---

# 1. Purpose

This document defines the **documentation authority hierarchy** for the project.

Its purpose is to prevent documentation drift by clearly establishing:

- which documents are authoritative
- which documents are derived
- how conflicts are resolved
- how new documents should be introduced

Without an explicit authority model, documentation tends to fragment over time.

---

# 2. Core Principle

Documentation must follow a **single-direction authority chain**.

Lower-level documents must conform to higher-level documents.

Conflicts are resolved **upward**, never sideways.

The authority chain is:

```
Architecture (authoritative model)  
→ Design (implementation interpretation)  
→ Development (guidelines and process)  
→ Roadmaps (delivery planning)
```


---

# 3. Architecture Documents

Architecture documents define the **canonical technical model** of the system.

These documents must remain stable and internally consistent.

Examples:

```
graph-model.md  
graph-views.md  
invariants.md  
indexer-architecture.md  
query-engine-architecture.md
```

Architecture documents define:

- node types
- edge types
- canonical terminology
- system invariants
- graph semantics

All other documents must conform to these definitions.

---

# 4. Design Documents

Design documents explain **how architecture is implemented**.

Examples:

```
designs/indexer.md  
designs/query-engine.md  
designs/storage.md  
designs/output-format.md  
designs/cli.md
```

Design documents may:

- specify algorithms
- describe implementation strategies
- explain module responsibilities

Design documents must **not redefine architecture concepts**.

If architecture needs to change, the architecture document must be updated first.

---

# 5. Development Documents

Development documents define **working practices for contributors**.

Examples:

```
development/repo-structure.md  
development/contribution-guidelines.md  
development/codex-workflow.md  
development/git-commit-conventions.md
```

These documents may describe:

- workflow
- contributor expectations
- testing philosophy
- documentation practices

They must not introduce new architectural concepts.

---

# 6. Roadmap Documents

Roadmaps describe **delivery planning**.

Examples:

```
roadmaps/roadmap-v1.md  
roadmaps/milestones-v1.md
```

Roadmaps may reference architecture and design decisions but must not contradict them.

If roadmap goals conflict with architecture, architecture must be updated first.

---

# 7. ADR Documents

Architecture Decision Records (ADR) capture **historical decisions**.

Examples:

```
adr/adr-001-graph-node-model.md  
adr/adr-002-storage-backend.md  
adr/adr-003-symbol-identity.md
```

ADR documents record:

- why a decision was made
- what alternatives were considered
- what trade-offs were accepted

ADR documents do not replace architecture documents.

They provide context for why the architecture looks the way it does.

---

# 8. Glossary Authority

The glossary is the **single source of truth for terminology**.

File:

```
docs/architecture/glossary.md
```

All documentation must use the canonical terms defined there.

If a new concept appears in documentation:

1. The term must be added to the glossary.
2. The glossary definition must be referenced.

This rule helps prevent terminology drift.

See:

- [docs-term-graph.md](./docs-term-graph.md)

---

# 9. Conflict Resolution

If two documents disagree:

1. Check architecture documents first.
2. If architecture documents disagree, the conflict must be resolved there.
3. Design documents must be updated to match architecture.
4. Development and roadmap documents must be updated to match both.

Conflicts must never be resolved by editing only downstream documents.

---

# 10. Introducing New Documents

When introducing a new document:

1. Determine which category it belongs to.
2. Place it in the correct directory.
3. Add a "Depends on" section referencing authoritative documents.

Example:

```
Depends on:

- graph-model.md
- graph-views.md
```

This ensures the dependency chain remains explicit.

---

# 11. Updating Architecture

Architecture changes must follow this process:

1. Update the relevant architecture document.
2. Update affected design documents.
3. Update derived development documents.
4. Update roadmap references if needed.

This prevents partial updates from creating drift.

---

# 12. Avoiding Duplicate Definitions

Definitions must appear in **only one authoritative place**.

Examples:

```
Node types → graph-model.md  
Edge types → graph-model.md  
Graph views → graph-views.md  
Terminology → glossary.md
```

Other documents may reference these definitions but must not duplicate them.

---

# 13. Documentation Graph

The documentation authority model works together with the **Documentation Term Graph**.

The term graph can detect:

- undefined terminology
- conflicting synonyms
- inconsistent concept usage

See:

- [docs-term-graph.md](./docs-term-graph.md)

This allows automated detection of documentation drift.

---

# 14. Benefits

Establishing a documentation authority model provides:

- stable terminology
- consistent architecture interpretation
- reduced documentation drift
- easier onboarding for contributors
- more reliable AI-assisted development

---

# 15. Summary

The documentation system follows this hierarchy:

```
Architecture → Design → Development → Roadmaps
```

Architecture defines the system.

Everything else derives from it.

Maintaining this hierarchy ensures the project remains coherent as it grows.

