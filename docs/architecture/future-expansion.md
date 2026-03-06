# Future Expansion

> Project working title: Code Graph (temporary name)

Depends on:
- [architecture-overview.md](./architecture-overview.md)
- [project-phases.md](./project-phases.md)
- [success-criteria.md](./success-criteria.md)
- [limitations-and-non-goals.md](./limitations-and-non-goals.md)
- [real-world-validation.md](./real-world-validation.md)
- [graph-model.md](./graph-model.md)
- [query-engine-architecture.md](./query-engine-architecture.md)

Status: Draft

---

# 1. Purpose

This document describes **possible future expansion directions** for Code Graph.

These directions are **not part of the initial project phases**.  
They represent potential capabilities that may be explored **only after the core architecture proves stable**.

Future expansion should never compromise the system’s foundational properties:

```
determinism  
bounded traversal  
structural correctness  
real-world usefulness
```

---

# 2. Expansion Philosophy

Expansion should follow a strict principle:

```
Stability first  
→ usefulness second  
→ expansion third
```

Many software analysis tools fail because they expand too quickly.

Code Graph should only expand when:

```
core architecture is proven stable  
real-world validation has succeeded  
developer workflows clearly benefit
```

---

# 3. Additional Language Support

The architecture is intentionally language-agnostic.

Future versions could support additional ecosystems such as:

```
Python  
Go  
Rust  
Java
```

However, language expansion introduces challenges:

```
parser differences  
symbol resolution differences  
build system differences
```

Each new language requires dedicated analysis infrastructure.

---

# 4. Cross-Language Graphs

Once multiple languages are supported, the system could build **cross-language graphs**.

Example:

```
frontend → backend API calls  
backend → database schema  
backend → background worker
```

Possible edges:

```
HTTP_CALLS  
EVENT_EMITS  
QUEUE_PUBLISHES  
QUEUE_CONSUMES
```

This would allow tracing information flows across system boundaries.

---

# 5. Database Schema Integration

Future versions may integrate database schemas into the graph.

Possible node types:

```
Table  
Column  
Index  
Migration
```

Possible edges:

```
READS_TABLE  
WRITES_TABLE  
DEPENDS_ON_TABLE
```

This would allow queries such as:

```
which endpoints write to this table?  
which services read from this table?
```

---

# 6. Runtime Observation Integration

Although Code Graph focuses on static analysis, runtime signals could optionally augment the graph.

Examples:

```
observed call paths  
runtime endpoint usage  
query frequency
```

Runtime data must remain **clearly separated** from static graph edges.

Static edges represent **structural truth**.

Runtime edges represent **observed behavior**.

---

# 7. Visualization Tools

Graph visualizations may eventually become useful for exploration.

Possible visual surfaces:

```
file dependency graphs  
symbol call graphs  
endpoint surfaces  
dataflow traces
```

Visualization should remain **optional tooling**, not a core architectural dependency.

The system must remain usable through:

```
CLI queries  
structured outputs
```

---

# 8. AI-Assisted Investigation

Code Graph can provide structured context to AI systems.

Possible AI integrations:

```
context pack generation  
targeted code explanation  
architectural anomaly detection
```

The graph provides **structured evidence**, allowing AI systems to operate with limited context windows.

This aligns with the design principles described in:

- `ai-context-pack.md`
- `context-pack-selection.md`

---

# 9. Architectural Drift Detection

Future versions could detect architectural drift over time.

Example signals:

```
increasing cyclic dependencies  
growing dependency fan-out  
service boundary erosion
```

These signals could help maintain architectural integrity in large systems.

---

# 10. Monorepo Support

Many modern systems are monorepos containing multiple services.

Future expansion could support:

```
service boundaries  
package-level graphs  
workspace dependency graphs
```

This would allow the system to trace interactions between services.

---

# 11. Incremental Indexing Improvements

Large repositories require efficient indexing.

Future improvements may include:

```
file-level change detection  
symbol-level change detection  
parallel indexing pipelines
```

These capabilities would improve performance without changing the graph model.

---

# 12. Developer Workflow Integration

The system could eventually integrate into common developer workflows.

Possible integration points:

```
pre-commit validation  
CI structural checks  
IDE queries
```

These integrations would help developers detect structural issues earlier.

---

# 13. Architectural Risk Detection

Advanced versions may identify structural risks such as:

```
unbounded dependency growth  
excessive coupling  
deep call chains
```

These insights could help teams maintain healthy architectures.

---

# 14. Expansion Governance

Future features should be evaluated against the following questions:

```
Does it improve structural understanding?  
Does it preserve deterministic behavior?  
Does it maintain bounded complexity?  
Does it provide real developer value?
```

If the answer to any of these questions is **no**, the feature should be reconsidered.

---

# 15. Summary

Future expansion opportunities exist in many directions.

Examples include:

```
additional language ecosystems  
cross-language system graphs  
database schema integration  
runtime observation signals  
AI-assisted investigation
```

However, these capabilities must only be explored **after the core system has proven stable and useful**.

The long-term success of Code Graph depends on **disciplined architectural growth**.

