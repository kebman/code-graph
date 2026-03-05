# Documentation Audit Report (docs/**)

## Summary
- Audited all documents under `docs/**`.
- Main drift risks are: view-numbering inconsistencies, conflicting canonical node/edge sets, scope contradictions around v1, and missing referenced docs.
- Markdown link targets are valid, but multiple plain-text doc references point to files that do not exist.

## Findings
- Broken/missing cross-links (missing referenced docs in plain-path references):
- `docs/architecture/context-pack-selection.md:13` references `docs/architecture/ai-context-pack.md` (missing).
- `docs/architecture/query-semantics.md:375` references `docs/architecture/ai-context-pack.md` (missing).
- `docs/development/ai-assisted-development.md:163` references `docs/architecture/ai-context-pack.md` (missing).
- `docs/development/implementation-roadmap.md:220` references `docs/architecture/ai-context-pack.md` (missing).
- `docs/development/architecture-decision-records.md:62` references `docs/adr/adr-001-graph-node-model.md` (missing).
- `docs/development/architecture-decision-records.md:63` references `docs/adr/adr-002-storage-backend.md` (missing).
- `docs/development/architecture-decision-records.md:64` references `docs/adr/adr-003-symbol-identity.md` (missing).

- Terms used inconsistently:
- View numbering conflicts: `docs/architecture/query-semantics.md:91-94` defines View 0 as file-level and View 1 as symbol-level, while canonical mapping in `docs/architecture/graph-views.md` is View 0 runtime, View 1 file, View 2 symbol, View 3 flow.
- View terminology also conflicts in `docs/architecture/graph-edge-kinds.md:235-248` and `docs/architecture/graph-node-kinds.md:271-285` (uses View 0 file / View 1 symbol pattern).
- `module graph` vs `file graph`: `docs/architecture/indexer-architecture.md:105` says “Resolve module graph”, while architecture/roadmap primarily define v1 around file graph + exported symbol graph.
- `IMPORT` vs `IMPORTS`: `docs/roadmaps/roadmap-v1.md:42`, `docs/designs/indexer.md:99`, and `docs/architecture/indexer-architecture.md:119,124` use singular `IMPORT`, conflicting with canonical edge kind `IMPORTS`.
- Storage field names drift: `docs/architecture/graph-storage-model.md:88-100` uses `source_id/target_id`, while canonical docs use `from_id/to_id` (`docs/architecture/graph-model.md`, `docs/designs/storage.md`, `docs/architecture/id-and-normalization.md`).

- Conflicting edge/node type names:
- `AGGREGATED_REFERENCE` is used in `docs/architecture/graph-views.md`, `docs/architecture/edge-explanations.md`, and `docs/architecture/query-semantics.md`, but is not defined in v1 edge list in `docs/architecture/graph-model.md`.
- `EXPOSES` appears in `docs/architecture/graph-views.md:75` but not in runtime edges in `docs/architecture/graph-model.md`.
- `TRANSFORMS` appears in `docs/architecture/graph-views.md:272` as a flow edge, but in `docs/architecture/graph-model.md:409` it is listed as future extension.
- `docs/architecture/graph-edge-kinds.md` defines only five edges (`IMPORTS`, `CALLS`, `REFERENCES`, `INSTANTIATES`, `AGGREGATED_REFERENCE`) and omits canonical model edges such as `CONTAINS`, `ACCEPTS_TYPE`, `RETURNS_TYPE`, `WRITES_DB`, `RESPONDS_WITH`, `VALUE_FLOW`, `BUILDS`, `RUNS`, `DEPENDS_ON`, `MOUNTS`.
- Node kind conflicts: `docs/architecture/graph-node-kinds.md` and `docs/architecture/graph-storage-model.md` present `Module` as core node kind; canonical model (`docs/architecture/graph-model.md`) defines `Runtime` and `Sink` nodes instead and does not define `Module` as a core v1 node.

- Any place v1 scope is accidentally expanded or contradicted:
- `docs/architecture/graph-storage-model.md:185` says incremental indexing is not required for v1, conflicting with v1 success criteria in `docs/roadmaps/roadmap-v1.md:21` and phase plan at `docs/roadmaps/roadmap-v1.md:134`.
- `docs/roadmaps/roadmap-v1.md:124` includes `cluster` query, but `docs/designs/cli.md` v1 command surface does not include `cluster`.
- `docs/architecture/query-semantics.md:339-345` defines `trace(node)` neighborhood semantics, which drifts from v1 flow-trace contract in `docs/designs/query-engine.md` and `docs/designs/cli.md` (sink-oriented bounded flow tracing).

- Missing definitions in glossary:
- Missing glossary entries for commonly used canonical terms: `Runtime Node`, `Service`, `Dockerfile`, `Compose`, `CONTAINS`, `ACCEPTS_TYPE`, `RETURNS_TYPE`, `VALUE_FLOW`, `WRITES_DB`, `RESPONDS_WITH`.
- Glossary has `Transform`, but does not reconcile `TRANSFORMS` edge status ambiguity between `graph-views.md` and `graph-model.md`.

- Additional high-risk doc integrity issue:
- `docs/architecture/graph-node-kinds.md` contains generator/meta artifact text and command instructions (`lines 1-18`, `301-331`), not just architecture specification content.

## Suggested fixes (doc-only)
- Establish one canonical source-of-truth mapping for Views 0-3 in `graph-views.md`, then update `query-semantics.md`, `graph-edge-kinds.md`, and `graph-node-kinds.md` to match.
- Make `graph-model.md` the authoritative node/edge enum source and align all secondary docs (`graph-edge-kinds.md`, `graph-node-kinds.md`, `graph-storage-model.md`, `query-semantics.md`, `glossary.md`).
- Standardize edge names (`IMPORTS` only) and storage field names (`from_id`/`to_id` only) across architecture/design/roadmap docs.
- Resolve `AGGREGATED_REFERENCE`, `EXPOSES`, and `TRANSFORMS` status explicitly (v1 canonical edge vs derived/query-only metadata), then update all docs consistently.
- Resolve v1 scope contradictions for incremental indexing and `cluster` by choosing one position and propagating it through `roadmap-v1.md`, `milestones-v1.md`, `cli.md`, and storage/indexer docs.
- Add missing docs or retarget references:
- Create `docs/architecture/ai-context-pack.md` or replace all references with `docs/architecture/context-pack-selection.md`.
- Create referenced ADR files under `docs/adr/` or remove placeholder ADR paths.
- Expand `glossary.md` with missing canonical terms used throughout architecture/design docs.
- Replace `docs/architecture/graph-node-kinds.md` with a clean specification-only document (remove meta/generator scaffolding text).
