# CLI and Query UX Plan

Status: Draft  
Purpose: Turn Code Graph from a promising architecture into something developers can quickly understand, run, and evaluate from the command line.

---

## 1. Goal

Improve the command-line and query experience so Code Graph directly answers the demand shown by the video and YouTube comments:

- [ ] "Can I use this before touching a codebase?"
- [ ] "Can I ask what depends on this?"
- [ ] "Can I ask what might break?"
- [ ] "Can I use it without a huge token bill?"
- [ ] "Can my AI agent consume the output?"
- [ ] "Can I run it on part of a repo?"
- [ ] "Can I trust what it says?"

The CLI should make Code Graph feel useful before any web UI exists.

Core principle:

> CLI-first. Query-first. Evidence-backed. Agent-readable.

---

## 2. Demand Signals

The video and comments show that developers want:

- [ ] onboarding maps
- [ ] guided tours through flows
- [ ] dependency and blast-radius answers
- [ ] incremental/scoped usage
- [ ] agent-friendly context
- [ ] local/offline operation
- [ ] less token waste
- [ ] fewer vague summaries
- [ ] concrete source references

Repo response:

- [ ] Add a real CLI facade over current scripts.
- [ ] Support practical query commands.
- [ ] Support JSON and Markdown output.
- [ ] Show evidence and diagnostics clearly.
- [ ] Keep target commands stable even while implementation grows.
- [ ] Make current implementation status honest.

---

## 3. Current State

Current scripts already exist and should be preserved during transition:

- [ ] `npm run indexer:run -- .`
- [ ] `npm run query:demo -- .`
- [ ] `npm run endpoints:inventory -- .`
- [ ] `npm run endpoints:truth -- .`
- [ ] `npm test`

Current limitation:

- [ ] `query:demo` is hardcoded around internal demo paths and symbols.
- [ ] There is not yet a user-facing command shape.
- [ ] Query output is not yet a stable product contract.
- [ ] Context-pack mode is documented as a target but not yet surfaced as a practical CLI workflow.

---

## 4. Target CLI Shape

The eventual user-facing CLI should feel like this:

> code-graph index .
>
> code-graph stats
>
> code-graph files
>
> code-graph importers src/orders/create-order.ts
>
> code-graph dependencies src/orders/create-order.ts
>
> code-graph symbols src/orders/create-order.ts
>
> code-graph callers createOrder
>
> code-graph callees createOrder
>
> code-graph endpoints
>
> code-graph endpoint "POST /api/orders"
>
> code-graph blast TicketOffer
>
> code-graph pack --from createOrder --to db --max-tokens 2000
>
> code-graph cycles
>
> code-graph dead-exports

Checklist:

- [ ] Keep commands short.
- [ ] Prefer nouns developers already use.
- [ ] Avoid clever DSL syntax in v1.
- [ ] Allow paths and symbols as plain arguments.
- [ ] Add depth limits for graph traversal commands.
- [ ] Add output format flags.
- [ ] Add scope/include/exclude flags later.

---

## 5. CLI Command Categories

### 5.1 Indexing Commands

Target commands:

> code-graph index .
>
> code-graph index packages/api
>
> code-graph index . --include src/routes --exclude "**/*.test.ts"
>
> code-graph status
>
> code-graph stats

Checklist:

- [ ] `index` builds the graph for a root/scope.
- [ ] `status` reports indexed state/freshness once cache exists.
- [ ] `stats` shows counts:
  - [ ] files
  - [ ] nodes
  - [ ] edges
  - [ ] endpoints
  - [ ] diagnostics
  - [ ] graph validation status

---

### 5.2 File-Level Queries

Target commands:

> code-graph files
>
> code-graph importers src/foo.ts
>
> code-graph dependencies src/foo.ts
>
> code-graph contains src/foo.ts

Checklist:

- [ ] Return deterministic file lists.
- [ ] Normalize user-provided paths.
- [ ] Show helpful message when path is not indexed.
- [ ] Include diagnostics when imports are unresolved.
- [ ] Support JSON output.

---

### 5.3 Symbol-Level Queries

Target commands:

> code-graph symbols src/foo.ts
>
> code-graph callers createUser
>
> code-graph callees createUser
>
> code-graph references TicketOffer
>
> code-graph blast TicketOffer

Checklist:

- [ ] Support symbol name lookup.
- [ ] Handle duplicate symbol names deterministically.
- [ ] Report ambiguity instead of guessing silently.
- [ ] Allow future disambiguation by file path.
- [ ] Include evidence references where available.
- [ ] Add depth limit for recursive queries.

Potential disambiguation shape:

> code-graph callers createUser --in src/users/create-user.ts

---

### 5.4 Endpoint Queries

Target commands:

> code-graph endpoints
>
> code-graph endpoint "POST /api/orders"
>
> code-graph endpoint --method POST --path /api/orders
>
> code-graph endpoint-truth "POST /api/orders"

Checklist:

- [ ] List detected endpoints.
- [ ] Show method/path/file/line/handler where available.
- [ ] Show related API callsites when available.
- [ ] Show diagnostics for dynamic or skipped routes.
- [ ] Keep endpoint truth output conservative.
- [ ] Avoid claiming runtime behaviour that was not statically found.

---

### 5.5 Risk and Refactor Queries

Target commands:

> code-graph blast TicketOffer
>
> code-graph blast src/orders/create-order.ts
>
> code-graph cycles
>
> code-graph dead-exports

Checklist:

- [ ] Make blast radius one of the flagship commands.
- [ ] Include inbound and outbound relationships.
- [ ] Separate direct impact from transitive impact.
- [ ] Add depth limits.
- [ ] Show truncation clearly.
- [ ] Avoid flooding the user with the entire graph.

---

### 5.6 Agent Context Pack Commands

Target commands:

> code-graph pack --from createOrder --to db --max-tokens 2000
>
> code-graph pack --endpoint "POST /api/orders" --max-tokens 3000
>
> code-graph pack --blast TicketOffer --format markdown
>
> code-graph pack --blast TicketOffer --format json

Checklist:

- [ ] Treat `pack` as a core command, not a bonus.
- [ ] Support token budget.
- [ ] Include only relevant files/ranges.
- [ ] Include evidence and diagnostics.
- [ ] Include query metadata.
- [ ] Output markdown for humans.
- [ ] Output JSON for agents.
- [ ] Avoid sending anything to an LLM by default.

---

## 6. Output Modes

Support at least:

- [ ] `--format text`
- [ ] `--format markdown`
- [ ] `--format json`

Default:

- [ ] Human-readable compact text or markdown.

Agent mode:

- [ ] JSON envelope.
- [ ] Stable field names.
- [ ] Stable ordering.
- [ ] Evidence references.
- [ ] Diagnostics.
- [ ] Truncation flags.
- [ ] Index metadata.

Example human output shape:

> Query: callers createOrder
>
> Scope: .
>
> Result: 3 callers
>
> 1. submitOrderHandler — src/routes/orders.ts:42
>
> 2. retryFailedOrder — src/jobs/retry-orders.ts:18
>
> 3. createOrderTestFixture — src/test/fixtures/orders.ts:9
>
> Diagnostics: 1 unresolved call skipped
>
> Truncated: no

Example JSON envelope fields:

> version
>
> query
>
> indexMetadata
>
> result
>
> evidence
>
> diagnostics
>
> truncation

Checklist:

- [ ] Keep default output readable.
- [ ] Keep JSON output deterministic.
- [ ] Avoid hiding diagnostics.
- [ ] Add `--verbose` for evidence-heavy output.
- [ ] Add `--quiet` later if useful.

---

## 7. Evidence UX

The CLI should make evidence visible without becoming noisy.

Default human mode:

- [ ] show file path and line
- [ ] show compact diagnostic count
- [ ] show truncation status

Verbose human mode:

- [ ] show edge IDs
- [ ] show evidence IDs
- [ ] show snippets if available
- [ ] show extractor/cause if useful

JSON mode:

- [ ] include full evidence records
- [ ] include full diagnostics
- [ ] include graph/index metadata

Suggested flags:

> --verbose
>
> --show-evidence
>
> --show-diagnostics
>
> --no-snippets

Checklist:

- [ ] Evidence should be compact by default.
- [ ] Diagnostics should never be silently hidden.
- [ ] Agents should get complete structured evidence.
- [ ] Humans should get enough evidence to trust the result.

---

## 8. Error UX

Bad CLI errors kill adoption.

Required behaviours:

- [ ] Missing path: explain path was not found in indexed graph.
- [ ] Missing symbol: explain symbol was not found.
- [ ] Ambiguous symbol: list candidates.
- [ ] No index/cache yet: suggest running index.
- [ ] Parse failures: summarize and point to diagnostics.
- [ ] Invalid format flag: list valid values.
- [ ] Unsupported language: say v1 is TypeScript-first.
- [ ] Dynamic route/call skipped: diagnose, do not guess.

Example ambiguity output:

> Ambiguous symbol: createOrder
>
> Found 3 candidates:
>
> - src/orders/create-order.ts — function createOrder
>
> - src/test/fixtures/orders.ts — function createOrder
>
> - src/legacy/order.ts — function createOrder
>
> Re-run with:
>
> code-graph callers createOrder --in src/orders/create-order.ts

Checklist:

- [ ] Be direct.
- [ ] Give next action.
- [ ] Avoid stack traces unless `--debug`.
- [ ] Return non-zero exit codes for real failures.
- [ ] Return success with diagnostics when graph is valid but incomplete.

---

## 9. Implementation Plan

### Phase 1: CLI Wrapper

- [ ] Add a single CLI entrypoint.
- [ ] Keep existing npm scripts working.
- [ ] Wire commands to existing indexer/query functions.
- [ ] Add minimal argument parsing.
- [ ] Add help output.
- [ ] Add version output.

Potential file targets:

- [ ] `src/cli/main.ts`
- [ ] `src/cli/args.ts`
- [ ] `src/cli/output.ts`
- [ ] `src/cli/commands/index.ts`
- [ ] `src/cli/commands/query.ts`

---

### Phase 2: Query Command Parity

- [ ] Convert hardcoded query demo into reusable query handlers.
- [ ] Add file query commands:
  - [ ] importers
  - [ ] dependencies
  - [ ] symbols/contains
- [ ] Add symbol query commands:
  - [ ] callers
  - [ ] callees
  - [ ] blast
- [ ] Add endpoint query commands:
  - [ ] endpoints
  - [ ] endpoint

---

### Phase 3: Output Formatting

- [ ] Add text formatter.
- [ ] Add markdown formatter.
- [ ] Add JSON formatter.
- [ ] Add shared query envelope type.
- [ ] Add diagnostics formatter.
- [ ] Add truncation formatter.

---

### Phase 4: Persistent Index / Cache Later

- [ ] Keep initial CLI able to index on demand.
- [ ] Later add cache storage.
- [ ] Add status/freshness commands.
- [ ] Add git commit/scope metadata.
- [ ] Add stale graph warnings.

---

## 10. CLI Help UX

Add useful help.

Target commands:

> code-graph --help
>
> code-graph index --help
>
> code-graph callers --help
>
> code-graph pack --help

Help should include:

- [ ] short explanation
- [ ] usage
- [ ] examples
- [ ] common flags
- [ ] output formats
- [ ] limitations

Example help snippet:

> Usage:
>
> code-graph callers SYMBOL [--in FILE] [--depth N] [--format text|markdown|json]
>
> Finds symbols that call the named symbol.
>
> If multiple symbols share the same name, Code Graph reports ambiguity instead of guessing.

---

## 11. Flags

Useful v1 flags:

- [ ] `--root <path>`
- [ ] `--scope <path>`
- [ ] `--include <glob>`
- [ ] `--exclude <glob>`
- [ ] `--depth <number>`
- [ ] `--max-nodes <number>`
- [ ] `--max-paths <number>`
- [ ] `--max-tokens <number>`
- [ ] `--format text|markdown|json`
- [ ] `--verbose`
- [ ] `--debug`
- [ ] `--no-snippets`

Do not add all flags immediately if they create scope creep.

Priority flags:

- [ ] `--format`
- [ ] `--depth`
- [ ] `--root`
- [ ] `--verbose`

---

## 12. Tests Needed

CLI tests:

- [ ] help output is stable
- [ ] invalid command returns useful error
- [ ] index command reports stats
- [ ] importers command returns deterministic output
- [ ] dependencies command returns deterministic output
- [ ] callers command handles no match
- [ ] callers command handles ambiguity
- [ ] JSON output is valid JSON
- [ ] markdown output is deterministic
- [ ] diagnostics are visible
- [ ] truncation is visible
- [ ] command exits non-zero on fatal errors

Fixture tests:

- [ ] small TypeScript project
- [ ] duplicate symbol names
- [ ] unresolved import
- [ ] direct function call
- [ ] endpoint file
- [ ] dynamic route skipped or diagnosed
- [ ] import cycle

---

## 13. Documentation Updates

Files likely affected:

- [ ] `README.md`
- [ ] `docs/designs/cli.md`
- [ ] `docs/designs/query-engine.md`
- [ ] `docs/designs/output-format.md`
- [ ] `docs/roadmaps/roadmap-v1.md`
- [ ] `docs/examples/cli-usage.md`
- [ ] `package.json`

README should show:

- [ ] current development scripts
- [ ] target CLI shape
- [ ] status of real CLI implementation
- [ ] examples for common workflows

---

## 14. Workflow Examples to Document

### 14.1 New Repo Onboarding

> code-graph index .
>
> code-graph stats
>
> code-graph endpoints
>
> code-graph cycles

Purpose:

- [ ] show structure
- [ ] find routes
- [ ] find obvious risks

---

### 14.2 Before Refactor

> code-graph blast TicketOffer
>
> code-graph callers createTicketOffer
>
> code-graph dependencies src/tickets/ticket-offers.ts

Purpose:

- [ ] find impact before editing
- [ ] reduce blind refactors

---

### 14.3 Before Asking an AI Agent

> code-graph pack --blast TicketOffer --max-tokens 3000 --format markdown

Purpose:

- [ ] provide bounded context
- [ ] avoid dumping random files
- [ ] reduce token waste

---

### 14.4 Endpoint Investigation

> code-graph endpoint "POST /api/orders"
>
> code-graph pack --endpoint "POST /api/orders" --format markdown

Purpose:

- [ ] connect route to handler
- [ ] collect relevant files
- [ ] prepare safe implementation prompt

---

## 15. Definition of Done

This CLI/query UX improvement is done when:

- [ ] README shows current scripts and target CLI clearly.
- [ ] A real CLI entrypoint exists or has a precise implementation plan.
- [ ] Hardcoded query demo is no longer the only query path.
- [ ] Users can run file-level queries.
- [ ] Users can run symbol-level queries.
- [ ] Users can list endpoints.
- [ ] Output supports at least one agent-friendly structured mode.
- [ ] Diagnostics are visible.
- [ ] Ambiguity is handled conservatively.
- [ ] Commands are documented with examples.
- [ ] A first-time developer can understand how to use Code Graph without reading architecture docs first.

---

## 16. Remaining Gaps

- [ ] Decide whether to use a CLI library or hand-rolled parsing for v1.
- [ ] Decide whether markdown or compact text should be the default human output.
- [ ] Decide how soon to add persisted cache.
- [ ] Decide how to disambiguate duplicate symbols in command syntax.
- [ ] Decide whether endpoint queries should be first-class in v1 or remain development utilities.
- [ ] Decide whether `pack` should be implemented before full `blast`.

