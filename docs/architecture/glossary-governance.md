# Glossary Governance

> Project working title: Code Graph (temporary name)

Depends on:
- [glossary.md](./glossary.md)
- [phase-c-doc-terminology.md](./phase-c-doc-terminology.md)
- [doc-authority.md](./doc-authority.md)
- [invariants.md](./invariants.md)
- [success-criteria.md](./success-criteria.md)

Status: Draft

---

# 1. Purpose

This document defines the **governance rules for the project glossary**.

The glossary is the **terminology authority** for the Code Graph project.

Its purpose is to ensure that:

```
project terminology remains stable  
architecture concepts remain well-defined  
documentation does not drift semantically
```

Without a governed glossary, large documentation systems tend to develop:

```
synonym drift  
concept duplication  
conflicting definitions
```

---

# 2. Role of the Glossary

The glossary defines **canonical project concepts**.

Examples include:

```
Graph Node  
Graph Edge  
Endpoint Surface  
Symbol Graph  
Runtime Node
```

These terms act as **anchors** for the architecture documentation.

All architectural documents should reference glossary terms when introducing concepts.

---

# 3. Canonical Terms

A **canonical term** is the official name of a concept.

Each canonical term must have:

```
term name  
precise definition  
context of usage
```

Example structure:

```
Term: Endpoint Surface

Definition:  
A derived view that enumerates all HTTP endpoints discovered in code.
```

The canonical term must remain stable over time.

---

# 4. Synonyms and Aliases

Sometimes multiple terms refer to the same concept.

Example:

```
API Route  
Endpoint  
Route Entry
```

To prevent drift, the glossary must explicitly define **aliases**.

Example:

```
API Route → Endpoint  
Route Entry → Endpoint
```

The canonical term is always preferred.

Aliases exist only to support recognition.

---

# 5. Term Introduction Rules

New glossary terms should only be introduced when:

```
a concept appears in multiple architecture documents  
the concept cannot be expressed using existing terms
```

Unnecessary terms should be avoided.

Every glossary entry increases the cognitive load of the system.

---

# 6. Term Modification Rules

Modifying an existing term is risky.

Changing a definition may invalidate references across many documents.

When modification is necessary, the process should include:

```
review of referencing documents  
confirmation that meaning remains consistent  
documentation of the change
```

If the meaning changes significantly, a **new term** should be introduced instead.

---

# 7. Term Deprecation

Some concepts may become obsolete over time.

Deprecated terms should not be removed immediately.

Instead, they should be marked as:

```
Deprecated
```

Example:

```
Term: Module Graph  
Status: Deprecated  
Replacement: File Graph
```

This allows documentation history to remain understandable.

---

# 8. Relationship to Terminology Tracking

Phase C introduces automated terminology tracking.

See:

- [phase-c-doc-terminology.md](./phase-c-doc-terminology.md)

This system can detect:

```
undefined terms  
unused glossary entries  
unrecognized synonyms
```

Glossary governance ensures these reports can be resolved consistently.

---

# 9. Glossary Structure

The glossary file should maintain a predictable structure.

Each entry should include:

```
Term  
Definition  
Optional aliases  
Optional notes
```

Example:

```
Term: Graph Node

Definition:  
A discrete entity within the Code Graph representing a structural element of the system.

Aliases:  
Node
```

---

# 10. Documentation References

Architecture documents should prefer referencing canonical glossary terms.

Example usage:

```
The Endpoint Surface enumerates HTTP routes discovered in the codebase.
```

The term **Endpoint Surface** should exist in the glossary.

This ensures consistency across the documentation set.

---

# 11. Avoiding Terminology Drift

Terminology drift occurs when:

```
multiple names appear for the same concept  
definitions diverge across documents
```

Governance helps prevent this by enforcing:

```
canonical terms  
explicit alias mapping  
clear definitions
```

---

# 12. AI Context and Terminology

Glossary definitions also support AI tooling.

When an AI system encounters a glossary term, it can retrieve:

```
definition  
related architecture documents  
relevant code structures
```

This improves context precision in AI-assisted development.

---

# 13. Success Indicators

Glossary governance is working when:

```
documentation uses consistent terminology  
architecture documents reference glossary terms  
terminology drift reports are rare
```

This indicates the documentation system is structurally stable.

---

# 14. Summary

The glossary acts as the **terminology backbone** of the project.

Proper governance ensures that:

```
concepts remain stable  
documentation remains understandable  
architecture discussions remain precise
```

A stable terminology system is essential for maintaining a large technical documentation corpus.

