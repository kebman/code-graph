# YouTube Demand Response Plan

Status: Draft  
Source trigger: Better Stack video and YouTube comment-section demand around Understand Anything / codebase knowledge graphs  
Purpose: Convert observed market demand into concrete repo improvements for Code Graph

---

## 1. Core Opportunity

The video and comments show clear demand for tools that help developers understand large codebases before making changes.

The strongest demand is not merely for visual graphs. The demand is for:

- cheap repo understanding
- deterministic code maps
- trustworthy evidence
- AI-agent context that does not waste tokens
- incremental updates
- scoped analysis for real repos
- practical onboarding and refactor support

Code Graph should position itself as the deterministic substrate beneath AI coding agents.

Preferred positioning:

> Code Graph builds a deterministic, local, evidence-backed map of a codebase so humans and AI agents can query precise context without burning LLM tokens to rediscover the repository every run.

---

## 2. Demand Signals Observed

### 2.1 Token Cost Pain

Observed demand:

- Users are worried about tools that burn expensive LLM tokens just to map a repo.
- Some users explicitly want local models or no-token workflows.
- The video itself emphasized heavy token usage.

Repo response:

- [ ] Make "no LLM required for indexing" a front-page README claim.
- [ ] Explain that Code Graph builds the structural graph deterministically first.
- [ ] Explain that LLMs are optional consumers of bounded context packs, not the indexing engine.
- [ ] Add a short "Cost model" section:
  - indexing cost: local CPU
  - graph query cost: local
  - LLM cost: only when user chooses to send a generated context pack

Success criterion:

- A new visitor immediately understands that Code Graph is not another token-burning repo summarizer.

---

### 2.2 Trust / Hallucination Pain

Observed demand:

- Users fear AI-generated repo maps that invent business logic.
- At least one comment reported a dangerous hallucinated statement about contract logic.
- Developers need facts, not confident summaries.

Repo response:

- [ ] Make "static evidence only" a public product principle, not only an internal agent rule.
- [ ] Add a README section: "Facts vs annotations".
- [ ] Define graph edges as mechanically extracted facts.
- [ ] Define diagnostics as the place for uncertain findings.
- [ ] Treat future LLM summaries as non-authoritative annotations.
- [ ] Require evidence references for query output:
  - file path
  - line
  - column
  - edge id
  - optional snippet

Success criterion:

- A skeptical developer can see that Code Graph is designed to avoid turning guesses into graph truth.

---

### 2.3 Agent Context Demand

Observed demand:

- Users ask whether coding agents can use the graph to plan features.
- Users want less random file dumping into prompts.
- The strongest practical use case is not the UI; it is better agent context.

Repo response:

- [ ] Promote "AI Context Pack Mode" as a primary feature.
- [ ] Add concrete examples:
  - `pack --from controller --to db --max-tokens 2000`
  - `pack --blast TicketOffer --max-tokens 3000`
  - `pack --endpoint "POST /api/orders"`
- [ ] Define context packs as bounded, evidence-backed, token-budgeted outputs.
- [ ] Add output modes for:
  - human markdown
  - JSON
  - agent prompt block
- [ ] Document intended consumers:
  - Codex
  - Claude Code
  - Cursor
  - Gemini CLI
  - local agents

Success criterion:

- A developer understands how Code Graph helps an AI agent make a safer change.

---

### 2.4 Incremental Update Demand

Observed demand:

- Users ask whether the graph updates itself or is only a snapshot.
- Maintainers of competing tools emphasize incremental updates.
- Stale graphs are a known trust problem.

Repo response:

- [ ] Add a dedicated "Snapshot vs incremental" section.
- [ ] State current status honestly.
- [ ] State v1 target:
  - git-aware changed-file detection
  - re-index changed files only
  - recompute inbound/outbound edges
  - remove stale edges
  - stable graph IDs across runs
- [ ] Add roadmap checklist for cache invalidation.
- [ ] Add tests proving stale edges are removed after changed imports/calls.

Success criterion:

- The repo has a credible answer to "how do I keep the graph up to date?"

---

### 2.5 Scoped / Monorepo Demand

Observed demand:

- Users ask whether tools can analyze one module in a large monorepo.
- Users worry that full-repo indexing may be impractical.
- Large repos need scoped adoption.

Repo response:

- [ ] Add scoped indexing plan:
  - `index .`
  - `index packages/api`
  - `index apps/web --include src/surfaces/organizer`
- [ ] Add include/exclude glob support.
- [ ] Document v1 monorepo stance:
  - scoped indexing supported first
  - full workspace graph later
  - multi-repo graph composition deferred
- [ ] Add examples for Docker-first TypeScript projects.
- [ ] Add fixture tests for nested packages.

Success criterion:

- A developer with a monorepo understands how to start small instead of indexing everything.

---

### 2.6 Visualization Demand

Observed demand:

- The video’s visual dashboard is compelling.
- Some commenters say UI is mostly useful for humans, while agents need precise context.
- The product should not lead with UI before the graph/query core is solid.

Repo response:

- [ ] Keep UI explicitly post-v1.
- [ ] Support export formats that make future visualization easy:
  - JSON subgraph
  - Mermaid
  - DOT/Graphviz
- [ ] Add a "visualization later" note:
  - graph viewer is useful
  - but deterministic query output comes first
- [ ] Add one low-cost visualization demo before a full UI:
  - `code-graph query blast Foo --format mermaid`

Success criterion:

- Code Graph benefits from the visual-code-map hype without becoming a dashboard-first project.

---

## 3. Messaging Changes Needed

### 3.1 Current README Message

Current implied message:

> Code Graph is a structural, queryable representation of a software repository.

This is accurate, but too abstract.

### 3.2 Stronger README Message

Better public message:

> Code Graph is a deterministic, local, evidence-backed codebase map for developers and AI coding agents. It indexes repository structure without LLM token burn, then produces precise context packs for onboarding, refactors, endpoint tracing, and safe agent work.

### 3.3 Comparison Message

Use this framing:

> LLM codebase mappers are useful because they prove the demand for repo understanding. Code Graph focuses on the lower-level substrate: stable graph facts, local indexing, evidence-backed queries, and token-minimal agent context.

Avoid:

- [ ] Do not claim competing tools are useless.
- [ ] Do not overclaim semantic understanding before implemented.
- [ ] Do not promise perfect dynamic analysis.
- [ ] Do not market the project as a full IDE replacement.
- [ ] Do not lead with a UI that does not exist yet.

---

## 4. Repo Improvement Themes

### Theme A: Public Positioning

Files likely affected:

- [ ] `README.md`
- [ ] `docs/positioning/youtube-demand-response-plan.md`
- [ ] `docs/positioning/comparison-to-llm-codebase-mappers.md`

Goal:

- Make the repo instantly understandable to people arriving from the Understand Anything / codebase-map hype cycle.

---

### Theme B: Trust Contract

Files likely affected:

- [ ] `README.md`
- [ ] `docs/architecture/edge-explanations.md`
- [ ] `docs/designs/output-format.md`
- [ ] `docs/architecture/graph-validation.md`

Goal:

- Make it clear that graph facts require static evidence and uncertain findings become diagnostics.

---

### Theme C: CLI Usability

Files likely affected:

- [ ] `docs/designs/cli.md`
- [ ] `src/queries/run-query-demo.ts`
- [ ] new CLI entrypoint if not already present

Goal:

- Move from hardcoded demos toward practical commands.

---

### Theme D: Agent Context Packs

Files likely affected:

- [ ] `docs/designs/output-format.md`
- [ ] `docs/designs/query-engine.md`
- [ ] `docs/designs/context-packs.md`
- [ ] future `src/queries/context-pack.ts`

Goal:

- Make Code Graph useful to Codex/Claude/Cursor/local agents before any visual UI exists.

---

### Theme E: Incremental Indexing

Files likely affected:

- [ ] `docs/roadmaps/roadmap-v1.md`
- [ ] `docs/designs/indexer.md`
- [ ] `docs/designs/storage.md`
- [ ] future cache/index metadata implementation

Goal:

- Answer the snapshot/staleness objection.

---

### Theme F: Scoped Indexing / Monorepo Adoption

Files likely affected:

- [ ] `docs/designs/indexer.md`
- [ ] `docs/roadmaps/roadmap-v1.md`
- [ ] future CLI docs
- [ ] future file scanner options

Goal:

- Let developers start with one package/module instead of the whole repo.

---

### Theme G: Demo and Proof

Files likely affected:

- [ ] `README.md`
- [ ] `docs/examples/`
- [ ] test fixtures
- [ ] future screenshots or generated Mermaid examples

Goal:

- Show tangible value quickly:
  - endpoint inventory
  - blast radius
  - importers
  - callers
  - agent context pack

---

## 5. Recommended Work Order

### Pass 1: Positioning

- [ ] Update README top section.
- [ ] Add comparison-to-LLM-mappers doc.
- [ ] Add demand-response doc.
- [ ] Add honest status table.

Why first:

- The market window is now.
- The repo already has enough substance to explain the thesis.

---

### Pass 2: Trust and Evidence

- [ ] Promote static-evidence rules from agent guidance into public docs.
- [ ] Clarify graph facts vs diagnostics vs future annotations.
- [ ] Tighten output format around evidence references.
- [ ] Add examples of conservative omissions.

Why second:

- This is the strongest defense against "AI slop" criticism.

---

### Pass 3: CLI Surface

- [ ] Add real command shape.
- [ ] Replace or supplement hardcoded query demo.
- [ ] Add `--format json|markdown`.
- [ ] Add deterministic output examples.

Why third:

- A repo visitor should be able to imagine using it immediately.

---

### Pass 4: Agent Context Packs

- [ ] Define context pack schema.
- [ ] Define token-budget behavior.
- [ ] Add examples for Codex/Claude/Cursor.
- [ ] Add future implementation tasks.

Why fourth:

- This is the biggest practical wedge against token-heavy repo mappers.

---

### Pass 5: Incremental and Cache

- [ ] Document git-diff incremental indexing.
- [ ] Define cache invalidation rules.
- [ ] Add stale-edge removal test plan.
- [ ] Add roadmap acceptance criteria.

Why fifth:

- This answers "snapshot or live?" without derailing current v1.

---

### Pass 6: Scoped Indexing

- [ ] Add include/exclude path strategy.
- [ ] Add monorepo/module examples.
- [ ] Add future multi-repo stance.
- [ ] Add fixture plan.

Why sixth:

- This makes the tool credible for real repositories without overpromising enterprise scale.

---

### Pass 7: Demo and Comparison

- [ ] Add example workflows.
- [ ] Add generated sample outputs.
- [ ] Add comparison table.
- [ ] Add Mermaid/DOT export plan.

Why seventh:

- Once the message and contracts are clear, demos can make the value obvious.

---

## 6. Non-Negotiables

- [ ] Deterministic facts before semantic summaries.
- [ ] Static evidence before graph edges.
- [ ] Diagnostics before speculation.
- [ ] Local indexing before LLM use.
- [ ] Agent-readable output before visual dashboard.
- [ ] Scoped, bounded v1 before broad platform claims.
- [ ] Honest status over hype.

---

## 7. Definition of Done for Demand Alignment

The repo is demand-aligned when a new visitor can answer these within 60 seconds:

- [ ] What problem does Code Graph solve?
- [ ] How is it different from LLM repo mappers?
- [ ] Does it burn tokens to index the repo?
- [ ] Can I trust the graph facts?
- [ ] Can an AI coding agent use the output?
- [ ] Does it support incremental updates?
- [ ] Can I run it on part of a large repo?
- [ ] What works today?
- [ ] What is planned but not done yet?
- [ ] What is explicitly out of scope?

---

## 8. Next Plan Files

Continue with these focused plans:

- [ ] `docs/plans/readme-positioning-plan.md`
- [ ] `docs/plans/trust-and-evidence-plan.md`
- [ ] `docs/plans/cli-and-query-ux-plan.md`
- [ ] `docs/plans/agent-context-pack-plan.md`
- [ ] `docs/plans/incremental-indexing-and-cache-plan.md`
- [ ] `docs/plans/scoped-indexing-monorepo-plan.md`
- [ ] `docs/plans/demo-and-comparison-plan.md`

