# Contribution Guidelines

Status: Draft

This document defines how contributors should work with the `code-graph` repository.

The goals are:

- maintain architectural consistency
- keep the repository understandable
- ensure changes remain small and reviewable
- prevent accidental scope expansion

These guidelines apply to both human contributors and AI-assisted workflows.


---

# Guiding Principles

Contributions should follow a few core principles.

### Architecture First

Architecture documents define the system's structure and guarantees.

Relevant documents include:

```
docs/architecture/**  
docs/designs/**
```

Implementation should follow these documents rather than redefining system behavior.


---

### Small Changes

Changes should be small and focused.

Good examples:

- implementing a specific query
- adding a CLI command
- improving a single document

Avoid large commits that mix multiple concerns.


---

### Deterministic Behavior

The system is designed to produce deterministic results.

Contributions must not introduce:

- non-deterministic ordering
- unstable identifiers
- implicit inference

Determinism requirements are defined in:

```
docs/architecture/id-and-normalization.md  
docs/architecture/invariants.md
```


---

# Typical Contribution Workflow

A typical workflow looks like this.

1. Identify the change
2. Review relevant architecture or design documents
3. Implement a small, focused change
4. Run tests (if applicable)
5. Commit the change

Example commands:

```
git status  
git diff
```


---

# Commit Conventions

Commit messages should follow the repository commit conventions.

See:

```
docs/development/git-commit-conventions.md
```

Example:

```
feat(indexer): parse imports  
docs(architecture): clarify graph model  
test(query): callers traversal
```

Each commit should represent one conceptual change.


---

# Working with Documentation

Documentation is an important part of the project.

When updating architecture or design:

- ensure terminology remains consistent
- maintain cross-links between documents
- avoid expanding v1 scope unintentionally

If new architectural decisions are required, create an ADR.


---

# Architecture Decision Records

Major decisions should be recorded using ADRs.

See:

```
docs/development/architecture-decision-records.md
```

Examples of decisions requiring ADRs:

- graph model changes
- indexing strategy changes
- storage architecture changes


---

# Working with AI Tools

AI tools such as Codex may assist with implementation or documentation.

When using AI:

- restrict write scope explicitly
- review outputs carefully
- avoid accepting large automated changes without inspection

See:

```
docs/development/codex-workflow.md
```


---

# Reporting Issues

When reporting issues or proposing changes:

- describe the problem clearly
- reference relevant architecture documents
- suggest possible solutions if known


---

# Long-Term Goal

The goal of these guidelines is to keep the project maintainable as it grows.

Following these practices ensures that:

- architecture remains stable
- contributors understand the system
- the repository evolves in a predictable way.

