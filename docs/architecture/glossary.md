# Glossary (v1)

Depends on:
- [Architecture Overview](./architecture-overview.md)
- [Graph Model Specification](./graph-model.md)
- [Graph Views Specification](./graph-views.md)
- [Architectural Invariants (v1)](./invariants.md)
- [Roadmap – v1](../roadmaps/roadmap-v1.md)

Status: Draft

---

## Scope

This glossary is constrained to v1:
- exported-symbol-only
- depth-bounded
- no intra-function flow
- no speculative inference

See also: [Graph Model](./graph-model.md), [Graph Views](./graph-views.md), [Invariants](./invariants.md), [Roadmap v1](../roadmaps/roadmap-v1.md).

---

## Canonical Terms

### File
A `File` is a source-file node in View 1 with stable ID format `file::<normalized_path>`.
It is the base unit for import relationships (`IMPORTS`) and file-level aggregation.
Source of truth: [graph-model.md](./graph-model.md).

### Module
A `Module` is an optional derived grouping of files (for example by folder/import density).
In v1, module clustering is utility output, not a primary graph node type.
Source of truth: [graph-views.md](./graph-views.md) (module aggregation is optional v1.5).

### Symbol
A `Symbol` is an exported program element in View 2 (`function`, `class`, `method` exported only, `type`, `const`).
It has stable ID format `symbol::<file_id>::<symbol_name>::<symbol_kind>`.
Source of truth: [graph-model.md](./graph-model.md), [invariants.md](./invariants.md).

### Type
A `Type` is an explicit or symbol-reused representation of interface/type-alias/schema relationships used by `ACCEPTS_TYPE` and `RETURNS_TYPE`.
In v1, explicit `Type` nodes are optional and may be merged into `Symbol` nodes.
Source of truth: [graph-model.md](./graph-model.md).

### Sink
A `Sink` is a terminal boundary for flow traversal (for example `db_write`, `http_response`, `logger`).
Flow queries stop at sink boundaries in v1 unless future scope changes.
Source of truth: [graph-model.md](./graph-model.md), [invariants.md](./invariants.md).

### Source
A `Source` is the query start boundary for flow reasoning (for example a controller entry symbol or explicit source selection in `trace`).
In v1, source handling is query-driven and bounded; no speculative source inference is allowed.
Source of truth: [graph-views.md](./graph-views.md), [query-engine-architecture.md](./query-engine-architecture.md).

### Transform
A `Transform` is a post-v1 flow concept for explicit transformation edges.
In v1, `TRANSFORMS` is not part of the canonical edge surface.
Source of truth: [graph-model.md](./graph-model.md), [graph-views.md](./graph-views.md).

### View 0
Runtime/topology view: Docker/compose/service/build/dependency structure.
Purpose: runtime boundaries and service relationships.
Source of truth: [graph-views.md](./graph-views.md).

### View 1
File dependency view: `File` nodes with canonical `IMPORTS` edges.
File-level aggregated reference explanations may be shown as derived `AGGREGATED_REFERENCE` relation output.
Purpose: architecture overview, cycles, file blast radius.
Source of truth: [graph-views.md](./graph-views.md).

### View 2
Symbol view: exported symbols and structural relationships (`CALLS`, `REFERENCES`, `INSTANTIATES`, type edges).
Purpose: caller/callee reasoning and symbol blast radius.
Source of truth: [graph-views.md](./graph-views.md), [graph-model.md](./graph-model.md).

### View 3
Query-generated information-flow view (not globally materialized).
Purpose: bounded cross-function tracing to terminal boundaries.
Source of truth: [graph-views.md](./graph-views.md), [query-engine-architecture.md](./query-engine-architecture.md).

### Edge Explanation Contract
The edge explanation contract is the required evidence payload for presenting an edge to users (`click edge -> explain`).
At minimum it includes edge kind, primary cause, involved symbols (when applicable), count/aggregation signal, and concrete source locations.
Source of truth: [edge-explanations.md](./edge-explanations.md), [graph-views.md](./graph-views.md), [query-engine-architecture.md](./query-engine-architecture.md).

### Aggregation
Aggregation combines repeated relations into one stable edge while retaining trace evidence (count + sample locations).
Aggregation is allowed for same-node-pair references/calls but must never remove explainability.
Source of truth: [graph-model.md](./graph-model.md), [invariants.md](./invariants.md).

### Runtime Node
A `Runtime` node is a canonical v1 node kind for runtime topology entities (for example Dockerfile, compose, service).
Source of truth: [graph-model.md](./graph-model.md), [graph-views.md](./graph-views.md).

### Dockerfile
A `Dockerfile` is a runtime/topology entity represented by a `Runtime` node in View 0.
It participates in runtime relationships such as build wiring.
Source of truth: [graph-model.md](./graph-model.md), [graph-views.md](./graph-views.md).

### Compose
`Compose` refers to docker-compose configuration represented as a `Runtime` node in View 0.
It connects runtime entities through canonical runtime edges.
Source of truth: [graph-model.md](./graph-model.md), [graph-views.md](./graph-views.md).

### Service
A `Service` is a runtime/topology entity represented by a `Runtime` node in View 0.
It participates in runtime dependency and execution relationships.
Source of truth: [graph-model.md](./graph-model.md), [graph-views.md](./graph-views.md).

### CONTAINS
`CONTAINS` is a canonical structural edge kind from `File` to `Symbol`.
Source of truth: [graph-model.md](./graph-model.md).

### ACCEPTS_TYPE
`ACCEPTS_TYPE` is a canonical structural edge kind from `Symbol` to `Type/Symbol`.
Source of truth: [graph-model.md](./graph-model.md).

### RETURNS_TYPE
`RETURNS_TYPE` is a canonical structural edge kind from `Symbol` to `Type/Symbol`.
Source of truth: [graph-model.md](./graph-model.md).

### VALUE_FLOW
`VALUE_FLOW` is a canonical v1-limited flow edge kind for cross-function boundary flow.
Source of truth: [graph-model.md](./graph-model.md), [invariants.md](./invariants.md).

### WRITES_DB
`WRITES_DB` is a canonical terminal flow edge kind from `Symbol` to `Sink`.
Source of truth: [graph-model.md](./graph-model.md), [graph-views.md](./graph-views.md).

### RESPONDS_WITH
`RESPONDS_WITH` is a canonical terminal flow edge kind from `Symbol` to `Sink`.
Source of truth: [graph-model.md](./graph-model.md), [graph-views.md](./graph-views.md).

---

## TODO (needs decision)

- Source taxonomy is only partially specified in current v1 docs (sinks are explicit; source categories are less explicit). Finalize canonical source categories before widening `trace` UX.
