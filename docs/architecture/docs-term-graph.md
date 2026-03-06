# Documentation Term Graph

> Project working title: Code Graph (temporary name)

Depends on:
- [architecture-overview.md](./architecture-overview.md)
- [graph-model.md](./graph-model.md)
- [graph-views.md](./graph-views.md)
- [invariants.md](./invariants.md)
- [glossary.md](./glossary.md)
- [project-phases.md](./project-phases.md)

Status: Draft

---

# 1. Purpose

This document defines the **Documentation Term Graph**, a bounded mechanism for tracking key terminology across project documentation.

Its purpose is to:

- prevent terminology drift
- make glossary definitions enforceable
- detect inconsistent term usage
- expose synonym conflicts
- optionally connect documentation terms to code symbols

This is not a general natural-language understanding system.

It is a **structured reference layer for critical project vocabulary**.

---

# 2. Why This Exists

Large projects frequently suffer from terminology drift:

Examples:

- two terms used for the same concept
- the same term used with different meanings
- glossary definitions not followed in documentation
- key concepts referenced but never formally defined
- documentation describing concepts that no longer exist in code

These problems accumulate gradually and are difficult to detect manually.

The Documentation Term Graph provides a mechanical way to detect such drift.

---

# 3. Phase Position

The Documentation Term Graph belongs to **Phase C** of the project.

See:
- [project-phases.md](./project-phases.md)

It is intentionally deferred until:

- the core graph model is stable
- the indexing system is trustworthy
- real code-side surfaces have proven useful

This ordering ensures the project does not become distracted by ambiguous prose analysis too early.

---

# 4. Scope

## 4.1 In Scope

The system tracks only **explicitly defined terminology**.

Primary sources:

- glossary entries
- manually defined aliases
- explicit references in documentation

Tracked relationships include:

- term definition location
- document mentions
- heading/topic associations
- alias relationships
- optional mapping to code symbols

## 4.2 Out of Scope

The system does **not attempt**:

- full semantic understanding of prose
- automatic synonym discovery
- concept extraction from arbitrary sentences
- AI-generated ontology building

All relationships must remain explicit and deterministic.

---

# 5. Core Concepts

## 5.1 Glossary Term

A Glossary Term is a formally defined concept in project documentation.

Each term should have:

- a canonical name
- a definition
- a location in `glossary.md`

Glossary terms represent the authoritative vocabulary of the project.

## 5.2 Term Mention

A Term Mention occurs when a glossary term appears in documentation text.

Mentions may occur in:

- architecture documents
- design documents
- development guides
- roadmap documents

Mentions provide evidence for how concepts are used across the documentation set.

## 5.3 Alias

An Alias represents an alternative spelling or synonym for a glossary term.

Examples:

```
Endpoint → API Endpoint  
Runtime Node → Runtime  
Graph View → View
```

Aliases must be defined manually to avoid incorrect automated assumptions.

## 5.4 Code Symbol Link (Optional)

In some cases, a glossary term may correspond to a code-level concept.

Example:

```

Endpoint → route registration symbol  
Handler → controller function  
DTO → exported type

```

These relationships may be tracked explicitly but are not required.

---

# 6. Data Model (Conceptual)

The Documentation Term Graph may introduce the following conceptual nodes:

### Nodes

```
GlossaryTerm  
DocFile  
DocSection (optional)  
CodeSymbol (optional)
```

### Edges

```
DEFINED_IN (GlossaryTerm → DocSection)  
MENTIONED_IN (GlossaryTerm → DocFile)  
ALIASED_AS (GlossaryTerm → GlossaryTerm)  
RELATES_TO_SYMBOL (GlossaryTerm → CodeSymbol)
```

These nodes and edges may remain a derived surface rather than canonical graph elements in v1.

---

# 7. Source of Truth

The primary source of truth for glossary terms is:

```
docs/architecture/glossary.md
```

This document defines:

- canonical terms
- definitions
- terminology boundaries

The Documentation Term Graph must treat this file as authoritative.

---

# 8. Extraction Strategy

Term extraction should remain deterministic and simple.

### Step 1 — Parse Glossary

Identify all canonical glossary entries.

Extract:

- term name
- definition location

### Step 2 — Load Alias Map

Aliases may be defined in a structured file, for example:

```
docs/glossary/aliases.yml
```

This prevents accidental synonym discovery.

### Step 3 — Scan Documentation

Scan `docs/**` for:

- term mentions
- alias mentions

Mentions should be normalized to the canonical term.

### Step 4 — Produce Term Graph

Construct a derived graph linking:

- terms
- mentions
- documents
- optional symbols

---

# 9. Example

Example glossary entries:

```
Endpoint  
Handler  
Graph View  
Runtime Node
```

Example document mention:

```
docs/architecture/endpoint-surface.md
```

The term graph might record:

```
Endpoint  
DEFINED_IN → glossary.md  
MENTIONED_IN → endpoint-surface.md  
MENTIONED_IN → project-phases.md
```

This allows the system to identify how the concept spreads across documentation.

---

# 10. Drift Detection

The Documentation Term Graph enables detection of several classes of documentation drift.

## 10.1 Undefined Terms

A document references a concept that is not present in the glossary.

Example:

```
Service Boundary
```

but no glossary definition exists.

## 10.2 Unused Definitions

A glossary entry exists but never appears elsewhere.

Example:

```
Execution Domain
```

never mentioned outside glossary.

## 10.3 Competing Synonyms

Two terms appear frequently but are not formally related.

Example:

```
Endpoint  
API Route  
API Entry
```

This may signal the need for alias mapping.

## 10.4 Inconsistent Usage

A term appears across many documents but appears to refer to different concepts.

This may require manual clarification.

---

# 11. Integration With the Code Graph

The Documentation Term Graph can optionally connect documentation concepts to code concepts.

Example:

```
Endpoint → route handler symbol  
DTO → exported type  
Repository → database access class
```

These mappings can support:

- documentation traceability
- concept-to-code navigation
- better context packs for AI tools

However, these relationships must remain explicit.

They should not be inferred automatically.

---

# 12. Relationship to AI Context Packs

Documentation term tracking can improve AI context selection.

For example:

If a prompt references:

```
Endpoint  
Handler  
DTO
```

the system can:

- locate glossary definitions
- identify key architecture docs referencing those terms
- locate related code symbols

This helps construct a **focused context pack**.

See:
- [ai-context-pack.md](./ai-context-pack.md)

---

# 13. Risks

## 13.1 Over-Modeling Documentation

If the system attempts to model all prose relationships, complexity will explode.

Mitigation:

- track only glossary terms
- track only explicit aliases
- avoid speculative relationships

## 13.2 False Synonym Detection

Automatic synonym discovery is unreliable.

Mitigation:

- require explicit alias definitions

## 13.3 Documentation Noise

Some documents may mention terms casually without architectural significance.

Mitigation:

- rely on frequency and manual review rather than automated interpretation.

---

# 14. Future Extensions

Possible future enhancements include:

- term-frequency heatmaps
- topic clustering for documentation sections
- automatic glossary suggestion reports
- symbol-aware doc navigation

These are optional and not required for Phase C.

---

# 15. Summary

The Documentation Term Graph provides a bounded mechanism to:

- enforce glossary authority
- detect terminology drift
- map where key concepts appear in documentation
- optionally connect documentation concepts to code symbols

It deliberately avoids full semantic modeling of documentation.

This keeps the system deterministic, maintainable, and aligned with the core design philosophy of Code Graph.

