# ID and Normalization Rules (v1)

Depends on:
- [Graph Model Specification](./graph-model.md)
- [Indexer Architecture](./indexer-architecture.md)
- [Query Engine Architecture](./query-engine-architecture.md)
- [Architectural Invariants (v1)](./invariants.md)
- [Roadmap – v1](../roadmaps/roadmap-v1.md)

Status: Draft

---

## Scope

This specification is constrained to v1:
- exported-symbol-only
- depth-bounded
- no intra-function flow
- no speculative inference

See also: [Graph Model](./graph-model.md), [Graph Views](./graph-views.md), [Invariants](./invariants.md), [Roadmap v1](../roadmaps/roadmap-v1.md).

---

## Goals

- Stable IDs across re-index runs for unchanged entities.
- Cross-platform path normalization (Linux/macOS/Windows).
- Deterministic ordering for persistence and query output.

---

## Canonical Path Normalization

Canonical path representation for IDs and persisted metadata:
- Repository-relative path.
- POSIX separators (`/`).
- No `.` or `..` segments.
- No trailing slash for files.

Normalization pipeline:
1. Resolve input path to absolute path.
2. Make path relative to repository root.
3. Convert separators `\\` -> `/`.
4. Collapse `.` and `..` segments.
5. Normalize Unicode to NFC (for cross-platform consistency).

### Linux
- Treat paths as case-sensitive.
- Preserve case exactly.

### macOS
- Preserve case in canonical path.
- Compare using normalized representation only; do not create duplicate nodes from separator/casing variants.

### Windows
- Accept drive-letter inputs but remove drive prefix from canonical repo-relative path.
- Convert separators to `/`.
- Treat path resolution as case-insensitive for lookup; persist canonical case from repository path.

Rationale: IDs should be repository-stable, not machine-path-stable.

---

## Canonical Node IDs

### File
```
file::<normalized_path>
```

Example:
```
file::src/services/user.ts
```

### Symbol
```
symbol::<file_id>::<symbol_name>::<symbol_kind>
```

Example:
```
symbol::file::src/services/user.ts::createUser::function
```

### Type (if explicit)
```
type::<file_id>::<type_name>
```

### Sink
```
sink::<category>::<file_id>::<line>::<column>
```

IDs must never include timestamps or random values.

---

## Canonical Edge IDs

Edge IDs must be stable if `from_id`, `to_id`, `kind`, and evidence set are unchanged.

Canonical form:
```
edge::<kind>::<from_id>::<to_id>::<evidence_fingerprint>
```

Where `evidence_fingerprint` is computed from deterministic evidence tuples:
```
<file_path>:<line>:<column>
```
joined in sorted order and hashed.

For edge kinds without source location evidence, use:
```
none
```

---

## Deterministic Ordering Rules

### Indexer Persistence Ordering

Before writing to storage:
- Nodes sorted by `kind`, then `id`.
- Edges sorted by `kind`, then `from_id`, then `to_id`, then `id`.
- Evidence locations sorted by `file_path`, `line`, `column`.

### Query Output Ordering

- Traversal remains depth-bounded (see [invariants.md](./invariants.md)).
- Within each depth layer, expansion order is by edge `kind`, then `to_id`.
- Path ranking and ties use deterministic rules from [query-engine-architecture.md](./query-engine-architecture.md).

---

## Incremental Stability Rules

Incremental indexing must preserve IDs for unchanged entities:
- Unchanged file path => unchanged file ID.
- Unchanged symbol declaration tuple (`file_id`, `name`, `kind`) => unchanged symbol ID.
- Unchanged edge tuple + evidence set => unchanged edge ID.

If a file path changes, dependent file/symbol IDs are expected to change.

---

## TODO (needs decision)

- Decide whether symlink-resolved paths should be canonicalized via `realpath` or preserved as repository paths when both are available.
- Decide whether untracked files should use filesystem case or repository index case if both differ on case-insensitive filesystems.
