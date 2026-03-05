# Testing Philosophy

Status: Draft

This document describes the testing philosophy used in the `code-graph` project.

Testing is critical because the system builds a **deterministic structural representation of source code**.  
Small inconsistencies in indexing or graph construction can propagate into incorrect query results.

The goal of testing is to ensure that:

- graph structure is correct
- indexing is deterministic
- queries produce stable results
- architectural invariants are preserved


---

# Testing Layers

Testing occurs at several levels.

```
Unit Tests  
↓  
Indexer Tests  
↓  
Graph Integrity Tests  
↓  
Query Engine Tests  
↓  
Snapshot Tests
```

Each layer verifies different guarantees.


---

# Unit Tests

Unit tests verify small pieces of functionality.

Examples:

- node construction
- edge creation
- path normalization
- symbol identity rules

Unit tests should be fast and isolated.


---

# Indexer Tests

Indexer tests verify that source files are correctly translated into graph structures.

Typical assertions include:

- correct file nodes
- correct import edges
- correct symbol discovery
- correct export handling

These tests ensure the indexer produces the expected graph structure.


---

# Graph Integrity Tests

Graph integrity tests validate structural invariants.

Examples:

- no duplicate node identifiers
- edges reference valid nodes
- node types match schema
- invariant rules are respected

These tests enforce the guarantees described in:

```
docs/architecture/invariants.md
```


---

# Query Engine Tests

Query tests validate graph traversal and analysis logic.

Examples:

- callers query returns correct functions
- dependency paths are correct
- cycles are detected correctly
- blast radius analysis is accurate

These tests verify the behavior defined in:

```
docs/designs/query-engine.md
```


---

# Snapshot Tests

Snapshot tests verify deterministic output.

Typical use cases:

- CLI output
- query results
- graph serialization

Snapshots allow easy detection of unexpected changes in behavior.


---

# Determinism Requirement

A key property of the system is determinism.

Running the indexer on the same repository must produce the same graph every time.

Determinism depends on:

- canonical path normalization
- stable node identifiers
- deterministic ordering

See:

```
docs/architecture/id-and-normalization.md
```


---

# Test Fixtures

Test fixtures are small example repositories used to verify indexing behavior.

Fixtures should include:

- simple modules
- dependency chains
- cycles
- unused exports

Fixtures must remain small and easy to reason about.


---

# When Tests Should Be Added

Tests should be added when:

- implementing new queries
- modifying graph structure
- updating indexing behavior
- fixing bugs

Major architectural changes should also introduce corresponding tests.


---

# Test Failures

When tests fail:

1. determine whether behavior changed intentionally
2. verify architecture documents still apply
3. update tests only if the change is intentional

Tests should not be modified simply to pass.


---

# Relationship to Architecture

Testing enforces the architectural guarantees defined in:

```
docs/architecture/invariants.md  
docs/architecture/graph-model.md  
docs/architecture/indexer-architecture.md
```

Tests should reflect these constraints.


---

# Long-Term Goal

The long-term goal is to maintain a reliable testing framework that ensures the graph representation and query engine remain correct as the system evolves.

A strong testing philosophy helps maintain deterministic behavior and prevents subtle indexing errors.

