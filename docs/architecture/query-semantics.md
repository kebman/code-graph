# Query Semantics

Status: Draft

Depends on:

- docs/architecture/graph-model.md
- docs/architecture/graph-views.md
- docs/architecture/graph-edge-kinds.md
- docs/architecture/graph-traversal-rules.md
- docs/architecture/invariants.md
- docs/designs/query-engine.md
- docs/designs/output-format.md
- docs/designs/cli.md

This document defines the meaning (“semantics”) of the v1 query set.

A query’s semantics are the contract that implementations must follow.  
This prevents drift between CLI behavior, query engine behavior, and documentation.


---

# Scope

This document defines v1 semantics for these query names:

- index
- callers
- callees
- blast
- paths
- cycles
- deadExports
- trace
- pack

Semantics here are defined in terms of:

- graph views (View 0–3)
- node kinds and edge kinds
- traversal rules (direction, depth bounds, ordering)
- output format (nodes, edges, paths, evidence, truncation)

No new features beyond v1 scope are introduced.


---

# Shared Conventions

All queries must follow these shared rules.


## Deterministic ordering

Results must be ordered deterministically (stable across runs).

See:

- docs/architecture/graph-traversal-rules.md
- docs/architecture/id-and-normalization.md


## Depth bounds

If a query traverses edges, it must have:

- a default depth limit
- an explicit override parameter (where exposed via CLI)
- truncation flags in output when the limit is hit


## Evidence

Queries must include evidence sufficient to explain:

- why a node/edge was included
- which edges were traversed (or why traversal stopped)

Evidence format aligns with:

- docs/designs/output-format.md
- docs/architecture/edge-explanations.md


## View selection

Each query declares which graph view(s) it uses:

- View 0: file-level graph (IMPORTS + AGGREGATED_REFERENCE)
- View 1: symbol-level graph (CALLS / REFERENCES / INSTANTIATES)
- View 2: (if defined in graph-views.md; otherwise reserved)
- View 3: AI context pack mode (selection + snippets)

See:

- docs/architecture/graph-views.md


---

# Query: index

### Purpose

Build or refresh the graph index from the repository.

### View(s)

- Produces View 0 and View 1 inputs (minimum for v1)

### Semantics

- Runs the graph build pipeline:
  - file discovery (deterministic)
  - parsing
  - node creation
  - edge creation
  - validation
  - persistence (if enabled)

See:

- docs/architecture/graph-build-pipeline.md
- docs/architecture/graph-validation.md

### Output

- summary counts: nodes, edges
- warnings/errors (if any)
- optional snapshot metadata

Truncation does not apply.


---

# Query: callers

### Purpose

Given a target symbol, find symbols that call it.

### View(s)

- View 1 (symbol-level)

### Edge direction

- Reverse traversal over CALLS edges:
  - caller → CALLS → callee
  - callers(target) follows incoming CALLS edges

### Semantics

- Input identifies a symbol node (or resolves to one).
- Return the set of symbol nodes with a CALLS edge to the target.
- Optional depth > 1 returns transitive callers, bounded by depth.

### Output

- nodes: caller symbols (and optionally intermediate symbols for depth>1)
- edges: CALLS edges on returned paths
- paths (when depth>1 or when explicitly requested)
- evidence + truncation flags


---

# Query: callees

### Purpose

Given a source symbol, find symbols it calls.

### View(s)

- View 1 (symbol-level)

### Edge direction

- Forward traversal over CALLS edges.

### Semantics

- Input identifies a symbol node (or resolves to one).
- Return the set of symbol nodes reachable via CALLS from the source.
- Optional depth > 1 returns transitive callees, bounded by depth.

### Output

Same structure as callers.


---

# Query: blast

### Purpose

Estimate downstream impact of changing a file or symbol.

### View(s)

- View 0 for file-level impact
- View 1 for symbol-level impact (if input is a symbol)

### Semantics (file input)

- Start node: file node
- Traverse forward edges:
  - IMPORTS
  - AGGREGATED_REFERENCE
- Return the reachable set within depth bound.
- This is a structural approximation (no runtime inference).

### Semantics (symbol input)

- Start node: symbol node
- Traverse forward edges:
  - CALLS
  - REFERENCES
  - INSTANTIATES (when type relationships affect downstream usage)
- Return reachable set within depth bound.

### Output

- nodes: impacted nodes
- edges: the traversed relationships
- evidence + truncation flags


---

# Query: paths

### Purpose

Find relationship paths between two nodes (file↔file or symbol↔symbol).

### View(s)

- View 0 for file inputs
- View 1 for symbol inputs

### Semantics

- Input: (from, to)
- Enumerate paths up to:
  - maxDepth
  - maxPaths
- Path enumeration must be deterministic and cycle-aware.
- If no path exists, return empty result with evidence.

### Output

- paths: list of node+edge sequences
- nodes/edges: union of elements referenced by returned paths
- truncation flags if maxDepth/maxPaths hit


---

# Query: cycles

### Purpose

Detect cycles in the graph.

### View(s)

- View 0 for import cycles
- Optionally View 1 for call cycles (if included in v1)

### Semantics (View 0)

- Identify strongly connected components (SCCs) over IMPORTS edges.
- Return SCCs of size > 1 (and optionally self-cycles if supported).

### Output

- cycles: SCC groups or explicit cycle paths
- nodes/edges involved
- evidence describing detection method and limits


---

# Query: deadExports

### Purpose

Identify exported symbols that have no inbound references within the indexed repository.

### View(s)

- View 1 (symbol-level), using exported symbols subset

### Semantics

For each exported symbol S:

- Consider inbound relationships:
  - CALLS to S
  - REFERENCES to S
  - (optional) INSTANTIATES if S is a type
- If there are zero inbound edges from any other symbol/file (excluding self edges),
  S is a dead export candidate.

Notes:

- This is a structural heuristic based on indexed relationships.
- It does not account for dynamic imports, reflection, or runtime lookup.

### Output

- nodes: dead export symbols
- evidence: why each was flagged
- truncation if scanning is bounded


---

# Query: trace

### Purpose

Explain why a node appears in results or how it relates to another node.

### View(s)

- View depends on input kind (file vs symbol)

### Semantics

Two common forms:

1) trace(node)
- Return inbound/outbound neighborhood within small depth (default 1 or 2)
- Focus on producing evidence-rich edge explanations

2) trace(from, to)
- Equivalent to paths(from, to) with stricter limits and more evidence

### Output

- nodes/edges neighborhood or path set
- evidence is mandatory


---

# Query: pack

### Purpose

Generate an AI Context Pack: curated code context for AI reasoning.

### View(s)

- View 3

### Semantics

- Inputs define a seed (file/symbol/query result).
- Selection uses graph relationships + deterministic ordering.
- Output includes:
  - selected files/snippets
  - graph evidence linking selections back to the seed
  - truncation metadata

Full details are specified in:

- docs/architecture/ai-context-pack.md


---

# Query Compatibility Notes

- File-level queries must not return symbol nodes unless explicitly requested.
- Symbol-level queries may include file nodes as “containers” only when required by output format.
- All queries must produce output compatible with:

docs/designs/output-format.md


---

# Long-Term Goal

These semantics define the stable contract for v1 behavior.

As the system evolves, semantic changes must be:

- documented here
- recorded as ADRs if they alter meaning
- reflected in CLI and output format docs

