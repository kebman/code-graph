# Scoped Indexing and Monorepo Plan

Status: Draft  
Purpose: Make Code Graph credible for large repositories, monorepos, and gradual adoption by supporting scoped indexing before full workspace graph composition.

---

## 1. Goal

Improve Code Graph so developers can start with a useful slice of a large codebase instead of indexing everything at once.

Core promise:

> Code Graph should work on one repo, one package, one app, one module, or one feature area before attempting whole-workspace analysis.

This directly answers the practical comment-section question:

> Can I use this on a single module inside a large monorepo, or is it all-or-nothing?

---

## 2. Demand Signals

The video and comment section show strong concern about scale:

- [ ] Users ask whether these tools work on large monorepos.
- [ ] Users ask whether they can analyze a single module.
- [ ] Users worry large repos will take too long.
- [ ] Users worry large repos will burn too many tokens.
- [ ] Users worry graph output becomes too noisy.
- [ ] Users want incremental adoption.
- [ ] Users want tools that help with real messy systems, not only tiny demo repos.

Repo response:

- [ ] Treat scoped indexing as a first-class v1 design goal.
- [ ] Support root/scope distinction.
- [ ] Support include/exclude filters.
- [ ] Keep output bounded.
- [ ] Make cache identity scope-aware.
- [ ] Defer full multi-repo federation until the local scoped model is solid.

---

## 3. Current State

Current implementation already has a useful foundation:

- [ ] deterministic recursive TypeScript file scanning
- [ ] excluded directories
- [ ] normalized repository-relative paths
- [ ] root directory option
- [ ] graph validation
- [ ] deterministic output ordering

Current limitations:

- [ ] no explicit scope model beyond root directory
- [ ] no include glob support
- [ ] no exclude glob support beyond excluded directory names
- [ ] no monorepo package metadata handling
- [ ] no scoped cache identity
- [ ] no workspace-level graph composition
- [ ] no docs explaining large repo strategy

---

## 4. README Message

Add a compact public section.

Suggested text:

> # Large Repos and Monorepos
>
> Code Graph should support scoped adoption before whole-workspace indexing.
>
> Target usage:
>
>     code-graph index .
>     code-graph index packages/api
>     code-graph index apps/web --include src/surfaces/organizer
>     code-graph index . --exclude "**/*.test.ts"
>
> v1 should focus on deterministic indexing for one selected root/scope. Full multi-repo graph federation is deferred until scoped local graphs are solid.

Checklist:

- [ ] Explain scoped indexing as a feature, not a limitation.
- [ ] Give concrete examples.
- [ ] Say full multi-repo federation is deferred.
- [ ] Avoid claiming enterprise-scale graphing before implemented.
- [ ] Link to deeper scoped indexing design doc.

---

## 5. Definitions

Add or update a design doc.

Candidate file:

- [ ] `docs/designs/scoped-indexing.md`

Suggested definitions:

> Repository root:
>
> The top-level project directory or Git repository root.

> Index root:
>
> The directory Code Graph scans for source files during a given run.

> Scope:
>
> The logical area being analyzed, usually the same as the index root but potentially narrower when include filters are used.

> Include filter:
>
> A path or glob rule that narrows which files inside the index root are included.

> Exclude filter:
>
> A path, directory, or glob rule that removes files from the index set.

> Scoped graph:
>
> A graph generated from one root/scope/filter combination.

> Workspace graph:
>
> A future composition of multiple scoped graphs.

Checklist:

- [ ] Define repository root.
- [ ] Define index root.
- [ ] Define scope.
- [ ] Define include filters.
- [ ] Define exclude filters.
- [ ] Define scoped graph.
- [ ] Define future workspace graph.

---

## 6. Target CLI Shape

Commands should support small starts:

> code-graph index .
>
> code-graph index packages/api
>
> code-graph index apps/web --include src/surfaces/organizer
>
> code-graph index . --include "src/orders/**"
>
> code-graph index . --exclude "**/*.test.ts"
>
> code-graph index . --exclude dist --exclude coverage
>
> code-graph status --scope packages/api

Checklist:

- [ ] `index <path>` works as the simplest scoped indexing command.
- [ ] Include filters narrow the source set.
- [ ] Exclude filters remove files/directories.
- [ ] Status reports the active scope.
- [ ] Query output reports the scope.
- [ ] Context packs report the scope.

---

## 7. Scope Identity

Scoped graphs need stable identity.

Scope identity should include:

- [ ] repository root
- [ ] index root
- [ ] include filters
- [ ] exclude filters
- [ ] graph schema version
- [ ] indexer version
- [ ] relevant package/workspace identity if detected later

Rules:

- [ ] Indexing `.` and `packages/api` should not accidentally overwrite each other.
- [ ] Different include/exclude filters should produce distinct cache metadata.
- [ ] Query output should identify which scope was queried.
- [ ] Context packs should identify which scope produced the pack.
- [ ] Stale warnings should be scope-aware.

Suggested metadata fields:

> scope:
>
> - repoRoot
> - indexRoot
> - includeFilters
> - excludeFilters
> - scopeId
> - workspaceName, optional later
> - packageName, optional later

Checklist:

- [ ] Define scope identity in docs.
- [ ] Add scope metadata to output format plan.
- [ ] Add scope metadata to context-pack plan.
- [ ] Add scope metadata to incremental/cache plan.
- [ ] Keep identity deterministic.

---

## 8. Include/Exclude Strategy

Current excluded directories are useful but too coarse for monorepos.

Recommended v1 approach:

- [ ] keep default excluded directories
- [ ] support additional excluded directory names
- [ ] add path prefix filters first
- [ ] add glob support later if needed
- [ ] normalize all filter paths
- [ ] sort filters deterministically
- [ ] store filters in cache metadata

Default excluded directories:

- [ ] `node_modules`
- [ ] `.git`
- [ ] `dist`
- [ ] `build`
- [ ] `coverage`

Potential default excluded file patterns later:

- [ ] `*.d.ts`
- [ ] generated files
- [ ] lockfiles
- [ ] large fixture directories
- [ ] snapshots

Checklist:

- [ ] Do not overcomplicate filter syntax immediately.
- [ ] Prefer simple path-prefix support first.
- [ ] Document exact matching behaviour.
- [ ] Add tests for include/exclude determinism.
- [ ] Ensure ignored files do not appear in graph facts.

---

## 9. Monorepo Package Detection

Package detection is useful but should not block v1.

Potential package signals:

- [ ] `package.json`
- [ ] `pnpm-workspace.yaml`
- [ ] `turbo.json`
- [ ] `nx.json`
- [ ] `workspace:*` dependencies
- [ ] `tsconfig.json`
- [ ] `tsconfig.references`

v1 stance:

- [ ] Manual scope path is enough.
- [ ] Package detection can be later.
- [ ] Do not require workspace tooling integration.
- [ ] Do not require Nx/Turborepo support in v1.

Later improvements:

- [ ] list workspace packages
- [ ] index one package by package name
- [ ] detect cross-package imports
- [ ] build workspace-level graph from scoped package graphs

Checklist:

- [ ] Document package detection as future.
- [ ] Keep v1 path-based.
- [ ] Avoid tying Code Graph to one monorepo manager.
- [ ] Keep TypeScript-first.

---

## 10. Cross-Scope Edges

Scoped indexing creates a question:

> What happens when a scoped file imports a file outside the scope?

Recommended v1 behaviour:

- [ ] detect in-scope imports normally
- [ ] for out-of-scope imports, create diagnostic or external reference metadata
- [ ] do not silently pretend out-of-scope code was indexed
- [ ] optionally create external File node only if model supports it clearly
- [ ] make out-of-scope limitations visible in query output/context packs

Suggested diagnostic:

> OUT_OF_SCOPE_IMPORT
>
> File `packages/api/src/orders.ts` imports `packages/shared/src/types.ts`, but the target is outside the indexed scope.

Checklist:

- [ ] Define out-of-scope import behaviour.
- [ ] Avoid broken edges to missing nodes.
- [ ] Prefer diagnostic over fake completeness.
- [ ] Include out-of-scope diagnostics in context packs.
- [ ] Add tests for scoped import boundary.

---

## 11. Query Behaviour in Scoped Graphs

Queries should be scope-aware.

Examples:

> code-graph callers createOrder --scope packages/api
>
> code-graph importers src/orders/create-order.ts
>
> code-graph pack --blast TicketOffer --scope packages/api

Rules:

- [ ] Query results are only complete for the indexed scope.
- [ ] Output must say which scope was queried.
- [ ] If cross-scope imports were skipped, diagnostics should say so.
- [ ] Pack caveats should warn about scoped incompleteness.
- [ ] Ambiguous symbols are resolved only within the active scope unless workspace graph exists later.

Suggested caveat:

> Caveat: This result is scoped to `packages/api`. Callers or imports outside that scope may not be included.

Checklist:

- [ ] Add scope caveat to human output.
- [ ] Add scope metadata to JSON output.
- [ ] Add scope caveat to context packs.
- [ ] Add tests for scoped query output.

---

## 12. Scoped Context Packs

Context packs should use scoped indexing naturally.

Example:

> code-graph pack --scope packages/api/src/orders --max-tokens 3000 --format markdown

Pack header should include:

- [ ] repo root
- [ ] scope/index root
- [ ] include filters
- [ ] exclude filters
- [ ] freshness state
- [ ] diagnostics count
- [ ] truncation state

Pack caveats should include:

- [ ] scope boundary
- [ ] out-of-scope imports
- [ ] unresolved calls
- [ ] skipped dynamic patterns
- [ ] stale cache status

Checklist:

- [ ] Do not imply whole-repo coverage when pack is scoped.
- [ ] Make scoped packs useful for AI agents.
- [ ] Include out-of-scope diagnostics.
- [ ] Include file references for boundary imports where practical.

---

## 13. Large Repo Performance Strategy

v1 should avoid premature optimization but still avoid obvious traps.

Performance principles:

- [ ] scan only selected root/scope
- [ ] exclude generated/heavy directories by default
- [ ] avoid local variable explosion
- [ ] index exported symbols first
- [ ] bound traversal depth
- [ ] bound query result size
- [ ] provide truncation flags
- [ ] use cache/incremental updates later

Potential metrics to report:

- [ ] files scanned
- [ ] files indexed
- [ ] files ignored
- [ ] parse failures
- [ ] node count
- [ ] edge count
- [ ] diagnostics count
- [ ] elapsed time, optional

Checklist:

- [ ] Add stats to CLI output.
- [ ] Add stats to index metadata.
- [ ] Use result limits in query outputs.
- [ ] Use truncation metadata instead of flooding output.

---

## 14. Multi-Repo Federation

Do not build this too early.

Deferred concept:

> Workspace graph composition can later connect multiple scoped graphs from multiple repos or packages.

Potential future use cases:

- [ ] frontend repo calling backend API routes
- [ ] backend repo matching docs repo endpoint contracts
- [ ] shared types package used by apps
- [ ] infrastructure repo mapping runtime services
- [ ] multi-service architecture overview

Deferred requirements:

- [ ] stable repo identities
- [ ] external node references
- [ ] cross-repo edge model
- [ ] API contract matching
- [ ] versioned graph snapshots
- [ ] security/privacy handling

v1 rule:

- [ ] Do not let multi-repo goals delay scoped single-repo usefulness.

---

## 15. Tests Needed

Scoped indexing tests:

- [ ] index root scans only selected directory
- [ ] include filter narrows files
- [ ] exclude filter removes files
- [ ] excluded files do not produce nodes
- [ ] excluded files do not produce edges
- [ ] default excluded directories are ignored
- [ ] scope metadata is deterministic
- [ ] scoped cache identity differs for different scopes
- [ ] out-of-scope import becomes diagnostic or external marker
- [ ] query output reports scope
- [ ] context pack reports scope
- [ ] repeated scoped runs are deterministic

Fixture layout:

- [ ] root package
- [ ] `packages/api`
- [ ] `packages/shared`
- [ ] `apps/web`
- [ ] cross-package import
- [ ] generated directory
- [ ] test file
- [ ] dynamic import example

---

## 16. Documentation Files Likely Affected

- [ ] `README.md`
- [ ] `docs/designs/scoped-indexing.md`
- [ ] `docs/designs/indexer.md`
- [ ] `docs/designs/cli.md`
- [ ] `docs/designs/output-format.md`
- [ ] `docs/designs/context-packs.md`
- [ ] `docs/designs/incremental-indexing.md`
- [ ] `docs/roadmaps/roadmap-v1.md`
- [ ] `docs/examples/scoped-indexing-examples.md`

Implementation later:

- [ ] `src/indexer/file-scanner.ts`
- [ ] `src/indexer/indexer.ts`
- [ ] `src/cli/*`
- [ ] `src/storage/*`
- [ ] `src/queries/*`
- [ ] tests / fixtures

---

## 17. Implementation Phases

### Phase 1: Documentation

- [ ] Add scoped indexing design doc.
- [ ] Update README large repo / monorepo section.
- [ ] Update CLI design with scope/include/exclude examples.
- [ ] Update output format with scope metadata.
- [ ] Update context-pack design with scope caveats.

### Phase 2: Path-Based Scope

- [ ] Ensure `index <path>` works as intended.
- [ ] Treat provided path as index root.
- [ ] Report index root in output.
- [ ] Add tests for path-scoped indexing.

### Phase 3: Include/Exclude Filters

- [ ] Add explicit exclude support beyond directory names.
- [ ] Add include support.
- [ ] Normalize filters.
- [ ] Store filters in index metadata.
- [ ] Add deterministic tests.

### Phase 4: Out-of-Scope Diagnostics

- [ ] Detect imports outside indexed scope.
- [ ] Add `OUT_OF_SCOPE_IMPORT` diagnostic or equivalent.
- [ ] Include diagnostics in query output/context packs.
- [ ] Add fixture tests.

### Phase 5: Scope-Aware Cache

- [ ] Add scoped cache metadata.
- [ ] Prevent cross-scope cache contamination.
- [ ] Add `status --scope`.
- [ ] Add cache tests.

---

## 18. Definition of Done

Scoped indexing is demand-aligned when:

- [ ] README explains the monorepo/scoped adoption strategy.
- [ ] `index <path>` is documented as the first scoped workflow.
- [ ] Include/exclude behaviour is documented.
- [ ] Scope identity is defined.
- [ ] Query output reports scope.
- [ ] Context packs report scope and limitations.
- [ ] Out-of-scope imports are diagnosed or clearly marked.
- [ ] Cache metadata includes scope.
- [ ] Tests prove scoped indexing is deterministic.
- [ ] Developers can start with one package/module instead of the whole repo.

---

## 19. Remaining Gaps

- [ ] Decide whether v1 needs glob support or path-prefix filters are enough.
- [ ] Decide exact syntax for include/exclude flags.
- [ ] Decide whether out-of-scope imports should become diagnostics, external nodes, or both.
- [ ] Decide whether test files are included by default.
- [ ] Decide whether generated files need a default ignore list.
- [ ] Decide whether package detection belongs in v1 or v2.
- [ ] Decide how scoped caches are named and stored.

