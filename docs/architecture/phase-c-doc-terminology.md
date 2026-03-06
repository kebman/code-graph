# Phase C — Documentation Terminology Tracking

> Project working title: Code Graph (temporary name)

Depends on:
- [project-phases.md](./project-phases.md)
- [docs-term-graph.md](./docs-term-graph.md)
- [doc-authority.md](./doc-authority.md)
- [glossary.md](./glossary.md)
- [graph-model.md](./graph-model.md)
- [invariants.md](./invariants.md)

Status: Draft

---

# 1. Purpose

This document defines **Phase C: Documentation Terminology Tracking**.

Phase C introduces a bounded system for detecting **terminology drift across documentation**.

Its goal is to ensure that:

- important concepts remain consistently named
- glossary definitions are actually used
- synonyms are explicitly tracked
- documentation and code remain aligned conceptually

This phase extends the Code Graph system from **code structure** into **project knowledge structure**.

---

# 2. Why Terminology Tracking Matters

In long-lived projects, terminology drift is common.

Typical failure patterns include:

- the same concept gaining multiple names
- outdated terms persisting in older documents
- undocumented concepts appearing in design discussions
- definitions existing in a glossary but never referenced

Examples of drift:

```
Endpoint  
API Route  
Route Entry
```


or:

```
Graph View  
View Layer  
Traversal Layer
```

When terminology drifts, architecture becomes harder to reason about.

Phase C introduces a mechanical system to detect these problems.

---

# 3. Relationship to Previous Phases

Phase C depends on both earlier phases.

Phase A provides:

```
code structure graph  
symbol relationships  
file relationships
```

Phase B provides:

```
contract alignment surfaces  
endpoint inventories
```

Phase C introduces:

```
documentation terminology surfaces
```

This allows relationships such as:

```
documentation concept → code symbol  
documentation concept → architecture component
```

---

# 4. Primary Data Source

The primary source of terminology authority is:

[glossary.md](./glossary.md)

This glossary defines:

- canonical term names
- official definitions
- concept boundaries

All terminology tracking begins from this glossary.

---

# 5. Core Entities

Phase C introduces several conceptual entities.

## GlossaryTerm

A formally defined concept from the glossary.

Attributes:

```
name  
definition  
definition location
```

---

## Document

Any documentation file located under:

```
docs/**
```

Documents may contain references to glossary terms.

---

## Term Mention

A Term Mention occurs when a glossary term appears in documentation text.

Attributes:

```
document  
line location  
term
```

---

## Alias

An alias defines a synonym relationship between two terms.

Example:

```
API Route → Endpoint  
Handler Function → Handler
```

Aliases must be defined manually.

Automatic synonym inference is intentionally excluded.

---

# 6. Terminology Graph Structure

The terminology graph may include the following conceptual edges:

```
DEFINED_IN  
MENTIONED_IN  
ALIASED_AS  
RELATES_TO_SYMBOL
```

Example:

```
Endpoint  
DEFINED_IN → glossary.md  
MENTIONED_IN → endpoint-surface.md  
MENTIONED_IN → phase-b-contract-alignment.md
```

This structure allows the system to trace how terminology propagates through the documentation set.

---

# 7. Drift Detection Types

Phase C enables detection of several types of terminology drift.

## Undefined Terms

A document references a term not present in the glossary.

Example:

```
Service Boundary
```

but no glossary entry exists.

---

## Unused Glossary Entries

A glossary term exists but never appears in any documentation.

Example:

```
Execution Domain
```

This may indicate:

- unused architecture concepts
- outdated glossary entries

---

## Competing Synonyms

Multiple terms appear to represent the same concept.

Example:

```
Endpoint  
API Route  
API Endpoint
```

The system should report these occurrences so aliases can be declared explicitly.

---

## Inconsistent Definitions

A term may appear across multiple documents but with conflicting descriptions.

While automatic semantic analysis is limited, the system can highlight locations where the same term appears in many contexts.

---

# 8. Alias Mapping

Aliases should be stored in a structured file.

Suggested location:

```
docs/glossary/aliases.yml
```

Example:

```
aliases:  
API Route: Endpoint  
Route Handler: Handler
```

During indexing, alias mentions are normalized to their canonical term.

---

# 9. Optional Code Mapping

Glossary terms may optionally link to code symbols.

Example:

```
Endpoint → route registration symbol  
Handler → exported controller function  
DTO → exported TypeScript type
```

This allows developers to move between:

```
documentation concept  
→ code implementation
```

This mapping must remain explicit and manually maintained.

---

# 10. Output Reports

Terminology tracking may produce reports such as:

```
undefined terms  
unused glossary entries  
alias candidates  
term usage frequency  
term-to-document mappings
```

These reports help maintain documentation quality.

---

# 11. Relationship to AI Context Packs

Terminology tracking can assist AI tooling.

When a prompt references a glossary term:

```
Endpoint  
Handler  
Graph View
```

the system can retrieve:

```
definition  
relevant architecture docs  
related code symbols
```

This enables more precise **AI context packs**.

See:

- `ai-context-pack.md`

---

# 12. Limitations

Phase C intentionally avoids:

```
automatic semantic interpretation of documentation  
AI-generated ontology building  
fully automated synonym detection
```

The goal is controlled terminology tracking, not general language analysis.

---

# 13. Risks

## Overengineering

Attempting to track every documentation concept would create excessive complexity.

Mitigation:

Track only glossary terms and explicitly declared aliases.

---

## False Synonym Detection

Automated synonym discovery can produce incorrect results.

Mitigation:

Aliases must be declared manually.

---

# 14. Success Criteria

Phase C is considered successful when the system can:

```
parse glossary definitions  
detect glossary term mentions  
report undefined terms  
report unused glossary entries  
track alias mappings
```

This capability ensures the documentation layer remains structurally aligned with the architecture.

---

# 15. Summary

Phase C introduces a bounded documentation analysis layer.

It ensures that:

```
project terminology remains consistent  
documentation references remain traceable  
architecture concepts remain stable
```

By anchoring terminology in the glossary and tracking its usage, Code Graph extends its drift-detection capabilities from code into documentation.
