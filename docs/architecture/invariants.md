# Architectural Invariants (v1)

> Project working title: Code Graph (temporary name)

This document defines the non-negotiable rules of the system.

Invariants exist to:

- Prevent scope creep
- Prevent graph explosion
- Preserve determinism
- Maintain architectural clarity
- Protect v1 delivery

Any change to these invariants requires explicit architectural approval.

---

# 1. Scope Invariants

## 1.1 Exported-Symbol-Only Rule (v1)

Only exported symbols are indexed.

Excluded:

- Local functions
- Local variables
- Private class members
- Block-scoped variables
- Internal closures

Rationale:
Indexing locals causes graph explosion and complexity disproportionate to v1 goals.

---

## 1.2 No Intra-Function Dataflow (v1)

The system does not track:

- Variable reassignments inside a function
- Property mutations
- Loop-level propagation
- Conditional branch merging

Only cross-function boundary transitions are modeled.

---

## 1.3 Depth-Bounded Traversal

All queries must:

- Require explicit depth
- Or apply a safe default depth
- Never allow infinite traversal

No query may perform unbounded traversal.

---

## 1.4 No Speculative Inference

The system must not:

- Guess dynamic dispatch targets
- Infer runtime-only relationships
- Create synthetic edges without explicit evidence

All edges must originate from static analysis evidence.

---

# 2. Determinism Invariants

## 2.1 Stable Node IDs

Node IDs must be stable across re-index runs if:

- File path unchanged
- Symbol declaration unchanged

No time-based or random ID generation allowed.

---

## 2.2 Stable Edge IDs

Edge IDs must be stable if:

- Source and target unchanged
- Edge type unchanged
- Evidence location unchanged

---

## 2.3 Order Stability

All query results must:

- Be sorted deterministically
- Produce identical output for identical graph state
- Avoid nondeterministic iteration order

This is required for:

- Testing
- Diffing
- AI reproducibility

---

# 3. Graph Size Control Invariants

## 3.1 Aggregation Rule

Multiple references between same nodes may be aggregated.

However:

- At least one concrete evidence location must remain available.
- Aggregation must not erase traceability.

---

## 3.2 No Global Symbol Rendering

The system must not:

- Render entire symbol graph by default
- Expand all nodes automatically
- Perform global visualization without filtering

All expansions must be explicitly requested.

---

## 3.3 Node Type Control

No new node types may be introduced without:

1. Updating `graph-model.md`
2. Updating `graph-views.md`
3. Architectural approval

---

# 4. Query Engine Safety Invariants

## 4.1 Hard Limits

The Query Engine must enforce:

- Maximum depth
- Maximum path count
- Maximum node expansion

If limits are exceeded:

- Results must be truncated
- Truncation must be explicitly indicated

---

## 4.2 Terminal Boundaries

Flow traversal must stop at:

- WRITES_DB
- RESPONDS_WITH
- Explicit Sink nodes

Unless explicitly overridden in future versions.

---

# 5. Storage Invariants

## 5.1 Storage Neutrality

The architecture must not:

- Depend on a specific graph database
- Encode traversal logic in storage layer

Graph Store is passive.
Traversal logic lives in Query Engine.

---

## 5.2 No Derived Path Persistence

The system must not store:

- Precomputed multi-hop paths
- Derived transitive closures

Only primitive edges are stored.

---

# 6. Indexing Invariants

## 6.1 Incremental Safety

Incremental indexing must:

- Remove stale edges before re-indexing file
- Avoid partial graph corruption
- Preserve unaffected node IDs

Full rebuild must always be available.

---

## 6.2 No Partial Symbol Nodes

A symbol node must not exist without:

- A valid containing file
- A resolved symbol declaration

Orphan nodes are not allowed.

---

# 7. Runtime Boundary Invariants

## 7.1 View Separation

Runtime View (Docker topology) must remain logically separate from:

- File graph
- Symbol graph
- Flow graph

Cross-view edges must be explicitly defined.

---

# 8. Flow Modeling Invariants (v1)

## 8.1 Cross-Boundary Only

VALUE_FLOW edges must only represent:

- Parameter → call argument
- Return → call site
- Symbol → Sink

No intra-function propagation.

---

## 8.2 Heuristic Transformations

Transform detection must be:

- Conservative
- Evidence-based
- Marked as heuristic

Heuristics must not be treated as guaranteed truth.

---

# 9. CLI Invariants

The CLI must:

- Be deterministic
- Never modify graph during query
- Separate index and query commands
- Provide structured output option (JSON)

---

# 10. Explicit Non-Goals (Protected by Invariant)

The following are explicitly out of scope for v1:

- Full taint analysis
- Complete type propagation graph
- Runtime execution simulation
- Automated refactor generation
- AI-driven speculative linking

These must not be introduced without version boundary expansion.

---

# 11. Change Control

Any proposal that:

- Adds new node types
- Adds new edge types
- Expands to local variable indexing
- Introduces unbounded traversal

Must:

1. Update this document.
2. Update graph-model.md.
3. Update graph-views.md.
4. Explicitly mark version change.

---

# Status

These invariants define the safety rails for v1.

Violating them risks:

- Graph explosion
- Scope collapse
- Non-deterministic behavior
- Delivery failure

They exist to keep the system buildable and usable.

