# Edge Explanations Contract (v1)

Depends on:
- [Graph Model Specification](./graph-model.md)
- [Graph Views Specification](./graph-views.md)
- [Query Engine Architecture](./query-engine-architecture.md)
- [Architectural Invariants (v1)](./invariants.md)
- [Roadmap – v1](../roadmaps/roadmap-v1.md)

Status: Draft

---

## Scope

This contract is constrained to v1:
- exported-symbol-only
- depth-bounded
- no intra-function flow
- no speculative inference

See also: [Graph Model](./graph-model.md), [Graph Views](./graph-views.md), [Invariants](./invariants.md), [Roadmap v1](../roadmaps/roadmap-v1.md).

Special edge-status alignment for this contract:
- `AGGREGATED_REFERENCE` is allowed only as a derived `relationKind` value.
- `EXPOSES` is not a v1 edge kind in this contract.
- `TRANSFORMS` is post-v1 and excluded from v1 explanation payload enums.

---

## Purpose

Define the stable payload returned by query/explain surfaces so UI/CLI can support:
- `click edge -> explain`
- deterministic evidence
- drift-resistant edge interpretation across View 1 and View 2

---

## Contract Envelope

Every explanation response must include:

```json
{
  "contractVersion": "v1",
  "view": "VIEW_1|VIEW_2",
  "edgeKind": "IMPORTS|CALLS|REFERENCES|INSTANTIATES",
  "relationKind": "DIRECT|AGGREGATED_REFERENCE",
  "fromId": "...",
  "toId": "...",
  "summary": {
    "primaryCause": "import|call|reference|instantiation",
    "count": 1,
    "aggregation": false
  },
  "evidence": [
    {
      "filePath": "src/...",
      "line": 1,
      "column": 1,
      "snippet": "optional short snippet"
    }
  ],
  "symbols": {
    "from": ["optional"],
    "to": ["optional"],
    "top": ["optional"]
  },
  "truncated": false,
  "limits": {
    "maxEvidence": 20
  }
}
```

Rules:
- `evidence` must contain at least one concrete location when available.
- `summary.count` is required for aggregated relationships.
- If evidence is truncated, `truncated=true` and `limits.maxEvidence` must be present.
- Ordering must be deterministic (see [id-and-normalization.md](./id-and-normalization.md)).

---

## File-Level Edge Explanations (View 1)

### IMPORTS

Edge meaning: file `A` imports from file `B`.

Required fields:
- `view = VIEW_1`
- `edgeKind = IMPORTS`
- `summary.primaryCause = import`
- `summary.count` (number of import statements represented)
- `evidence[]` with import declaration locations
- `symbols.top[]` may include imported exported symbols (when resolvable)

Example output:

```json
{
  "contractVersion": "v1",
  "view": "VIEW_1",
  "edgeKind": "IMPORTS",
  "fromId": "file::src/controllers/user.ts",
  "toId": "file::src/services/user-service.ts",
  "summary": {
    "primaryCause": "import",
    "count": 2,
    "aggregation": true
  },
  "evidence": [
    {"filePath": "src/controllers/user.ts", "line": 3, "column": 1},
    {"filePath": "src/controllers/user.ts", "line": 9, "column": 1}
  ],
  "symbols": {
    "top": ["createUser", "UserService"]
  },
  "truncated": false,
  "limits": {"maxEvidence": 20}
}
```

### AGGREGATED_REFERENCE

Edge meaning: aggregated symbol usage from file `A` to exported symbols declared in file `B`.
`AGGREGATED_REFERENCE` is treated as a derived relation kind in explain output, not a canonical v1 EdgeKind enum.

Required fields:
- `view = VIEW_1`
- `relationKind = AGGREGATED_REFERENCE`
- `summary.primaryCause = reference|call|type_usage`
- `summary.count` total aggregated reference count
- `symbols.top[]` top referenced symbol names (deterministic order)
- `evidence[]` representative source locations

Example output:

```json
{
  "contractVersion": "v1",
  "view": "VIEW_1",
  "edgeKind": "REFERENCES",
  "relationKind": "AGGREGATED_REFERENCE",
  "fromId": "file::src/controllers/user.ts",
  "toId": "file::src/domain/user.ts",
  "summary": {
    "primaryCause": "reference",
    "count": 14,
    "aggregation": true
  },
  "evidence": [
    {"filePath": "src/controllers/user.ts", "line": 22, "column": 18},
    {"filePath": "src/controllers/user.ts", "line": 45, "column": 12}
  ],
  "symbols": {
    "top": ["User", "CreateUserInput", "UserId"]
  },
  "truncated": false,
  "limits": {"maxEvidence": 20}
}
```

---

## Symbol-Level Edge Explanations (View 2)

### CALLS

Required fields:
- `view = VIEW_2`
- `edgeKind = CALLS`
- `summary.primaryCause = call`
- `summary.count` call-site count (aggregated)
- `evidence[]` call-site locations
- `symbols.from[]` and `symbols.to[]` with canonical symbol names

### REFERENCES

Required fields:
- `view = VIEW_2`
- `edgeKind = REFERENCES`
- `summary.primaryCause = reference`
- `summary.count` reference count
- `evidence[]` reference locations
- Optional type context in `symbols.top[]` or metadata extension

### INSTANTIATES

Required fields:
- `view = VIEW_2`
- `edgeKind = INSTANTIATES`
- `summary.primaryCause = instantiation`
- `summary.count` instantiation count
- `evidence[]` `new ClassName(...)` locations

Example output (CALLS):

```json
{
  "contractVersion": "v1",
  "view": "VIEW_2",
  "edgeKind": "CALLS",
  "fromId": "symbol::file::src/controllers/user.ts::createUserController::function",
  "toId": "symbol::file::src/services/user.ts::createUser::function",
  "summary": {
    "primaryCause": "call",
    "count": 3,
    "aggregation": true
  },
  "evidence": [
    {"filePath": "src/controllers/user.ts", "line": 28, "column": 11},
    {"filePath": "src/controllers/user.ts", "line": 41, "column": 11}
  ],
  "symbols": {
    "from": ["createUserController"],
    "to": ["createUser"]
  },
  "truncated": false,
  "limits": {"maxEvidence": 20}
}
```

---

## Determinism and Limits

- Evidence ordering must be stable: file path, line, column.
- Symbol arrays must be sorted deterministically.
- Limit-enforced output must carry explicit truncation metadata.
- No inferred evidence is allowed; all entries must map to indexed static evidence.

---

## TODO (needs decision)

- Confirm exact default `maxEvidence` for CLI and UI consistency.
