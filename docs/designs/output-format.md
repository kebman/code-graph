# Output Format Design (v1 JSON)

Depends on:
- [Query Engine Design (v1)](./query-engine.md)
- [Edge Explanations Contract (v1)](../architecture/edge-explanations.md)
- [Graph Model Specification](../architecture/graph-model.md)
- [ID and Normalization Rules](../architecture/id-and-normalization.md)
- [Roadmap – v1](../roadmaps/roadmap-v1.md)

Status: Draft

---

## Scope

This output contract is constrained to v1:
- exported-symbol-only
- depth-bounded
- no intra-function flow
- no speculative inference

See also: [Graph Model](../architecture/graph-model.md), [Graph Views](../architecture/graph-views.md), [Invariants](../architecture/invariants.md), [Roadmap v1](../roadmaps/roadmap-v1.md).

---

## Goals

- One deterministic JSON envelope for all query commands.
- Explicit evidence and truncation signals.
- Stable IDs aligned with [id-and-normalization.md](../architecture/id-and-normalization.md).

---

## Top-Level Envelope

```json
{
  "version": "v1",
  "query": {
    "command": "callers|callees|blast|paths|cycles|deadExports|trace|pack",
    "args": {},
    "limits": {
      "depth": 3,
      "maxNodes": 1000,
      "maxPaths": 20,
      "maxTokens": 2000
    }
  },
  "result": {
    "nodes": [],
    "edges": [],
    "paths": [],
    "evidence": []
  },
  "truncation": {
    "truncated": false,
    "reasons": [],
    "limitsHit": {}
  },
  "errors": []
}
```

Rules:
- `result.nodes` and `result.edges` contain only returned subgraph elements (not whole graph).
- `truncation.truncated=true` is required when any hard limit is hit.
- Ordering of arrays must be deterministic.

---

## Node Object

```json
{
  "id": "file::src/controllers/user.ts",
  "kind": "File|Symbol|Type|Sink|Runtime",
  "label": "user.ts",
  "filePath": "src/controllers/user.ts",
  "metadata": {}
}
```

Required fields:
- `id`
- `kind`

Optional fields:
- `label`
- `filePath`
- `metadata`

---

## Edge Object

```json
{
  "id": "edge::CALLS::...",
  "kind": "IMPORTS|REFERENCES|CALLS|INSTANTIATES|ACCEPTS_TYPE|RETURNS_TYPE|WRITES_DB|RESPONDS_WITH|VALUE_FLOW",
  "from": "node-id",
  "to": "node-id",
  "weight": 1,
  "aggregated": false,
  "evidenceRef": ["ev_1"]
}
```

Required fields:
- `id`, `kind`, `from`, `to`

Optional fields:
- `weight`
- `aggregated`
- `evidenceRef[]`

---

## Path Object

```json
{
  "id": "path_1",
  "rank": 1,
  "hops": [
    {
      "from": "symbol::...",
      "edge": "CALLS",
      "to": "symbol::...",
      "evidenceRef": ["ev_12"]
    }
  ],
  "terminal": {
    "isSink": false,
    "sinkKind": null
  }
}
```

Rules:
- `hops` are ordered traversal steps.
- `rank` is deterministic and stable for identical graph state.
- `terminal` is required for `trace` outputs.

---

## Evidence Object

```json
{
  "id": "ev_12",
  "edgeId": "edge::CALLS::...",
  "filePath": "src/controllers/user.ts",
  "line": 28,
  "column": 11,
  "snippet": "optional short snippet",
  "explain": {
    "primaryCause": "call",
    "count": 3,
    "symbols": ["createUserController", "createUser"]
  }
}
```

Rules:
- At least one evidence record is required per explainable returned edge when evidence exists.
- `explain` structure aligns with [edge-explanations.md](../architecture/edge-explanations.md).

---

## Command-Specific Additions

### `deadExports`
- `result.paths` may be empty.
- `result.nodes` contains dead export symbols.

### `cycles`
- `result.paths` represents cycle paths.
- `query.args.view` must indicate `file|symbol|all`.

### `pack`
Adds `result.pack`:

```json
{
  "maxTokens": 2000,
  "usedTokens": 1340,
  "files": [
    {
      "filePath": "src/controllers/user.ts",
      "ranges": [{"startLine": 20, "endLine": 48}]
    }
  ]
}
```

---

## Truncation Flags

Required when any limit is exceeded:

```json
{
  "truncated": true,
  "reasons": ["maxDepth", "maxPaths"],
  "limitsHit": {
    "maxDepth": 3,
    "maxPaths": 20
  }
}
```

Possible reasons:
- `maxDepth`
- `maxNodes`
- `maxPaths`
- `maxTokens`

---

## TODO (needs decision)

- Confirm whether `snippet` is mandatory for CLI JSON or optional-only for context-pack mode.
- Confirm whether `VALUE_FLOW` is returned as explicit edges in v1 outputs or represented through `trace` path metadata only.
