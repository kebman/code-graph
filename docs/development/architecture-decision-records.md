# Architecture Decision Records (ADR)

Status: Draft

This document defines how architectural decisions are recorded in the `code-graph` project.

Architecture Decision Records (ADRs) capture important technical decisions and the reasoning behind them.

The goal is to preserve the context of decisions so future contributors understand:

- why the system works the way it does
- which alternatives were considered
- which constraints influenced the design


---

# What Requires an ADR

An ADR should be created when a decision affects:

- system architecture
- core data models
- subsystem boundaries
- persistence strategies
- indexing strategies
- query semantics
- determinism guarantees

Examples relevant to this project include:

- graph node and edge definitions
- symbol identity rules
- storage backend selection
- indexing strategy decisions
- query algorithm design
- context pack selection algorithms


---

# ADR Location

All architecture decision records live under:

```
docs/adr/
```

Each ADR is a separate document.


---

# ADR Naming Convention

ADR files use a sequential identifier.

Example:

```
docs/adr/adr-001-graph-node-model.md  
docs/adr/adr-002-storage-backend.md  
docs/adr/adr-003-symbol-identity.md
```

Numbers ensure chronological ordering.


---

# ADR Template

Every ADR should follow this structure.

```
# ADR-XXX:

Status: Proposed | Accepted | Superseded

Date: YYYY-MM-DD

## Context

Describe the problem or constraint.

Explain why a decision is needed.

## Decision

Describe the selected solution.

Explain how it solves the problem.

## Alternatives Considered

List other options that were evaluated.

Explain why they were rejected.

## Consequences

Describe the implications of the decision.

Include both benefits and trade-offs.
```

This structure ensures ADRs remain consistent and easy to read.


---

# Example ADR

Example record:

```
ADR-001: Storage Backend

Context:  
The system needs a persistent storage layer for graph nodes and edges.

Decision:  
Use a relational database schema with nodes and edges tables.

Alternatives Considered:

- Graph database
- Document database

Consequences:  
Relational storage simplifies deployment and ensures deterministic queries.
```

This example is illustrative; real ADRs should include deeper analysis.


---

# Relationship to Architecture Documents

Architecture documents describe **how the system works**.

ADRs explain **why specific decisions were made**.

Architecture:

```
docs/architecture/**
```

Designs:

```
docs/designs/**
```

ADRs:

```
docs/adr/**
```


---

# When to Write an ADR

An ADR should be created:

- before implementing a major change
- when choosing between competing approaches
- when architecture evolves

Not every small implementation detail requires an ADR.


---

# Updating ADRs

ADRs should not be modified after acceptance.

If a decision changes:

1. Create a new ADR
2. Mark the old ADR as **Superseded**

Example:

```
Status: Superseded by ADR-005
```

This preserves historical reasoning.


---

# Benefits

Using ADRs provides several benefits:

- historical traceability
- easier onboarding of new contributors
- clearer reasoning behind architecture
- reduced repetition of past debates

Architecture decisions become part of the project knowledge base.


---

# Long-Term Goal

The ADR system allows the `code-graph` project to evolve while preserving the reasoning behind key technical decisions.

This becomes especially important once the indexer, graph model, and query engine mature.
