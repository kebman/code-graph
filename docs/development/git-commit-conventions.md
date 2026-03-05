# Git Commit Conventions

Status: Draft

This document defines the commit message structure and taxonomy used in the `code-graph` repository.

The goal is:

- readable project history
- commits aligned with architecture boundaries
- small conceptual units of change
- clear signal for tooling and AI-assisted development

This repository intentionally uses a **small and stable commit vocabulary**.


---

# Commit Message Format

```
type(scope): short description
```

Example:

```
docs(architecture): edge explanations  
feat(indexer): parse imports and exports  
feat(query): callers query  
refactor(graph): normalize edge ids  
test(indexer): determinism snapshots  
tooling: improve tree.sh
```

Rules:

- subject line ≤ ~60 characters
- lowercase type
- imperative mood preferred ("add", "implement", "normalize")
- no trailing period


---

# Commit Types

Only a small set of commit types are used.

| Type | Meaning |
|-----|--------|
| init | repository bootstrap |
| docs | documentation |
| feat | new capability |
| refactor | internal restructuring without behavior change |
| test | test coverage |
| fix | bug fix |
| perf | performance improvement |
| tooling | development tooling or scripts |

Avoid introducing new types unless necessary.


---

# Scope Vocabulary

Scopes should correspond to major architectural subsystems.

## Documentation scopes

```
docs(architecture)  
docs(designs)  
docs(roadmap)  
docs(development)
```

## Core system scopes

```
feat(graph)  
feat(indexer)  
feat(query)  
feat(storage)
```

## Interface layer

```
feat(cli)  
feat(pack)
```

## Cross-cutting scopes

```
refactor(graph)  
test(indexer)  
perf(query)
```

Scopes should remain stable over time.


---

# Commit Bundling Rules

Each commit should represent **one conceptual change**.

Good:

```
docs(architecture): glossary  
docs(architecture): edge explanation contract  
docs(designs): cli command surface
```

Avoid large mixed commits such as:

```
docs: update docs  
misc fixes
```

Large changes should be split into multiple commits.


---

# Commit Frequency

Preferred commit patterns:

| Change Type | Frequency |
|-------------|----------|
| documentation | small, frequent |
| architecture decisions | single-doc commits |
| feature implementation | per feature |
| refactors | isolated commits |

This makes repository history easier to understand and audit.


---

# Example Project History

A healthy early history might look like:

```
init: repo bootstrap  
docs(architecture): glossary  
docs(architecture): edge explanation contract  
docs(architecture): id normalization  
docs(designs): cli surface  
docs(designs): storage schema  
docs(roadmap): v1 milestones  
feat(graph): node and edge schema  
feat(indexer): file dependency extraction  
feat(query): callers query  
feat(cli): index command
```

This structure allows the history to mirror the architecture of the system.


---

# Rationale

This project is designed to support:

- deterministic indexing
- graph-based reasoning
- AI-assisted development workflows

Clear and consistent commit structure improves:

- change traceability
- architecture alignment
- automated analysis tools
- future contributors understanding the system
