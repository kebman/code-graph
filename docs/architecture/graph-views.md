# Graph Views Specification

> Project working title: Code Graph (temporary name)

This document defines the **layered graph views** of the system.

The graph is not monolithic.
It is composed of multiple abstraction layers ("views") that serve different reasoning tasks.

Each view must clearly define:

- Purpose
- Node types
- Edge types
- Aggregation rules
- Exclusions (v1)
- Drill-down / drill-up behavior

---

# 1. Design Principle

The graph must be:

- Layered
- Query-driven
- Bounded
- Explainable

The default graph must **not** explode in size.

v1 rule:

> Default views include files and exported symbols only.
> Local variables are excluded.

---

# 2. View 0 — Runtime / Topology View

## Purpose

Understand how the system runs:

- Docker services
- Build relationships
- Runtime boundaries
- Service dependencies

This view answers:

- What builds what?
- What runs where?
- What depends on what at runtime?

---

## Node Types

- Dockerfile
- docker-compose file
- Service
- Volume
- Environment file
- Exposed port (optional)

---

## Edge Types

- BUILDS (compose → Dockerfile)
- RUNS (compose → service)
- DEPENDS_ON (service → service)
- MOUNTS (service → volume/path)
- Runtime port exposure is metadata in v1; no canonical `EXPOSES` edge is defined.

---

## Exclusions (v1)

- No container runtime inspection
- No live network tracing
- No environment variable propagation modeling

---

## Drill Behavior

- Click Service → show source directory
- Click Dockerfile → show build context
- Click Service → jump to entrypoint file (if resolvable)

---

# 3. View 1 — File Dependency View

## Purpose

Provide architectural overview at file granularity.

This view answers:

- Which files depend on which?
- Where are dependency clusters?
- Are there import cycles?
- What is the blast radius of a file?

---

## Node Types

- File

---

## Edge Types

- IMPORTS
- Derived file-level aggregation may be exposed as `AGGREGATED_REFERENCE` in explain output (not a canonical EdgeKind enum).

---

## Aggregation Rules

Multiple symbol references between the same two files must be aggregated into a single file-level edge.

Edge metadata must include:

- Primary cause (import vs reference)
- Symbol list (top N)
- Reference count
- Example source locations

---

## Edge Explanation Contract

Clicking a file-level edge must reveal:

1. Whether the edge is caused by:
   - import
   - call
   - type usage
2. The involved exported symbols
3. Count of references
4. Example lines

---

## Exclusions (v1)

- No local variable-level edges
- No intra-function flow representation
- No inferred dynamic dependencies

---

## Drill Behavior

- Click file node → show exported symbols
- Click edge → show explanation panel
- Switch to Symbol View for deeper inspection

---

# 4. View 2 — Symbol View

## Purpose

Expose logical relationships between exported symbols.

This view answers:

- Who calls this function?
- What does this function call?
- Where is this class instantiated?
- What types does this function accept or return?

---

## Node Types

- Function (exported)
- Class (exported)
- Method (exported)
- Type (interface/type alias)
- Constant (exported)

---

## Edge Types

- CALLS
- INSTANTIATES
- REFERENCES
- ACCEPTS_TYPE
- RETURNS_TYPE
- CONTAINS (File → Symbol)

---

## Aggregation Rules

- Multiple call sites may be aggregated.
- Evidence metadata must preserve file + location.

---

## Edge Explanation Contract

Clicking a symbol-level edge must reveal:

- Call site file(s)
- Line/column
- Call count
- Type context (if available)

---

## Exclusions (v1)

- No local function symbol nodes
- No private/internal class member graphing
- No full dynamic dispatch modeling

---

## Drill Behavior

- Click symbol → show:
  - callers
  - callees
  - accepted types
  - returned types
- Expand path view for multi-hop traversal

---

# 5. View 3 — Information Flow View (Query-Generated)

## Purpose

Trace how information moves and morphs across boundaries.

This view is not rendered globally.
It is generated per query.

This view answers:

- Where does this value originate?
- How does it transform?
- Where does it end up?
- Does it reach a DB or HTTP response?

---

## Node Types

- Symbol (function boundary)
- Type (when flow/type context is available)
- Sink (db_write, http_response, logger)

---

## Edge Types

- VALUE_FLOW
- WRITES_DB
- RESPONDS_WITH

---

## Flow Scope (v1)

Only cross-function boundaries are tracked:

- Parameter → call argument
- Return → call site
- Symbol → DB write
- Symbol → HTTP response

No intra-function local tracking.

---

## Transform Edge Status (v1)

`TRANSFORMS` is a post-v1 extension and is not part of the v1 edge surface.
v1 flow uses only canonical flow edges plus evidence metadata for explanations.

---

## Depth Rules

Flow queries must:

- Require explicit or default depth limit
- Stop at terminal edges (DB, HTTP response)
- Prevent graph explosion

---

# 6. View Transitions

The system must support clear transitions:

Runtime View
→ File View
→ Symbol View
→ Flow View

Users must never be forced into a global graph.

Each deeper view must be explicitly invoked.

---

# 7. Module-Level Aggregation (Optional v1.5)

File clusters may be aggregated by:

- Folder boundary
- Import density
- Shared types

Module view is derived from File View.

Not required for initial v1.

---

# 8. Default Safety Rules

- No infinite-depth traversal
- No global rendering of entire symbol graph
- No automatic local variable indexing
- Always bounded by query

---

# 9. Future Extensions (Post v1)

- Intra-function flow
- Field-level morph tracking
- Schema-aware transformation detection
- Runtime trace overlay
- Interactive graph visualization layer

---

# Status

This document defines the structural layering of the graph system.

Any new node or edge type must be explicitly added here before implementation.
