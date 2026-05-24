# Incremental Indexing and Cache Plan

Status: Draft  
Purpose: Make Code Graph credible against the "snapshot or stale graph?" objection by planning git-aware incremental indexing, local graph caching, and freshness metadata.

---

## 1. Goal

Improve Code Graph so it can answer:

- [ ] Is this graph current?
- [ ] What repo state was indexed?
- [ ] Can I re-index only changed files?
- [ ] Are stale edges removed?
- [ ] Can agents trust this graph for the current task?
- [ ] Can large repos avoid full re-indexing every run?

Core promise:

> Code Graph should build once, update cheaply, and never pretend that stale graph data represents the current repository.

---

## 2. Demand Signals

The Understand Anything video and comments show strong demand around freshness and reuse:

- [ ] Users ask whether the graph updates itself or is just a snapshot.
- [ ] Users want incremental updates after code changes.
- [ ] Users do not want to regenerate expensive codebase maps repeatedly.
- [ ] Users worry cached knowledge ages instantly.
- [ ] Users want shared or reusable repository maps.
- [ ] Users want agent context to be current enough to trust.

Repo response:

- [ ] Add a clear snapshot-vs-incremental section in README.
- [ ] Document current state honestly.
- [ ] Define v1 incremental indexing behaviour.
- [ ] Define graph cache metadata.
- [ ] Define stale-cache warnings.
- [ ] Add tests for stale-edge removal.

---

## 3. Current State

Current implementation appears to support deterministic full indexing from a scanned source tree.

Current strengths:

- [ ] deterministic file scan order
- [ ] normalized repository-relative paths
- [ ] graph validation
- [ ] stable graph IDs
- [ ] sorted diagnostics
- [ ] TypeScript-first source extraction

Current gaps:

- [ ] no persisted graph cache yet
- [ ] no git commit metadata in output yet
- [ ] no changed-file detection yet
- [ ] no stale-edge removal process yet
- [ ] no cache status command yet
- [ ] no scoped cache key model yet

---

## 4. README Message

Add a compact section to README.

Suggested text:

> # Snapshot vs Incremental
>
> Current development runs build a deterministic graph from the scanned source tree.
>
> The v1 target is git-aware incremental indexing:
>
> - detect changed files
> - re-index changed files only
> - recompute affected inbound/outbound edges
> - remove stale edges
> - preserve stable node and edge IDs across runs
>
> Query output should identify the indexed repo state where possible. A graph built from an old commit must not silently pretend to represent the current working tree.

Checklist:

- [ ] State current full-index behaviour honestly.
- [ ] State v1 incremental goal.
- [ ] Explain why stale graphs are dangerous.
- [ ] Avoid claiming incremental indexing is already complete.
- [ ] Link to the deeper incremental indexing design doc.

---

## 5. Cache Metadata Model

Add or update a design doc.

Candidate file:

- [ ] `docs/designs/incremental-indexing.md`

Cache metadata should include:

- [ ] repo root absolute path or normalized repo identity
- [ ] graph schema version
- [ ] indexer version
- [ ] cache format version
- [ ] indexed_at timestamp
- [ ] git commit hash, when available
- [ ] dirty working tree flag, when available
- [ ] scope path
- [ ] include filters
- [ ] exclude filters
- [ ] scanned file count
- [ ] indexed file count
- [ ] ignored file count
- [ ] diagnostics count
- [ ] node count
- [ ] edge count

Suggested metadata shape, described without committing to exact implementation:

> indexMetadata:
>
> - repoRoot
> - scope
> - gitCommit
> - dirty
> - indexedAt
> - indexerVersion
> - graphSchemaVersion
> - includeFilters
> - excludeFilters
> - fileCount
> - diagnosticsCount

Checklist:

- [ ] Keep metadata storage-neutral.
- [ ] Do not force SQLite before needed.
- [ ] Make metadata available in query output.
- [ ] Make metadata available in context packs.
- [ ] Make metadata available in `status`.

---

## 6. Cache Storage Strategy

v1 should prefer simple local storage.

Possible storage path:

> .code-graph/cache/

Possible cache files:

> graph.json
>
> index-metadata.json
>
> files.json
>
> diagnostics.json

Alternative later:

> SQLite or equivalent embedded store.

Recommended stance:

- [ ] Start with storage-neutral model.
- [ ] Use simple JSON cache if enough for v1.
- [ ] Move to SQLite only when query speed or partial updates require it.
- [ ] Do not make graph DB infrastructure a v1 blocker.
- [ ] Keep graph model independent of storage.

Checklist:

- [ ] Document cache format as internal and versioned.
- [ ] Add cache version.
- [ ] Add migration/invalid-cache behaviour.
- [ ] Add cache invalidation when schema/indexer version changes.
- [ ] Add `--no-cache` or equivalent later if useful.

---

## 7. Freshness Checks

Code Graph should detect whether the cache represents the current repo state.

Freshness inputs:

- [ ] git commit hash
- [ ] dirty working tree status
- [ ] file modified times, optional
- [ ] file content hashes, stronger but slower
- [ ] indexer version
- [ ] graph schema version
- [ ] scope and filters

Freshness states:

- [ ] fresh
- [ ] dirty-but-usable
- [ ] stale
- [ ] incompatible
- [ ] unknown

Suggested user-facing statuses:

> Fresh: cache matches current git commit and clean tree.
>
> Dirty: cache was built from this commit, but working tree has changes.
>
> Stale: cache was built from another commit or known changed files.
>
> Incompatible: cache version does not match current graph schema/indexer.
>
> Unknown: git state could not be determined.

Checklist:

- [ ] Define freshness states.
- [ ] Add them to design docs.
- [ ] Add them to status command plan.
- [ ] Include them in query output metadata.
- [ ] Include them in context pack caveats.

---

## 8. CLI Commands

Target commands:

> code-graph index .
>
> code-graph index . --force
>
> code-graph index . --incremental
>
> code-graph status
>
> code-graph stats
>
> code-graph clean-cache

Checklist:

- [ ] `index` builds or updates cache.
- [ ] `index --force` performs full rebuild.
- [ ] `index --incremental` attempts changed-file update.
- [ ] `status` reports freshness and metadata.
- [ ] `stats` reports graph counts.
- [ ] `clean-cache` removes local cache.
- [ ] CLI should tell user when cache is stale.

Potential future flags:

- [ ] `--scope <path>`
- [ ] `--include <glob>`
- [ ] `--exclude <glob>`
- [ ] `--cache-dir <path>`
- [ ] `--no-cache`
- [ ] `--json`

---

## 9. Incremental Indexing Behaviour

v1 incremental target:

- [ ] detect changed files since cached state
- [ ] re-parse changed files
- [ ] re-extract symbols for changed files
- [ ] re-extract relationships for changed files
- [ ] remove old nodes owned by changed/deleted files
- [ ] remove old edges from changed/deleted files
- [ ] recompute affected inbound edges where needed
- [ ] validate final graph
- [ ] update cache metadata

Core rule:

> Incremental indexing must not leave stale edges behind.

Checklist:

- [ ] Deleted files remove their File node.
- [ ] Deleted files remove contained Symbol nodes.
- [ ] Deleted files remove outbound edges.
- [ ] Deleted files remove inbound edges.
- [ ] Changed imports remove old IMPORTS edges.
- [ ] Changed calls remove old CALLS edges.
- [ ] Renamed symbols do not leave old symbol nodes.
- [ ] Validation runs after update.
- [ ] Diagnostics are regenerated for changed files.

---

## 10. Affected-File Strategy

Simple first strategy:

- [ ] identify changed files
- [ ] remove and rebuild all nodes/edges owned by changed files
- [ ] remove edges pointing to deleted/replaced nodes
- [ ] rebuild relationship edges from changed files
- [ ] optionally re-check files that import changed files

More accurate later strategy:

- [ ] track per-file outbound edges
- [ ] track per-file contained symbols
- [ ] track reverse importers
- [ ] recompute affected inbound references
- [ ] update only impacted subgraph

Recommended v1 principle:

> Prefer slightly more recomputation over stale graph facts.

Checklist:

- [ ] Define owner file for every node.
- [ ] Define owner file for every edge where possible.
- [ ] Make deletion by owner file deterministic.
- [ ] Recompute conservatively.
- [ ] Do not optimize before correctness.

---

## 11. Changed-File Detection

Git-aware detection should use git when available.

Possible git commands conceptually:

> git rev-parse HEAD
>
> git status --porcelain
>
> git diff --name-only cachedCommit HEAD
>
> git ls-files

Design requirements:

- [ ] handle repos without git
- [ ] handle dirty working trees
- [ ] handle untracked files
- [ ] handle deleted files
- [ ] handle renamed files
- [ ] handle ignored files
- [ ] handle scoped indexing

Checklist:

- [ ] Define git detection in docs.
- [ ] Avoid relying only on modified time.
- [ ] Provide fallback full re-index when git state is unclear.
- [ ] Surface warning when freshness cannot be determined.
- [ ] Keep output deterministic.

---

## 12. Scoped Cache Keys

Scoped indexing needs cache keys that include:

- [ ] repo root
- [ ] scope path
- [ ] include filters
- [ ] exclude filters
- [ ] graph schema version
- [ ] indexer version

Examples:

> index .
>
> index packages/api
>
> index apps/web --include src/surfaces/organizer

Rules:

- [ ] Different scopes should not overwrite each other accidentally.
- [ ] Different include/exclude filters should produce different cache metadata.
- [ ] Status should report which scope is active.
- [ ] Query commands should know which cache/scope they are using.

Checklist:

- [ ] Define scope identity.
- [ ] Define cache directory or cache file naming.
- [ ] Add scope to output metadata.
- [ ] Add scope to context packs.
- [ ] Add stale warning when querying wrong/missing scope.

---

## 13. Query Output Freshness

Every query result should optionally include freshness metadata.

Human compact output:

> Scope: packages/api
>
> Indexed state: commit abc1234, dirty working tree
>
> Freshness: dirty-but-usable

JSON output:

> indexMetadata:
>
> - scope
> - gitCommit
> - dirty
> - indexedAt
> - freshness
> - graphSchemaVersion
> - indexerVersion

Checklist:

- [ ] Include freshness in JSON.
- [ ] Include compact freshness in markdown.
- [ ] Warn on stale cache.
- [ ] Allow `--allow-stale` later if useful.
- [ ] Refuse or warn strongly on incompatible cache.

---

## 14. Context Pack Freshness

Context packs must not hide stale graph status.

Pack caveats should include:

- [ ] graph built from old commit
- [ ] dirty working tree detected
- [ ] cache incompatible
- [ ] unknown git state
- [ ] scope mismatch
- [ ] output truncated

Suggested caveat:

> Caveat: This pack was generated from a graph indexed at commit abc1234, but the working tree has changed. Treat blast-radius results as incomplete until re-indexed.

Checklist:

- [ ] Include freshness in pack header.
- [ ] Include stale warnings near top.
- [ ] Include dirty tree status.
- [ ] Include scope.
- [ ] Include indexed_at timestamp.

---

## 15. Tests Needed

Incremental tests:

- [ ] full index creates cache metadata
- [ ] status reports fresh cache
- [ ] changed file makes cache dirty/stale
- [ ] changed import replaces old IMPORTS edge
- [ ] deleted file removes nodes and edges
- [ ] renamed file does not leave old file node
- [ ] changed function call replaces old CALLS edge
- [ ] unresolved import diagnostic updates after fix
- [ ] graph validates after incremental update
- [ ] repeated incremental runs are deterministic
- [ ] incompatible schema forces rebuild or warning
- [ ] scoped cache does not cross-contaminate another scope

Fixture scenarios:

- [ ] small TypeScript repo
- [ ] file import changed
- [ ] file deleted
- [ ] symbol renamed
- [ ] route changed
- [ ] dirty working tree
- [ ] untracked file
- [ ] scoped package

---

## 16. Documentation Files Likely Affected

- [ ] `README.md`
- [ ] `docs/designs/incremental-indexing.md`
- [ ] `docs/designs/storage.md`
- [ ] `docs/designs/indexer.md`
- [ ] `docs/designs/cli.md`
- [ ] `docs/designs/output-format.md`
- [ ] `docs/roadmaps/roadmap-v1.md`
- [ ] `docs/plans/scoped-indexing-monorepo-plan.md`

Implementation later:

- [ ] `src/indexer/*`
- [ ] `src/storage/*`
- [ ] `src/cli/*`
- [ ] `src/queries/*`
- [ ] tests / fixtures

---

## 17. Implementation Phases

### Phase 1: Documentation and Metadata Design

- [ ] Add incremental indexing design doc.
- [ ] Update README snapshot-vs-incremental section.
- [ ] Define cache metadata.
- [ ] Define freshness states.
- [ ] Define query output freshness fields.

### Phase 2: Simple Cache

- [ ] Write full graph to local cache.
- [ ] Write metadata to local cache.
- [ ] Add `status`.
- [ ] Add `clean-cache`.
- [ ] Add cache version handling.

### Phase 3: Git Freshness

- [ ] Record git commit hash.
- [ ] Record dirty working tree status.
- [ ] Warn when cache is stale.
- [ ] Add JSON/markdown freshness output.

### Phase 4: Conservative Incremental Rebuild

- [ ] Detect changed/deleted files.
- [ ] Remove owned nodes/edges.
- [ ] Rebuild changed files.
- [ ] Validate graph.
- [ ] Add stale-edge removal tests.

### Phase 5: Scoped Cache

- [ ] Add scope-aware cache identity.
- [ ] Add include/exclude metadata.
- [ ] Add scoped indexing tests.
- [ ] Add monorepo usage docs.

---

## 18. Definition of Done

This incremental/cache improvement is done when:

- [ ] README clearly distinguishes current snapshot indexing from v1 incremental target.
- [ ] Cache metadata model is documented.
- [ ] Freshness states are documented.
- [ ] Query output includes index metadata.
- [ ] Context packs include freshness caveats.
- [ ] A local cache plan exists.
- [ ] Git-aware changed-file detection is planned.
- [ ] Stale-edge removal is explicitly required.
- [ ] Tests are planned for changed, deleted, and renamed files.
- [ ] Users can understand how Code Graph avoids stale graph trust problems.

---

## 19. Remaining Gaps

- [ ] Decide JSON cache vs SQLite for first persistent implementation.
- [ ] Decide exact `.code-graph` cache path.
- [ ] Decide whether cache should be committed or ignored by default.
- [ ] Decide whether to hash file contents or rely on git state first.
- [ ] Decide how to handle untracked files in incremental mode.
- [ ] Decide whether queries should auto-index when cache is missing.
- [ ] Decide whether stale cache should warn or fail by default.

