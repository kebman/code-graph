# Demo and Comparison Plan

Status: Draft
Purpose: Make Code Graph easy to understand, evaluate, and compare against LLM-first codebase mapping tools by showing concrete workflows, outputs, and limits.

---

## 1. Goal

Create demos and comparison material that prove Code Graph’s practical value without overclaiming.

The repo should show:

- [ ] what Code Graph does today
- [ ] what it is designed to do next
- [ ] how it differs from LLM-first codebase mappers
- [ ] how it helps humans inspect unfamiliar code
- [ ] how it helps AI agents receive smaller, better context
- [ ] how it avoids turning guesses into graph facts
- [ ] how it handles current limitations honestly

Core demo promise:

> Code Graph gives you deterministic repo facts first, then lets humans and AI agents ask better questions.

---

## 2. Demand Signals

The video and comments show that developers respond strongly to:

- [ ] visual architecture overviews
- [ ] onboarding walkthroughs
- [ ] flow tracing
- [ ] dependency impact analysis
- [ ] agent context
- [ ] incremental updates
- [ ] local/no-token workflows
- [ ] trust and evidence
- [ ] honest comparison against existing tools

The repo should therefore include demos that answer:

- [ ] How do I run this?
- [ ] What output do I get?
- [ ] How does this help before editing code?
- [ ] How does this help an AI agent?
- [ ] Why should I trust this more than broad AI prose?
- [ ] What does it not do yet?

---

## 3. Demo Strategy

Prioritize simple, reproducible demos over polished UI.

Recommended order:

- [ ] CLI demo
- [ ] endpoint inventory demo
- [ ] refactor/blast-radius demo
- [ ] agent context pack demo
- [ ] scoped indexing demo
- [ ] Mermaid/DOT export demo later
- [ ] visual dashboard later

Rule:

> Show deterministic query value before building a dashboard.

---

## 4. README Demo Section

Add a short demo section near the top of `README.md`.

Suggested text:

> # Quick Demo
>
> During development, run:
>
>    ´´´bash
>    npm install
>    npm run indexer:run -- .
>    npm run query:demo -- .
>    npm run endpoints:inventory -- .
>    npm run endpoints:truth -- .
>    ´´´
>
> Target v1 CLI shape:
>
>     code-graph index .
>     code-graph stats
>     code-graph importers src/foo.ts
>     code-graph callers createOrder
>     code-graph endpoints
>     code-graph pack --blast TicketOffer --max-tokens 3000 --format markdown

Checklist:

- [ ] Clearly separate current scripts from target CLI.
- [ ] Keep commands copy-pasteable.
- [ ] Avoid shell prompt markers.
- [ ] Keep demo short enough for first-time visitors.
- [ ] Link to deeper examples.

---

## 5. Example Docs Directory

Create a examples area.

Candidate files:

- [ ] `docs/examples/quick-demo.md`
- [ ] `docs/examples/refactor-blast-radius-demo.md`
- [ ] `docs/examples/endpoint-inventory-demo.md`
- [ ] `docs/examples/agent-context-pack-demo.md`
- [ ] `docs/examples/scoped-indexing-demo.md`
- [ ] `docs/examples/output-samples.md`

Purpose:

- [ ] Keep README concise.
- [ ] Provide practical walkthroughs.
- [ ] Give future contributors concrete behaviour targets.
- [ ] Make value visible without needing a finished UI.

---

## 6. Quick Demo Plan

Candidate file:

- [ ] `docs/examples/quick-demo.md`

Suggested structure:

- [ ] What this demo shows
- [ ] Requirements
- [ ] Current development commands
- [ ] Expected output shape
- [ ] What the output means
- [ ] Known limitations
- [ ] Next commands to try

Suggested content:

> # Quick Demo
>
> This demo shows the current development workflow for indexing a TypeScript repository and printing graph/query information.
>
> Run:
>
>     npm install
>     npm run indexer:run -- .
>     npm run query:demo -- .
>
> The output should show:
>
> - files indexed
> - graph node count
> - graph edge count
> - diagnostics count
> - endpoint inventory, when detected
>
> The current query demo is intentionally simple. The target v1 CLI will expose these queries as direct commands.

Checklist:

- [ ] Keep this accurate to current implementation.
- [ ] Mention hardcoded demo limitation if still true.
- [ ] Avoid claiming finished CLI.
- [ ] Add sample output when stable.

---

## 7. Refactor / Blast Radius Demo

Candidate file:

- [ ] `docs/examples/refactor-blast-radius-demo.md`

Purpose:

Show the key practical workflow:

> Before changing this symbol/file, ask what depends on it.

Target commands:

> code-graph blast TicketOffer
>
> code-graph callers createTicketOffer
>
> code-graph importers src/tickets/ticket-offers.ts
>
> code-graph dependencies src/tickets/ticket-offers.ts

Suggested sections:

- [ ] Problem
- [ ] Command
- [ ] Example output
- [ ] How to read the output
- [ ] Evidence and diagnostics
- [ ] What Code Graph does not claim

Suggested wording:

> Code Graph does not prove that a change is safe. It shows statically detected relationships so you can inspect likely impact before editing.

Checklist:

- [ ] Make this the flagship developer workflow.
- [ ] Distinguish direct impact from transitive impact.
- [ ] Show truncation behaviour once implemented.
- [ ] Show diagnostics for incomplete resolution.
- [ ] Avoid calling it perfect impact analysis.

---

## 8. Endpoint Inventory Demo

Candidate file:

- [ ] `docs/examples/endpoint-inventory-demo.md`

Purpose:

Show value for backend projects and documentation alignment.

Current development commands:

> npm run endpoints:inventory -- .
>
> npm run endpoints:truth -- .

Target commands:

> code-graph endpoints
>
> code-graph endpoint "POST /api/orders"
>
> code-graph endpoint-truth "POST /api/orders"

Suggested sections:

- [ ] What endpoint inventory means
- [ ] What endpoint truth means
- [ ] How detected endpoints are reported
- [ ] How dynamic/skipped routes are diagnosed
- [ ] How this helps docs and AI agents

Suggested output shape:

> Method: POST
>
> Path: /api/orders
>
> File: src/routes/orders.ts
>
> Handler: createOrderHandler
>
> Diagnostics: none

Checklist:

- [ ] Keep endpoint claims conservative.
- [ ] Mention static detection only.
- [ ] Show method/path/file/line.
- [ ] Include diagnostics for dynamic routes.
- [ ] Link to trust model.

---

## 9. Agent Context Pack Demo

Candidate file:

- [ ] `docs/examples/agent-context-pack-demo.md`

Purpose:

Make the agent-facing use case obvious.

Target commands:

> code-graph pack --blast TicketOffer --max-tokens 3000 --format markdown
>
> code-graph pack --endpoint "POST /api/orders" --max-tokens 3000 --format markdown
>
> code-graph pack --from createOrder --to db --max-tokens 4000 --format json

Suggested sections:

- [ ] Why context packs exist
- [ ] How they reduce token waste
- [ ] How they differ from broad repo summaries
- [ ] What a pack includes
- [ ] How to paste/use a pack with an AI agent
- [ ] What not to assume

Suggested text:

> A context pack is not a full repository summary. It is a bounded evidence bundle for one task.

Checklist:

- [ ] Show Markdown pack shape.
- [ ] Show JSON pack shape conceptually.
- [ ] Include diagnostics and caveats.
- [ ] Mention no LLM required to generate pack.
- [ ] Mention future `--for codex|claude|cursor|generic` as optional/deferred if useful.

---

## 10. Scoped Indexing Demo

Candidate file:

- [ ] `docs/examples/scoped-indexing-demo.md`

Purpose:

Answer monorepo/large-repo concerns.

Target commands:

> code-graph index packages/api
>
> code-graph index apps/web --include src/surfaces/organizer
>
> code-graph index . --exclude "**/*.test.ts"
>
> code-graph status --scope packages/api

Suggested sections:

- [ ] Why scoped indexing matters
- [ ] Single package demo
- [ ] Feature-area demo
- [ ] Include/exclude demo
- [ ] Scope caveats
- [ ] Out-of-scope imports

Suggested caveat:

> Results are complete only for the indexed scope. Imports or callers outside the scope may be absent unless a workspace-level graph is built later.

Checklist:

- [ ] Present scoped indexing as intentional.
- [ ] Avoid enterprise-scale claims.
- [ ] Explain out-of-scope diagnostics.
- [ ] Link to scoped indexing design.

---

## 11. Output Samples

Candidate file:

- [ ] `docs/examples/output-samples.md`

Purpose:

Show stable target output without requiring users to infer from source.

Include sample outputs for:

- [ ] index stats
- [ ] importers query
- [ ] callers query
- [ ] endpoint list
- [ ] diagnostics
- [ ] JSON envelope
- [ ] context pack markdown
- [ ] truncation warning

Guideline:

- [ ] Use small fictional examples.
- [ ] Mark samples as illustrative if not yet exact.
- [ ] Update samples when CLI output stabilizes.
- [ ] Do not show impossible features as current.

Example sample style:

> Query: callers createOrder
>
> Scope: packages/api
>
> Result: 3 callers
>
> Diagnostics: 1 unresolved call skipped
>
> Truncated: no

Checklist:

- [ ] Keep examples compact.
- [ ] Avoid long fake output.
- [ ] Include trust markers.
- [ ] Include diagnostics.
- [ ] Include scope/freshness when relevant.

---

## 12. Comparison Doc

Create a comparison doc without turning it into a hit piece.

Candidate file:

- [ ] `docs/plans/comparison-to-llm-codebase-mappers.md`

Suggested framing:

> LLM-first codebase mappers prove that developers want better repo understanding.
>
> Code Graph focuses on the deterministic substrate: local indexing, evidence-backed graph facts, cheap repeatable queries, and bounded context packs for agents.

Comparison axes:

- [ ] Indexing cost
- [ ] LLM dependency
- [ ] Trust model
- [ ] Evidence references
- [ ] Freshness/incremental model
- [ ] Agent-readable output
- [ ] Visualization
- [ ] Scope/monorepo adoption
- [ ] Current maturity

Suggested comparison table:

> Concern | LLM-first mapper tendency | Code Graph stance
>
> Token cost | often spends tokens during mapping | local deterministic index first
>
> Trust | semantic summaries may blur facts and guesses | graph facts require static evidence
>
> Agent use | may produce broad explanations | emits bounded context packs
>
> UI | often dashboard-forward | query/CLI-first, UI later
>
> Freshness | snapshot risk unless updated | v1 target: git-aware incremental cache

Checklist:

- [ ] Keep tone respectful.
- [ ] Do not name competitors unless useful.
- [ ] Do not claim Code Graph already has all planned features.
- [ ] Use "stance" and "target" where appropriate.
- [ ] Make it easy for users to understand tradeoffs.

---

## 13. Visual Export Demo

Visualization should be lightweight before a full UI.

Future target commands:

> code-graph blast TicketOffer --format mermaid
>
> code-graph endpoint "POST /api/orders" --format mermaid
>
> code-graph dependencies src/foo.ts --format dot

Candidate file:

- [ ] `docs/examples/visual-export-demo.md`

Purpose:

- [ ] satisfy visual-code-map demand
- [ ] avoid building a full dashboard too early
- [ ] let users paste output into Mermaid/Graphviz
- [ ] help README screenshots later

Checklist:

- [ ] Defer until stable query subgraphs exist.
- [ ] Keep exported graph small.
- [ ] Add truncation warnings.
- [ ] Avoid graph explosion.
- [ ] Use deterministic node ordering.

---

## 14. Demo Fixture Repo

Create a tiny fixture project for repeatable demos.

Candidate path:

- [ ] `fixtures/demo-typescript-api/`

Fixture should include:

- [ ] route file
- [ ] handler
- [ ] service function
- [ ] repository/db function
- [ ] shared type
- [ ] unresolved/dynamic example
- [ ] duplicate symbol example
- [ ] import cycle example, optional
- [ ] test file, optional

Use cases:

- [ ] stable CLI examples
- [ ] regression tests
- [ ] docs examples
- [ ] screenshot/export examples later

Checklist:

- [ ] Keep fixture small.
- [ ] Do not use real business project code.
- [ ] Add README explaining fixture intent.
- [ ] Make expected outputs stable.

---

## 15. Demo Acceptance Criteria

A good demo should answer:

- [ ] What command do I run?
- [ ] What result do I get?
- [ ] What does the result mean?
- [ ] What evidence supports it?
- [ ] What diagnostics or caveats apply?
- [ ] How does this help before editing code?
- [ ] How would an AI agent use it?
- [ ] What is not covered?

Avoid demos that:

- [ ] require a polished UI
- [ ] require LLM access
- [ ] require private repos
- [ ] hide diagnostics
- [ ] imply perfect runtime understanding
- [ ] show huge unreadable graphs
- [ ] depend on nondeterministic output

---

## 16. Files Likely Affected

README and positioning:

- [ ] `README.md`
- [ ] `docs/plans/comparison-to-llm-codebase-mappers.md`

Examples:

- [ ] `docs/examples/quick-demo.md`
- [ ] `docs/examples/refactor-blast-radius-demo.md`
- [ ] `docs/examples/endpoint-inventory-demo.md`
- [ ] `docs/examples/agent-context-pack-demo.md`
- [ ] `docs/examples/scoped-indexing-demo.md`
- [ ] `docs/examples/output-samples.md`
- [ ] `docs/examples/visual-export-demo.md`

Fixtures:

- [ ] `fixtures/demo-typescript-api/README.md`
- [ ] `fixtures/demo-typescript-api/package.json`
- [ ] `fixtures/demo-typescript-api/src/routes/orders.ts`
- [ ] `fixtures/demo-typescript-api/src/handlers/create-order-handler.ts`
- [ ] `fixtures/demo-typescript-api/src/services/create-order.ts`
- [ ] `fixtures/demo-typescript-api/src/db/orders-repository.ts`
- [ ] `fixtures/demo-typescript-api/src/types/order.ts`

Implementation later:

- [ ] CLI formatters
- [ ] Mermaid/DOT exporters
- [ ] context-pack generator
- [ ] regression tests using fixture

---

## 17. Implementation Phases

### Phase 1: Documentation Demo Skeleton

- [ ] Add quick demo doc.
- [ ] Add comparison doc.
- [ ] Add README quick demo section.
- [ ] Add output samples doc with illustrative output.
- [ ] Mark target CLI examples clearly.

### Phase 2: Fixture

- [ ] Add small TypeScript API fixture.
- [ ] Ensure indexer can scan it.
- [ ] Add expected output snapshots.
- [ ] Use fixture in docs.

### Phase 3: Current Script Demos

- [ ] Document current `npm run` demo commands.
- [ ] Capture stable current output.
- [ ] Add "what this means" explanations.
- [ ] Mention current limitations.

### Phase 4: Target CLI Demos

- [ ] Update examples when real CLI exists.
- [ ] Add importers/callers/endpoints examples.
- [ ] Add context-pack examples.
- [ ] Add scoped indexing examples.

### Phase 5: Visual Export Demos

- [ ] Add Mermaid export once implemented.
- [ ] Add DOT export once implemented.
- [ ] Add screenshot only after output is stable.

---

## 18. README Demo DoD

README demo improvements are done when:

- [ ] A first-time visitor sees current commands quickly.
- [ ] Target CLI shape is clear but not misleading.
- [ ] The difference between current and planned features is obvious.
- [ ] The demo highlights local/no-token indexing.
- [ ] The demo highlights evidence and diagnostics.
- [ ] The demo highlights agent context packs.
- [ ] The demo does not depend on a UI.
- [ ] Deeper examples are linked.

---

## 19. Comparison DoD

The comparison material is done when:

- [ ] It respectfully acknowledges LLM-first mappers as useful.
- [ ] It explains Code Graph’s deterministic-first stance.
- [ ] It compares token cost, trust, agent output, freshness, scope, and UI.
- [ ] It clearly labels planned features as planned.
- [ ] It avoids competitor drama.
- [ ] It makes the repo’s strategic wedge obvious.

---

## 20. Full Plan Set Completed

This is the final focused plan in the current set.

Completed plan files:

- [x] `docs/plans/youtube-demand-response-plan.md`
- [x] `docs/plans/readme-positioning-plan.md`
- [x] `docs/plans/trust-and-evidence-plan.md`
- [x] `docs/plans/cli-and-query-ux-plan.md`
- [x] `docs/plans/agent-context-pack-plan.md`
- [x] `docs/plans/incremental-indexing-and-cache-plan.md`
- [x] `docs/plans/scoped-indexing-monorepo-plan.md`
- [x] `docs/plans/demo-and-comparison-plan.md`

---

## 21. Remaining Gaps

- [ ] Decide whether to implement docs-only first or pair docs with a small fixture.
- [ ] Decide whether comparison docs should name Understand Anything or stay generic.
- [ ] Decide whether to prioritize context-pack demo before full CLI.
- [ ] Decide when to add Mermaid/DOT export.
- [ ] Decide whether example output should be generated from fixtures or hand-written until CLI stabilizes.
- [ ] Decide whether screenshots belong in README before a real visual exporter exists.
