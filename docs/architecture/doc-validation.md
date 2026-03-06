# Documentation Validation

> Project working title: Code Graph (temporary name)

Depends on:
- [doc-linking-policy.md](./doc-linking-policy.md)
- [glossary-governance.md](./glossary-governance.md)
- [phase-c-doc-terminology.md](./phase-c-doc-terminology.md)
- [doc-authority.md](./doc-authority.md)
- [doc-invariants.md](./doc-invariants.md)
- [invariants.md](./invariants.md)

Status: Draft

---

# 1. Purpose

This document defines how **documentation correctness is validated**.

As documentation grows, several failure modes appear:

```
broken references  
terminology drift  
duplicate definitions  
authority conflicts
```

Documentation validation provides mechanisms to detect these issues early.

The goal is to ensure that the documentation set remains:

```
internally consistent  
structurally navigable  
aligned with architecture
```

---

# 2. Validation Scope

Documentation validation operates across the entire documentation tree:

```
docs/**
```

The system may analyze:

```
architecture documents  
design documents  
development guidelines  
roadmaps
```

Validation focuses on **structure and terminology**, not subjective writing quality.

---

# 3. Link Integrity Checks

All documentation links must resolve to valid files.

Validation should confirm:

```
referenced files exist  
relative paths resolve correctly  
renamed documents update references
```

Broken links indicate structural problems in the documentation graph.

---

# 4. Authority Verification

Certain documents are designated as **authority sources**.

Examples:

```
graph-model.md  
graph-views.md  
glossary.md  
invariants.md
```

Validation should confirm that:

```
secondary documents reference authority sources  
authority documents are not contradicted elsewhere
```

If multiple documents attempt to define the same concept, the authority hierarchy must be clarified.

---

# 4.1 Invariant Validation

Validation should enforce the documentation invariants defined in:

- [doc-invariants.md](./doc-invariants.md)

Examples of invariant checks:

```
canonical architecture documents are not redefined
design documents do not redefine architecture concepts
roadmaps do not define architecture
duplicate concept definitions are not introduced
```

Violations of these rules should be reported as **documentation invariant failures**.

These checks ensure that the documentation authority hierarchy remains intact
and that structural drift cannot accumulate unnoticed.

---

# 5. Terminology Validation

Phase C terminology tracking enables validation of glossary usage.

See:

- [phase-c-doc-terminology.md](./phase-c-doc-terminology.md)

Validation may detect:

```
undefined glossary terms  
unused glossary entries  
unrecognized synonyms
```

These signals help maintain conceptual stability across the documentation.

---

# 6. Glossary Consistency

Glossary entries should follow a consistent structure.

Each entry should include:

```
term name  
definition  
optional aliases
```

Validation may check for:

```
duplicate term definitions  
missing definitions  
improper alias references
```

---

# 7. Concept Duplication Detection

Documentation drift often occurs when multiple files define the same concept.

Example:

```
graph-model.md defines edge types  
graph-edge-kinds.md also defines edge types
```

Validation should identify duplicate concept definitions and recommend consolidation.

---

# 8. Dependency Header Verification

Architecture documents should include dependency headers.

Example:

```
Depends on:

- graph-model.md
- invariants.md
```

Validation may confirm that:

```
dependency headers reference valid documents  
declared dependencies actually exist
```

These headers help maintain visible knowledge relationships.

---

# 9. Authority Conflicts

Authority conflicts occur when two documents attempt to define the same canonical concept.

Example conflict:

```
graph-model.md defines node kinds  
graph-node-kinds.md defines a different node list
```

Validation should flag such conflicts so they can be resolved.

---

# 10. Terminology Usage Density

Terminology analysis may reveal anomalies.

Example signals:

```
frequently used terms missing from glossary  
rarely used glossary entries
```

These signals help identify conceptual drift or outdated definitions.

---

# 11. Structural Integrity Reports

Validation processes may produce reports such as:

```
broken links  
authority conflicts  
undefined glossary terms  
duplicate concept definitions
```

These reports allow maintainers to repair documentation before drift spreads.

---

# 12. Automation

Documentation validation can be integrated into automated workflows.

Example validation triggers:

```
pull request checks  
CI documentation verification  
scheduled repository audits
```

Automated validation helps prevent documentation degradation.

---
  
# 13.1 Machine Validation Targets  
  
The following properties should be machine-checkable:  
  
 `+valid file links +dependency header correctness +duplicate concept definitions +glossary usage consistency +authority conflicts +`  
  
These checks allow the documentation system to be analyzed as a **structured knowledge graph**.  
  
---

# 13. Relationship to Code Graph

The documentation set forms a **knowledge graph**.

Validation helps maintain the integrity of this graph.

Potential future analysis may include:

```
document dependency graphs  
authority hierarchy mapping  
terminology propagation analysis
```

These capabilities align with the broader goals of Code Graph.

---

# 14. Limitations

Documentation validation intentionally avoids:

```
subjective writing evaluation  
automated architecture interpretation  
AI-generated documentation corrections
```

The system focuses on **structural correctness and conceptual consistency**.

---

# 15. Summary

Documentation validation ensures that the project’s knowledge base remains stable and trustworthy.

Through automated checks and structural analysis, the system helps maintain:

```
link integrity  
terminology stability  
authority clarity
```

These properties are essential for long-term documentation health.

