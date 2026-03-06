# CLI Design (v1 Command Surface)

Depends on:
- [Query Engine Design (v1)](./query-engine.md)
- [Indexer Design (v1)](./indexer.md)
- [Graph Views Specification](../architecture/graph-views.md)
- [Architectural Invariants (v1)](../architecture/invariants.md)
- [Roadmap – v1](../roadmaps/roadmap-v1.md)

Status: Draft

---

## Scope

This CLI surface is constrained to v1:
- exported-symbol-only
- depth-bounded
- no intra-function flow
- no speculative inference

See also: [Graph Model](../architecture/graph-model.md), [Graph Views](../architecture/graph-views.md), [Invariants](../architecture/invariants.md), [Roadmap v1](../roadmaps/roadmap-v1.md).

---

## Global Conventions

- Command prefix: `code-graph`.
- Output mode:
  - human-readable (default)
  - JSON (`--json`)
- Determinism: stable sort/order for identical graph state.
- Limits are enforced; truncation must be explicit in output.

Common query defaults/limits:
- `--depth` default: `3`
- `--max-paths` default: `20`
- `--max-nodes` default: `1000`

---

## Commands

### `index`

Purpose: build or update graph index.

Input forms:
- `code-graph index`
- `code-graph index --clean`
- `code-graph index --changed-only`

Defaults:
- Incremental when change detection is available.
- Falls back to full rebuild when change detection is unavailable.

Limits:
- N/A traversal limits (index-time operation).

Output:
- Human: indexed files/symbols/edges summary.
- JSON: counters, mode (`full|incremental`), duration, warnings.

### `callers`

Purpose: list inbound callers for a symbol.

Input forms:
- `code-graph callers <symbol>`
- `code-graph callers <symbol> --depth <n>`

Defaults:
- `--depth 3`

Limits:
- `--depth <= hard_limit`
- `--max-nodes` applies.

Output:
- Human: grouped caller symbols with evidence locations.
- JSON: nodes/edges/paths/evidence and truncation flags.

### `callees`

Purpose: list outbound callees for a symbol.

Input forms:
- `code-graph callees <symbol>`
- `code-graph callees <symbol> --depth <n>`

Defaults and limits:
- Same as `callers`.

Output:
- Same shape as `callers`.

### `blast`

Purpose: bounded blast radius from a symbol.

Input forms:
- `code-graph blast <symbol>`
- `code-graph blast <symbol> --depth <n>`

Defaults:
- `--depth 3`

Limits:
- `--max-nodes` and depth limits enforced.

Output:
- Human: affected symbols/files summary.
- JSON: affected subgraph + evidence counts + truncation flags.

### `paths`

Purpose: find bounded paths between two nodes/symbols.

Input forms:
- `code-graph paths <from> <to>`
- `code-graph paths <from> <to> --depth <n> --max-paths <n>`

Defaults:
- `--depth 3`
- `--max-paths 20`

Limits:
- Depth/path/node limits enforced.

Output:
- Human: ordered hop lists.
- JSON: `paths[]` with hop evidence and ranking order.

### `cycles`

Purpose: detect cycles in file and symbol graphs.

Input forms:
- `code-graph cycles`
- `code-graph cycles --view file`
- `code-graph cycles --view symbol`

Defaults:
- `--view all`

Limits:
- `--max-paths` applies to returned cycle list.

Output:
- Human: cycle chains (shortest first).
- JSON: cycle path arrays and view labels.

### `deadExports`

Purpose: find exported symbols with no inbound usage.

Input forms:
- `code-graph deadExports`
- `code-graph deadExports --limit <n>`

Defaults:
- No explicit query depth.

Limits:
- Result `--limit` applies.

Output:
- Human: symbol list grouped by file.
- JSON: node list with inbound-edge counters.

### `trace`

Purpose: bounded cross-function boundary flow tracing.

Input forms:
- `code-graph trace <source> --to <sink>`
- `code-graph trace <from> <to>`
- `code-graph trace <source> --depth <n>`

Defaults:
- `--depth 3`

Limits:
- Depth/path/node limits enforced.
- Terminal boundaries stop at sink edges (`WRITES_DB`, `RESPONDS_WITH`).

Output:
- Human: flow path(s) with boundary steps.
- JSON: path/hop evidence plus terminal sink markers.

v1 note:
- Standalone neighborhood form (`trace <node>` without `--to` or explicit target) is out of scope.

### `pack`

Purpose: build AI context pack from bounded path/trace results.

Input forms:
- `code-graph pack --from <x> --to <y> --max-tokens <n>`

Defaults:
- `--max-tokens 2000`
- bounded traversal defaults inherited from query commands.

Limits:
- Token budget is hard limit.
- Query traversal limits still apply.

Output:
- Human: summary + included files/snippets.
- JSON: selected nodes/edges/paths/snippets, token accounting, truncation flags.

---

## Error Model

All commands must return deterministic, structured errors for:
- unknown symbol/node
- ambiguous symbol resolution
- invalid depth/limit values
- truncated results due to hard limits

JSON errors include stable fields: `code`, `message`, `details`.

---

## TODO (needs decision)

- Finalize exact hard maximums for `--depth` and `--limit` family flags for v1 CLI parity.
- Decide whether `index` defaults to incremental always, or only when a Git worktree is detected.
