# Codex Workflow

Status: Draft

This document defines how Codex (or similar AI execution agents) should be used within this repository.

The goals are:

- safe automated changes
- predictable outputs
- minimal architectural drift
- small, reviewable commits

Codex tasks should behave like **structured assistants**, not autonomous code generators.


---

# Principles

Codex tasks must follow several core principles.

### 1. Documentation First

Architecture and design documents define system behavior.

Codex tasks must read relevant documents before generating code or documentation.

Relevant documents include:

```
docs/architecture/**  
docs/designs/**  
docs/roadmaps/**
```

Implementation should follow the architecture defined in these documents.


---

### 2. Explicit Write Scope

Every Codex task must define a **write surface**.

Example:

```
SCOPE (allowed write surface only)

- docs/architecture/**
- docs/designs/**
```

Files outside the scope must not be modified.


---

### 3. Small Tasks

Each Codex task should perform **one conceptual change only**.

Examples:

Good tasks:

- generate missing documentation
- implement a specific query
- add CLI command

Bad tasks:

- redesign architecture
- implement multiple subsystems
- modify unrelated files


---

# Prompt Structure

All Codex prompts should follow a predictable structure.

Example:

```
TASK  

SCOPE (allowed write surface only)  

NON-NEGOTIABLES  

OUTPUT  
```

This structure ensures Codex tasks remain deterministic and reviewable.


---

# Codex Task Categories

Codex tasks typically fall into three categories.

### Documentation tasks

Examples:

- expand architecture documentation
- generate glossary entries
- create milestone documents

Typical scope:

```
docs/**
```


---

### Implementation tasks

Examples:

- implement graph model structures
- implement indexer logic
- implement query engine features

Typical scope:

```
src/**
```

Implementation tasks should reference the corresponding design documents.


---

### Audit tasks

Examples:

- documentation consistency checks
- terminology validation
- architecture compliance reports

Typical scope:

```
docs/**
```

Audit tasks generate reports rather than modifying implementation.


---

# Review Workflow

All Codex changes must be reviewed before committing.

Typical workflow:

1. Run Codex task
2. Inspect changes
3. Verify scope compliance
4. Commit changes

Example commands:

```
git status  
git diff  
tools/tree.sh docs
```

This ensures that unexpected changes are detected early.


---

# Commit Strategy

Codex-generated changes should follow repository commit conventions.

Example:

```
docs(architecture): add glossary  
docs(designs): cli command surface  
feat(query): implement callers query
```

Large outputs should be split into multiple commits.


---

# When Codex Should Stop

Codex tasks should stop if:

- required files are missing
- architecture documents conflict
- scope cannot be satisfied

In these cases Codex should report the issue rather than inventing behavior.


---

# Relationship to Architecture

Codex must treat architecture documents as authoritative.

Relevant documents include:

```
docs/architecture/architecture-overview.md  
docs/architecture/graph-model.md  
docs/architecture/invariants.md  
docs/architecture/indexer-architecture.md  
docs/architecture/query-engine-architecture.md
```

Implementation must conform to these documents.


---

# Long-Term Goal

The repository is structured so that Codex can assist with:

- indexing engine implementation
- query engine development
- documentation expansion
- automated analysis tooling

Maintaining a clear Codex workflow helps keep the project deterministic and maintainable.

