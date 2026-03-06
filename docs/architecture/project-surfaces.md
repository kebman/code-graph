# Project Surfaces

> Project working title: Code Graph (temporary name)

Depends on:
- [architecture-overview.md](./architecture-overview.md)
- [graph-model.md](./graph-model.md)
- [graph-views.md](./graph-views.md)
- [invariants.md](./invariants.md)
- [project-phases.md](./project-phases.md)
- [endpoint-surface.md](./endpoint-surface.md)
- [docs-term-graph.md](./docs-term-graph.md)

Status: Draft

---

# 1. Purpose

This document defines the concept of **Project Surfaces**.

A surface is a **derived representation of the graph designed to solve a specific class of developer problems**.

The core graph contains the canonical nodes and edges of the system.  
Surfaces transform that graph into **problem-oriented views**.

Examples:

- Endpoint inventory
- API contract alignment
- Documentation terminology tracking
- Context packs for AI tools

Surfaces are where the system becomes useful to developers.

---

# 2. Core Principle

The system architecture separates three layers:

```
Graph Model  
→ Graph Queries  
→ Surfaces
```

Meaning:

1. The **graph model** captures objective structure.
2. The **query engine** traverses that structure.
3. **Surfaces present answers to real engineering questions.**

Surfaces must never invent data.

They must derive their results from graph evidence.

---

# 3. Why Surfaces Exist

A raw graph is powerful but difficult to use directly.

Engineers rarely ask questions like:

```
show nodes reachable from X
```

Instead they ask:

```
Which endpoints exist?  
What calls this function?  
Where does this data end up?  
Which docs mention this concept?
```

Surfaces translate these questions into structured outputs.

---

# 4. Surface Characteristics

Every surface must follow these rules.

## 4.1 Evidence Based

Surfaces must derive their results from:

- indexed code evidence
- canonical nodes and edges
- deterministic traversal

They must not introduce speculative relationships.

---

## 4.2 Deterministic

Given the same repository state, surfaces must always produce identical output.

This supports:

- reproducible analysis
- CI validation
- contract diffing
- stable AI context packs

---

## 4.3 Bounded

Surfaces must operate within limits defined in:

- [invariants.md](./invariants.md)

Examples of boundaries:

- no deep intra-function flow graphing in v1
- no speculative runtime inference
- no automatic synonym generation

---

# 5. Surface Categories

Code Graph currently recognizes three categories of surfaces.

---

# 6. Structural Surfaces

Structural surfaces expose the **core structure of code**.

These correspond closely to the canonical views.

Examples:

```
File dependency surface  
Symbol relationship surface  
Runtime topology surface  
Flow tracing surface
```

These are essentially applications of:

- View 0 (runtime)
- View 1 (file)
- View 2 (symbol)
- View 3 (flow)

Structural surfaces form the foundation of the system.

---

# 7. Domain Surfaces

Domain surfaces expose **problem-specific engineering information**.

They combine evidence from multiple views.

Examples include:

```
Endpoint surface  
Service boundary surface  
Database interaction surface  
Contract drift surface
```

The first planned domain surface is:

See:
- [endpoint-surface.md](./endpoint-surface.md)

Domain surfaces are where the graph begins solving real developer problems.

---

# 8. Documentation Surfaces

Documentation surfaces connect the code graph to the project's written knowledge.

Examples:

```
Glossary term graph  
Term usage tracking  
Documentation drift detection  
Concept-to-code mapping
```

See:

- [docs-term-graph.md](./docs-term-graph.md)

Documentation surfaces remain bounded and explicit.

They must not attempt general natural language understanding.

---

# 9. Surface Construction

A surface typically follows this pipeline:

```
1. Graph indexing
2. Node/edge normalization
3. Query traversal
4. Evidence aggregation
5. Surface-specific output formatting
```

Surfaces should not require new indexing passes.

They should operate on the existing graph.

---

# 10. Surface Output

Surface outputs may include:

```
structured JSON  
CLI tables  
reports  
graph slices  
context packs
```

Outputs must include **evidence references** such as:

```
file path  
line number  
symbol name  
node ID  
edge ID
```

This ensures all results are verifiable.

---

# 11. Relationship to Queries

Surfaces are built on top of queries.

Example:

```
Query: callers(handlerSymbol)
```

Surface usage:

```
Endpoint surface → determine which endpoints reach handlerSymbol
```

Queries provide the primitives.

Surfaces assemble those primitives into developer-facing results.

---

# 12. Example Surface Workflow

Example question:

```
Which endpoints write to the database?
```

Surface pipeline:

```
Endpoint surface  
→ identify handlers  
→ traverse CALLS edges  
→ locate WRITES_DB edges  
→ aggregate results  
→ output endpoint list
```

The surface converts graph traversal into an actionable engineering answer.

---

# 13. Interaction with AI Tools

Surfaces are especially useful for AI-assisted development.

AI tools often struggle with large codebases due to context limits.

Surfaces can provide focused inputs such as:

```
endpoint slice  
call chain slice  
relevant docs slice
```

This enables efficient **AI context packs**.

See:

- [ai-context-pack.md](./ai-context-pack.md)

---

# 14. Risks

## 14.1 Surface Proliferation

If surfaces multiply without discipline, the system becomes fragmented.

Mitigation:

- require clear problem statements
- ensure surfaces derive from the canonical graph
- document each surface architecture

---

## 14.2 Hidden Logic

If surfaces embed complex logic that is not documented, the system becomes opaque.

Mitigation:

- document each surface explicitly
- reference graph primitives clearly

---

## 14.3 Data Duplication

Surfaces must not duplicate canonical graph data.

Mitigation:

- surfaces derive from queries
- graph model remains single source of truth

---

# 15. Future Surfaces

Possible future surfaces include:

```
dependency risk surface  
security exposure surface  
permission boundary surface  
schema propagation surface
```

These should only be introduced if they remain bounded and evidence-based.

---

# 16. Summary

Project Surfaces provide the bridge between:

```
raw graph structure  
and  
real developer questions
```

The architecture therefore separates:

```
Graph Model  
Query Engine  
Surfaces
```

This structure keeps the system:

- disciplined
- extensible
- practical

while ensuring the canonical graph remains the single source of truth.

