# Documentation Linking Policy

> Project working title: Code Graph (temporary name)

Depends on:
- [architecture-overview.md](./architecture-overview.md)
- [doc-authority.md](./doc-authority.md)
- [glossary-governance.md](./glossary-governance.md)
- [invariants.md](./invariants.md)

Status: Draft

---

# 1. Purpose

This document defines **how documentation files should link to each other**.

In large documentation sets, weak or inconsistent linking causes several problems:

```
broken navigation  
concept duplication  
documentation drift  
unclear authority relationships
```

The goal of this policy is to ensure that:

```
document relationships are explicit  
authority flows are visible  
references remain stable
```

---

# 2. Linking Philosophy

Documentation links should reflect **conceptual dependency**, not convenience.

A document should link to another document when:

```
it depends on definitions from that document  
it extends concepts defined elsewhere  
it relies on constraints defined elsewhere
```

This creates a visible **knowledge structure** across the documentation.

---

# 3. Dependency Headers

Each architecture document should begin with a dependency section.

Example:

```
Depends on:

- graph-model.md
- graph-views.md
- invariants.md
```

This indicates that the document builds upon those concepts.

Dependency headers allow tools and readers to understand:

```
which documents define foundations  
which documents extend them
```

---

# 4. Authority Hierarchy

Some documents act as **authoritative sources** for specific concepts.

Examples:

```
graph-model.md → canonical node and edge definitions  
graph-views.md → canonical view definitions  
glossary.md → canonical terminology  
invariants.md → system guarantees
```

Other documents must defer to these sources rather than redefining them.

---

# 5. Avoiding Concept Duplication

A document should not redefine concepts already defined elsewhere.

Example problem:

```
graph-node-kinds.md defines node types  
graph-model.md also defines node types
```

This creates ambiguity about which definition is correct.

Instead:

```
graph-model.md defines node types  
graph-node-kinds.md references graph-model.md
```

---

# 6. Reference vs Explanation

Documents may either:

```
reference a concept  
explain a concept
```

Explanation documents should link to reference documents.

Example:

```
edge-explanations.md
```

should reference:

```
graph-model.md
```

which defines the canonical edge list.

---

# 7. Relative Linking

Documentation links should use **relative paths**.

Example:

```
[graph-model.md](https://chatgpt.com/g/g-p-69a9efde86988191b6c4b298c52500a0/c/graph-model.md)
```

Relative links ensure that documentation remains portable within the repository.

Absolute URLs should be avoided unless linking outside the repository.

---

# 8. Cross-Directory References

When linking across documentation directories, paths must remain explicit.

Example:

```
[storage.md](https://chatgpt.com/g/g-p-69a9efde86988191b6c4b298c52500a0/designs/storage.md)
```

Clear path references make document relationships visible.

---

# 9. Avoiding Link Noise

Not every mention of a concept requires a hyperlink.

Over-linking creates visual noise and reduces readability.

Recommended practice:

```
link the first occurrence of a concept  
avoid linking repeated mentions
```

---

# 10. Broken Link Prevention

Broken documentation links can cause structural drift.

Tools should periodically validate that:

```
all referenced files exist  
relative paths remain valid  
renamed documents update references
```

This can be automated through documentation validation tooling.

---

# 11. Relationship to Code Graph

The linking structure of documentation is itself a **graph**.

Possible future analysis may include:

```
document dependency graphs  
authority hierarchy visualization  
drift detection in document references
```

This would allow documentation structure to be analyzed similarly to code.

---

# 12. AI Context Packs

Consistent linking improves AI-assisted workflows.

When a document references another document, AI tooling can retrieve:

```
definitions  
constraints  
related concepts
```

This helps AI systems build accurate context packs.

---

# 13. Governance

Documentation maintainers should periodically review:

```
link integrity  
authority hierarchy consistency  
duplicate concept definitions
```

If multiple documents begin defining the same concept, the authority hierarchy must be clarified.

---

# 14. Summary

A consistent linking structure ensures that documentation forms a coherent knowledge system.

This policy ensures that:

```
document relationships remain visible  
authority flows remain clear  
concept definitions remain centralized
```

These properties help prevent documentation drift and support long-term maintainability.

