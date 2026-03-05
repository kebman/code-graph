# AI Context Pack Mode (v1)

Status: Draft

Depends on:
- [Graph Views Specification](./graph-views.md)
- [Query Engine Architecture](./query-engine-architecture.md)
- [Architectural Invariants (v1)](./invariants.md)
- [Query Engine Design (v1)](../designs/query-engine.md)
- [CLI Design (v1)](../designs/cli.md)
- [Output Format Design (v1 JSON)](../designs/output-format.md)
- [ID and Normalization Rules (v1)](./id-and-normalization.md)
- [Context Pack Selection](./context-pack-selection.md)

---

## Scope

AI Context Pack Mode is a v1 query mode for producing bounded, deterministic context for AI reasoning.

v1 boundaries:
- exported-symbol-only
- depth-bounded traversal
- no intra-function flow tracking
- no speculative inference

This mode aligns with View 3 in [graph-views.md](./graph-views.md): query-generated information flow and evidence-backed path context.

---

## Command Surface and Input Parameters

Canonical command form:

```bash
code-graph pack --from <X> --to <Y> --max-tokens <N>
```

Supported inputs:
- `--from`: start input (node ID, symbol name, or file path after resolver normalization)
- `--to`: target input (node ID, symbol name, or sink/target identifier after resolver normalization)
- `--max-tokens`: hard token budget for pack output

Defaults and inherited limits:
- `--max-tokens` default: `2000` ([cli.md](../designs/cli.md))
- Traversal bounds are inherited from query engine limits (depth/path/node limits)
- Deterministic resolution/normalization must follow [id-and-normalization.md](./id-and-normalization.md)

Input validation requirements:
- Unknown/ambiguous identifiers must fail with explicit errors.
- No implicit broad scans or unbounded expansion are allowed.

---

## Selection Algorithm (v1)

The pack algorithm is query-driven and bounded.

1. Resolve `from`/`to` inputs into graph nodes using query resolver rules.
2. Execute a bounded path-oriented query between resolved inputs.
3. Use ranked/limited returned paths as the selection backbone.
4. Collect unique files participating in selected nodes/hops.
5. Extract minimal relevant snippets only from those files.
6. Preserve path/call order in assembled output.
7. Enforce token budget and traversal limits.
8. Return output with explicit evidence and truncation status.

File selection rules:
- Include files that contain selected path symbols/hops.
- Deduplicate files deterministically.
- Do not include unrelated files.

Snippet selection rules:
- Prioritize snippets directly supporting selected path/evidence (definitions, relevant call sites, relevant imports/type context when available).
- Keep snippet extraction deterministic by stable ordering.
- Avoid whole-file inclusion unless required by limits/selection policy.

This algorithm aligns with:
- AI Context Pack behavior in [query-engine-architecture.md](./query-engine-architecture.md)
- Concrete process in [query-engine.md](../designs/query-engine.md)
- Deterministic selection guidance in [context-pack-selection.md](./context-pack-selection.md)

---

## Determinism Requirements

For identical repository state and identical pack inputs, output must be identical.

Required controls:
- Stable input normalization and node resolution
- Deterministic traversal order and ranking
- Deterministic file and snippet ordering
- No random/time-dependent output fields

Ordering expectations:
- Path order follows deterministic query ranking.
- Files are ordered deterministically (stable path ordering).
- Snippets are ordered deterministically by file and position.

Determinism requirements derive from:
- [invariants.md](./invariants.md)
- [query-engine-architecture.md](./query-engine-architecture.md)
- [query-engine.md](../designs/query-engine.md)

---

## Truncation Behavior

Pack mode must enforce hard limits and return partial results safely when limits are hit.

Limits that may truncate output:
- `maxDepth`
- `maxNodes`
- `maxPaths`
- `maxTokens`

Truncation contract:
- Output must explicitly indicate truncation.
- Reasons/limits hit must be included in structured output.
- Evidence for retained paths/hops must remain present.

No hidden truncation is allowed.

---

## Output Structure

Pack mode supports both human-readable and JSON outputs.

### Human Output (CLI)

Human output must include:
- Query summary (`from`, `to`, limits)
- Path explanation (ordered hops)
- Selected files/snippets summary
- Evidence references (file + line/column where available)
- Truncation notice when applicable

### JSON Output

JSON output must follow [output-format.md](../designs/output-format.md) top-level envelope and include `query.command = "pack"`.

Required structure:
- `version`
- `query` (`command`, `args`, `limits`)
- `result.nodes`
- `result.edges`
- `result.paths`
- `result.evidence`
- `result.pack`:
  - `maxTokens`
  - `usedTokens`
  - `files[]` with selected file paths and snippet ranges
- `truncation` (`truncated`, `reasons`, `limitsHit`)
- `errors`

---

## Safety and Non-Goals (v1)

Pack mode must not:
- perform unbounded traversal
- include intra-function variable propagation
- infer speculative relationships
- bypass query-engine limits

Pack mode is a packaging layer over bounded query results, not a separate analysis engine.

---

## Error Handling

Pack mode must fail explicitly for:
- unknown `from`/`to` identifiers
- ambiguous symbol resolution
- invalid limit values
- traversal overflow/limit breaches (with partial-output signaling where applicable)

Error behavior must remain deterministic and structured.

---

## TODO (needs decision)

- Confirm whether snippet text is always included in JSON evidence or only in context-pack specific sections when token pressure is high (see related TODO in [output-format.md](../designs/output-format.md)).
