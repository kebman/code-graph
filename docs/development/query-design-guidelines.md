# Query Design Guidelines

Status: Draft

This document defines guidelines for implementing graph queries in the `code-graph` system.

Queries are a central feature of the project. They allow developers and AI tools to explore relationships within a codebase using the indexed graph structure.

To ensure consistent behavior across queries, all query implementations should follow the guidelines described here.


---

# Query Principles

Queries must follow several core principles.

### Determinism

Queries must produce deterministic results.

Given the same graph input, a query must always return the same results.

Determinism requires:

- stable traversal ordering
- canonical node identifiers
- predictable path enumeration

Relevant documents:

```
docs/architecture/id-and-normalization.md  
docs/architecture/invariants.md
```


---

### Bounded Traversal

Queries should avoid unbounded graph traversal.

Traversal should include:

- explicit depth limits
- cycle detection
- predictable termination

This prevents runaway computations in large repositories.


---

### Explainability

Every query result should be explainable.

Results should include evidence describing:

- which nodes were visited
- which edges were followed
- why the result was included

This is particularly important for AI-assisted workflows.

See:

```
docs/architecture/edge-explanations.md
```


---

# Query Types

The system supports several categories of queries.


## Relationship Queries

These queries explore relationships between symbols or files.

Examples:

- callers
- callees
- references
- instantiations


---

## Structural Queries

Structural queries analyze the graph structure.

Examples:

- dependency paths
- cycles
- strongly connected components


---

## Impact Queries

Impact queries determine how changes propagate through the system.

Examples:

- blast radius
- affected modules
- downstream dependencies


---

## Cleanup Queries

Cleanup queries identify unused or redundant code.

Examples:

- dead exports
- unused symbols
- orphaned modules


---

# Query Input Forms

Queries should support flexible input formats.

Typical inputs include:

- file path
- module identifier
- symbol identifier
- graph node identifier

The query layer should normalize inputs before execution.


---

# Query Output Structure

Query results should follow the standard output format.

See:

```
docs/designs/output-format.md
```

Typical result elements include:

- nodes
- edges
- paths
- evidence
- truncation indicators


---

# Performance Considerations

Queries must remain efficient even on large repositories.

Strategies include:

- caching traversal results
- limiting traversal depth
- pruning irrelevant paths


---

# Error Handling

Queries should fail gracefully when inputs are invalid.

Typical cases include:

- missing symbols
- nonexistent files
- ambiguous identifiers

Error messages should be clear and informative.


---

# Relationship to CLI

Many queries are exposed through CLI commands.

Relevant document:

```
docs/designs/cli.md
```

CLI commands should directly map to query engine functionality.


---

# Testing Queries

All queries should be covered by tests.

Testing should verify:

- correct traversal behavior
- deterministic results
- edge-case handling

Testing strategy is defined in:

```
docs/development/testing-philosophy.md
```


---

# Long-Term Goal

The query system should remain predictable, explainable, and easy to extend.

Following these guidelines ensures new queries integrate cleanly with the existing architecture.

