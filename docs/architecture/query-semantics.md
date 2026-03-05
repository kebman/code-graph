# Query Semantics

Status: Draft

Depends on:

- [Graph Model Specification](./graph-model.md)
- [Graph Views Specification](./graph-views.md)
- [Graph Edge Kinds](./graph-edge-kinds.md)
- [Graph Traversal Rules](./graph-traversal-rules.md)
- [Architectural Invariants](./invariants.md)
- [Query Engine Design](../designs/query-engine.md)
- [Output Format Design](../designs/output-format.md)
- [CLI Design](../designs/cli.md)

This document defines the v1 semantic contract for query behavior.

---

# Scope

This document defines v1 semantics for:
- `index`
- `callers`
- `callees`
- `blast`
- `paths`
- `cycles`
- `deadExports`
- `trace`
- `pack`

No behavior beyond v1 boundaries is introduced:
- exported-symbol-only
- depth-bounded
- no intra-function flow
- no speculative inference

---

# Shared Conventions

## Deterministic ordering
Results must be stable across runs for identical graph state.

## Depth bounds
Traversals must use explicit or safe default depth with truncation signaling when limits are hit.

## Evidence
Results must include evidence for why nodes/edges were returned.

## View mapping (canonical)
Views must map exactly as defined in [graph-views.md](./graph-views.md):
- View 0: runtime topology
- View 1: file dependency
- View 2: symbol relationships
- View 3: information flow / context-pack output surface

---

# Query: index

### Purpose
Build or refresh indexed graph primitives.

### View(s)
- Produces View 1 and View 2 primitives as v1 minimum.
- May also produce View 0 runtime primitives when runtime extraction inputs are present.

### Output
- graph build summary
- warnings/errors

---

# Query: callers

### Purpose
Find symbols that call a target symbol.

### View(s)
- View 2

### Semantics
- Reverse traversal over incoming `CALLS` edges.
- Depth-bounded.

### Output
- caller symbols
- traversed `CALLS` edges
- evidence and truncation flags

---

# Query: callees

### Purpose
Find symbols called by a source symbol.

### View(s)
- View 2

### Semantics
- Forward traversal over outgoing `CALLS` edges.
- Depth-bounded.

### Output
- callee symbols
- traversed `CALLS` edges
- evidence and truncation flags

---

# Query: blast

### Purpose
Estimate downstream impact for a changed file or symbol.

### View(s)
- View 1 for file input
- View 2 for symbol input

### Semantics (file input)
- Start at file node.
- Traverse forward `IMPORTS` edges.
- File-level aggregation may include derived `AGGREGATED_REFERENCE` explanation metadata; this is not a canonical persisted EdgeKind enum.

### Semantics (symbol input)
- Start at symbol node.
- Traverse forward `CALLS`, `REFERENCES`, and `INSTANTIATES` edges.

### Output
- impacted nodes/edges
- evidence and truncation flags

---

# Query: paths

### Purpose
Find bounded paths between two nodes.

### View(s)
- View 1 for file inputs
- View 2 for symbol inputs

### Semantics
- Enumerate paths up to `maxDepth` and `maxPaths`.
- Deterministic, cycle-aware traversal.

### Output
- path list
- nodes/edges participating in returned paths
- truncation flags

---

# Query: cycles

### Purpose
Detect cycles.

### View(s)
- View 1 for import cycles
- View 2 for call cycles

### Semantics
- View 1: SCC detection over `IMPORTS` edges.
- View 2: call-cycle detection over `CALLS` edges.

### Output
- cycle groups/paths
- involved nodes/edges
- evidence and limits

---

# Query: deadExports

### Purpose
Identify exported symbols with no inbound usage in the indexed repository.

### View(s)
- View 2

### Semantics
For each exported symbol `S`, inspect inbound:
- `CALLS`
- `REFERENCES`
- optional `INSTANTIATES` when relevant

If no qualifying inbound edges exist (excluding self edges), `S` is a dead export candidate.

### Output
- dead-export symbol set
- evidence and truncation flags

---

# Query: trace

### Purpose
Run bounded cross-function information-flow tracing.

### View(s)
- View 3

### Semantics
Supported v1 forms:
1. `trace(source, --to sink)`
2. `trace(from, to)`

Traversal is bounded and evidence-based, using flow-relevant edges:
- `CALLS`
- `ACCEPTS_TYPE`
- `RETURNS_TYPE`
- `VALUE_FLOW`
- terminal sink edges (`WRITES_DB`, `RESPONDS_WITH`)

No intra-function local propagation is modeled.
Standalone neighborhood tracing (`trace(node)`) is out of scope for v1.

### Output
- path-oriented flow results
- evidence required per hop
- truncation flags

---

# Query: pack

### Purpose
Build an AI context pack from bounded query results.

### View(s)
- View 3

### Semantics
- Resolve seed and related bounded paths.
- Select files/snippets deterministically.
- Respect explicit size/token limits.

### Output
- selected files/snippets
- supporting graph evidence
- truncation metadata

See:
- [AI Context Pack](./ai-context-pack.md)
- [Context Pack Selection](./context-pack-selection.md)

---

# Compatibility Notes

- File-level queries should not emit symbol-level paths unless explicitly requested.
- Symbol-level queries may include file context where required by output format.
- Output must conform to [output-format.md](../designs/output-format.md).

---

# TODO (needs decision)

- Confirm whether `blast(file)` should include only `IMPORTS` traversal or also include query-time projected file-level aggregation from symbol evidence by default.
- If neighborhood tracing is needed in the future, define it as a separate command contract (not `trace` v1 semantics).
