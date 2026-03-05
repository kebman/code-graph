# AI Context Pack Mode (v1)

Status: Draft

Depends on:
- [Graph Views Specification](./graph-views.md)
- [Query Engine Architecture](./query-engine-architecture.md)
- [Architectural Invariants (v1)](./invariants.md)
- [Query Engine Design (v1)](../designs/query-engine.md)
- [CLI Design (v1)](../designs/cli.md)
- [Output Format Design (v1 JSON)](../designs/output-format.md)
- [Context Pack Selection](./context-pack-selection.md)
- [ID and Normalization Rules (v1)](./id-and-normalization.md)

---

## Purpose

AI Context Pack Mode produces a bounded, deterministic context bundle for AI-assisted reasoning.

In v1, it is a query-driven packaging mode over indexed graph data and aligns with View 3 usage in [graph-views.md](./graph-views.md).

---

## Scope (v1)

This mode is constrained by v1 invariants:
- exported-symbol-only surface
- depth-bounded traversal
- no intra-function variable/dataflow tracking
- no speculative inference

See: [invariants.md](./invariants.md), [query-engine-architecture.md](./query-engine-architecture.md).

---

## Command and Input Parameters

Canonical command:

```bash
code-graph pack --from <X> --to <Y> --max-tokens <N>
```

Parameters:
- `--from`: start input (resolved by query resolver to node ID)
- `--to`: target input (resolved by query resolver to node ID or terminal target)
- `--max-tokens`: hard token budget for pack output

Defaults and limits:
- `--max-tokens` default: `2000` ([cli.md](../designs/cli.md))
- traversal limits are inherited from query engine safeguards (`maxDepth`, `maxNodes`, `maxPaths`)

Input handling rules:
- Inputs must be normalized/resolved deterministically.
- Unknown or ambiguous inputs must return explicit errors.

---

## Selection Algorithm (v1)

The selection pipeline is deterministic and bounded:

1. Resolve `from` and `to` inputs to graph nodes.
2. Execute a bounded path query between those nodes.
3. Rank and limit returned paths using query-engine rules.
4. Collect unique files participating in selected path nodes/hops.
5. Extract minimal relevant snippets from selected files.
6. Preserve path/call order in the assembled pack.
7. Enforce token and traversal limits.
8. Emit evidence-backed output with truncation flags when needed.

Selection principles:
- include only files/snippets supported by selected paths/evidence
- deduplicate deterministically
- avoid whole-graph or unrelated file expansion

References:
- [query-engine-architecture.md](./query-engine-architecture.md)
- [query-engine.md](../designs/query-engine.md)
- [context-pack-selection.md](./context-pack-selection.md)

---

## Determinism Requirements

For identical repo state and identical inputs, pack output must be identical.

Required controls:
- deterministic input normalization/resolution
- deterministic traversal and ranking
- deterministic file/snippet ordering
- no random/time-dependent output fields

Ordering expectations:
- paths ordered by deterministic rank
- files ordered deterministically (stable normalized path order)
- snippets ordered deterministically by file and position

References:
- [invariants.md](./invariants.md)
- [id-and-normalization.md](./id-and-normalization.md)

---

## Truncation Behavior

Pack mode must enforce hard limits and never hide truncation.

Possible truncation sources:
- `maxDepth`
- `maxNodes`
- `maxPaths`
- `maxTokens`

When truncation occurs:
- return partial results only within enforced limits
- set explicit truncation flags
- include reasons and limits hit in structured output

References:
- [query-engine-architecture.md](./query-engine-architecture.md)
- [output-format.md](../designs/output-format.md)

---

## Output Structure

### Human Output (CLI)

Must include:
- input summary (`from`, `to`, effective limits)
- ordered path explanation
- selected files/snippets summary
- evidence locations (file + line/column where available)
- explicit truncation notice when applicable

### JSON Output

Must follow the v1 envelope in [output-format.md](../designs/output-format.md) with `query.command = "pack"`.

Expected sections:
- `version`
- `query` (`command`, `args`, `limits`)
- `result.nodes`
- `result.edges`
- `result.paths`
- `result.evidence`
- `result.pack` (`maxTokens`, `usedTokens`, `files[]` with ranges)
- `truncation` (`truncated`, `reasons`, `limitsHit`)
- `errors`

---

## Error Handling

Pack mode must fail deterministically and explicitly for:
- unknown identifiers
- ambiguous symbol resolution
- invalid limit values
- traversal/limit overflows (with partial-output signaling when applicable)

References:
- [query-engine.md](../designs/query-engine.md)
- [query-engine-architecture.md](./query-engine-architecture.md)

---

## Non-Goals (v1)

Pack mode does not:
- perform independent indexing or graph mutation
- introduce new query semantics beyond existing path/trace behavior
- include intra-function local propagation
- add speculative relationships

Pack mode is a bounded packaging layer over query-engine results.
