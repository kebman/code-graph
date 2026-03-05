# Testing Strategy (v1)

Depends on:
- [Architectural Invariants (v1)](./invariants.md)
- [Graph Model Specification](./graph-model.md)
- [ID and Normalization Rules](./id-and-normalization.md)
- [Indexer Design (v1)](../designs/indexer.md)
- [Query Engine Design (v1)](../designs/query-engine.md)
- [Roadmap – v1](../roadmaps/roadmap-v1.md)

Status: Draft

---

## Scope

This test strategy is constrained to v1:
- exported-symbol-only
- depth-bounded
- no intra-function flow
- no speculative inference

See also: [Graph Model](./graph-model.md), [Graph Views](./graph-views.md), [Invariants](./invariants.md), [Roadmap v1](../roadmaps/roadmap-v1.md).

---

## Objectives

- Prove determinism across index/query runs.
- Prevent invariant drift during implementation.
- Validate incremental indexing correctness against full rebuild baseline.
- Keep fixtures bounded to v1 graph scope.

---

## Test Categories

### 1) Determinism Tests

Required checks:
- identical repository state -> identical node IDs and edge IDs.
- identical query inputs -> identical sorted outputs.
- evidence order remains stable.

Core references:
- [invariants.md](./invariants.md)
- [id-and-normalization.md](./id-and-normalization.md)

### 2) Snapshot Strategy

Snapshot levels:
- index snapshots: normalized node/edge exports.
- query snapshots: `callers`, `callees`, `blast`, `paths`, `cycles`, `deadExports`, `trace`, `pack` JSON output.

Rules:
- snapshot format must use deterministic ordering.
- snapshot diffs must be reviewable (human-readable stable keys).
- avoid snapshotting nondeterministic fields (timestamps, machine paths).

### 3) Fixture Repository Strategy

Maintain small fixture repos/workspaces representing v1 cases:
- `fixture-files`: imports and file cycles.
- `fixture-symbols`: exported symbol references/calls.
- `fixture-flow`: controller -> service -> sink flow.
- `fixture-incremental`: controlled file edits/renames/re-exports.

Fixture rules:
- include only exported-symbol-level structures.
- no local-variable flow assertions.
- each fixture includes expected nodes/edges and expected CLI query outcomes.

### 4) Incremental Index Verification

For each incremental scenario:
1. Run full index baseline.
2. Apply controlled file changes.
3. Run incremental index.
4. Run full rebuild.
5. Compare normalized graph outputs for equality.

Scenarios:
- file content change (same path)
- file rename
- export rename
- added/removed import
- added/removed call edge

Pass condition:
- incremental output equals full rebuild output for same final state.

---

## Milestone-Aligned Test Gates

### M1 Gate
- file import extraction correctness
- deterministic file-node/import-edge snapshots

### M2 Gate
- exported symbol extraction correctness
- reference aggregation explainability

### M3 Gate
- caller/callee/path traversal depth-limit enforcement
- deterministic path ordering

### M4 Gate
- cycle detection regression set
- dead export accuracy checks

### M5 Gate
- incremental vs full rebuild equivalence suite
- ID stability checks across unchanged entities

### M6 Gate
- trace terminal-boundary tests (`WRITES_DB`, `RESPONDS_WITH`)
- pack token-limit/truncation behavior tests

Milestone alignment source: [milestones-v1.md](../roadmaps/milestones-v1.md), [roadmap-v1.md](../roadmaps/roadmap-v1.md).

---

## CI Policy (v1)

- Run deterministic unit/integration suites on every PR.
- Run fixture snapshot suite on every PR.
- Run incremental equivalence suite at least on main branch merges.
- Any invariant break is blocking.

---

## TODO (needs decision)

- Decide whether snapshot updates require explicit reviewer approval label to reduce accidental drift.
- Decide minimum fixture matrix size for v1 sign-off (fast CI vs broader edge coverage).
