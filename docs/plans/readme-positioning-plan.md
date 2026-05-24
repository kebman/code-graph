# README Positioning Plan

Status: Draft
Purpose: Improve `README.md` so Code Graph matches the demand proven by the Understand Anything video and YouTube comment section.

---

## 1. Goal

Make the README immediately communicate:

- [ ] Code Graph is deterministic-first.
- [ ] Code Graph does not require LLM tokens to index a repo.
- [ ] Code Graph is local and evidence-backed.
- [ ] Code Graph produces useful context for AI agents.
- [ ] Code Graph is not primarily a pretty dashboard.
- [ ] Code Graph is built for practical onboarding, refactor safety, endpoint tracing, and agent planning.

The README should answer the obvious visitor question:

> Why should I care about this instead of just asking Claude/Codex/Cursor to inspect my repo?

---

## 2. Target Opening Message

Replace or strengthen the current abstract opening with a sharper product thesis.

### Current implied message

> Code Graph is a structural, queryable representation of a software repository.

This is true, but too soft.

### Proposed stronger message

> Code Graph is a deterministic, local, evidence-backed codebase map for developers and AI coding agents. It indexes repository structure without LLM token burn, then produces precise context packs for onboarding, refactors, endpoint tracing, and safer agent work.

---

## 3. README Top Section Checklist

- [ ] Keep the working-title warning if still needed.
- [ ] Add a sharp one-paragraph pitch under the title.
- [ ] Mention "deterministic" in the first screen.
- [ ] Mention "local indexing" in the first screen.
- [ ] Mention "no LLM required for indexing" in the first screen.
- [ ] Mention "AI context packs" in the first screen.
- [ ] Mention "evidence-backed graph facts" in the first screen.
- [ ] Avoid claiming full semantic understanding before implemented.
- [ ] Avoid implying that the tool already has a polished UI.

Suggested opening structure:

> # Code Graph (Working Title)
>
> Code Graph is a deterministic, local, evidence-backed codebase map for developers and AI coding agents.
>
> It indexes TypeScript repository structure without using LLM tokens, then lets you query the graph for importers, callers, dependencies, endpoints, blast radius, and bounded context packs.
>
> The goal is simple: stop asking an AI agent to rediscover the whole repository every run. Build the map once, query it cheaply, and feed agents only the code slice they need.

---

## 4. Add "Why This Exists Now"

Add a section near the top.

> # Why This Exists Now
>
> AI coding agents are only as good as the context they receive.
>
> Without a structured repo map, agents often rely on grep, partial file reads, stale docs, and broad guesses. Token-heavy codebase mappers can help, but they may be expensive, slow, stale, or hard to trust when they turn semantic guesses into confident claims.
>
> Code Graph takes the opposite route:
>
> - build deterministic graph facts from static source evidence
> - keep uncertain relationships as diagnostics, not truth
> - make queries cheap and repeatable
> - generate small context packs for humans and agents

Checklist:

- [ ] Mention the pain of large codebases.
- [ ] Mention onboarding.
- [ ] Mention refactor risk.
- [ ] Mention agent context.
- [ ] Mention token cost.
- [ ] Mention trust/hallucination risk.
- [ ] Keep tone factual, not anti-competitor.

---

## 5. Add "What Makes It Different"

Add a comparison-oriented section without sounding petty.

> # What Makes It Different
>
> Code Graph is not an LLM-first repo summarizer.
>
> The indexer builds graph facts from source structure first. LLMs can consume the output later, but they are not required to create the map.
>
> | Concern | Code Graph stance |
> |---|---|
> | Token cost | Index locally first; spend LLM tokens only on chosen context packs |
> | Trust | Graph edges require static evidence |
> | Hallucination | Uncertain findings become diagnostics, not graph facts |
> | Agent use | Output bounded, queryable context slices |
> | Updates | v1 target is git-aware incremental re-indexing |
> | UI | Query/CLI-first; visualization can come later |

Checklist:

- [ ] Avoid saying "better than Understand Anything".
- [ ] Say "LLM-first repo summarizers prove the demand".
- [ ] Position Code Graph as lower-level deterministic infrastructure.
- [ ] Emphasize cheap repeatable queries.
- [ ] Emphasize agent-readable output.

---

## 6. Add "What Works Today"

The current README is still too abstract and underplays the runnable scripts.

Add an honest status section.

> # Current Status
>
> Code Graph is early, but it is no longer only a design document.
>
> Current implementation includes:
>
> - canonical graph core
> - deterministic TypeScript file scanning
> - TypeScript AST parsing
> - file nodes
> - symbol nodes
> - import / contains / call relationship extraction
> - endpoint inventory extraction
> - API callsite extraction
> - graph validation
> - query demo helpers
> - regression test runner
>
> Still in progress:
>
> - real CLI command surface
> - persisted graph cache
> - git-aware incremental re-indexing
> - complete context-pack implementation
> - Mermaid/DOT export
> - polished visualization

Checklist:

- [ ] Be honest about what exists.
- [ ] Be honest about what is planned.
- [ ] Remove or soften "early design phase" if misleading.
- [ ] Keep trust by not overclaiming.

---

## 7. Add "Primary Use Cases"

Suggested section:

> # Primary Use Cases
>
> ## Onboarding
>
> Map the important files, symbols, endpoints, and call paths before touching the code.
>
> ## Refactor safety
>
> Ask what imports, calls, or depends on a file/symbol before moving or changing it.
>
> ## Endpoint tracing
>
> Connect routes, handlers, services, API callsites, and known sinks.
>
> ## AI context packs
>
> Generate bounded context slices for Codex, Claude Code, Cursor, Gemini CLI, or local agents.
>
> ## Documentation alignment
>
> Use graph facts to check whether docs still match implementation.

Checklist:

- [ ] Keep each use case short.
- [ ] Avoid speculative enterprise language.
- [ ] Connect to actual repo capabilities.
- [ ] Mention future capabilities as planned, not done.

---

## 8. Add "Example Commands"

Even if CLI is still planned, add a clearly marked target CLI section.

Suggested target CLI text:

> # Target CLI Shape
>
> The intended v1 CLI should support commands like:
>
>     code-graph index .
>     code-graph stats
>     code-graph importers src/orders/create-order.ts
>     code-graph dependencies src/orders/create-order.ts
>     code-graph callers createOrder
>     code-graph endpoints
>     code-graph pack --from createOrder --to db --max-tokens 2000
>     code-graph blast TicketOffer --format markdown
>
> Current scripts during development:
>
>     npm run indexer:run -- .
>     npm run query:demo -- .
>     npm run endpoints:inventory -- .
>     npm run endpoints:truth -- .
>     npm test

Checklist:

- [ ] Separate current scripts from target CLI.
- [ ] Make commands copy-pasteable.
- [ ] Do not prefix commands with shell prompt markers.
- [ ] Keep target CLI visibly aspirational if not implemented.

---

## 9. Add "Trust Contract"

Suggested section:

> # Trust Contract
>
> Code Graph separates facts from guesses.
>
> Graph facts:
>
> - come from static source evidence
> - have stable IDs
> - can point back to files and source locations
> - are deterministic across equivalent runs
>
> Diagnostics:
>
> - report unresolved imports
> - report unresolved calls
> - report parse failures
> - report skipped or ambiguous relationships
>
> Future semantic summaries:
>
> - may help humans understand the graph
> - must not replace graph facts
> - should cite graph evidence when possible

Checklist:

- [ ] Promote static evidence from `AGENTS.md` to public README.
- [ ] State that uncertain relationships are omitted or diagnosed.
- [ ] State that future LLM summaries are annotations, not source truth.
- [ ] Avoid sounding defensive.

---

## 10. Add "Scope"

Suggested section:

> # Scope
>
> ## v1 Focus
>
> - TypeScript repositories
> - Docker-first / backend-heavy systems
> - file dependency graph
> - exported symbol graph
> - conservative call graph
> - endpoint/API callsite inventory
> - bounded query output
> - AI context packs
>
> ## Explicit Non-Goals
>
> - replacing IDE navigation
> - perfect dynamic runtime inference
> - security-grade taint analysis
> - full local-variable dataflow
> - polished graph UI before the query core is stable
> - multi-language support in v1

Checklist:

- [ ] Keep the scope bounded.
- [ ] Mention TypeScript-first clearly.
- [ ] Mention UI as later, not primary.
- [ ] Mention multi-language support as post-v1.

---

## 11. Add "Snapshot vs Incremental"

Suggested section:

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
> This matters because stale repo maps are worse than no map.

Checklist:

- [ ] State current status.
- [ ] State v1 target.
- [ ] Avoid claiming incremental indexing is complete unless implemented.
- [ ] Explain why it matters.

---

## 12. Add "Large Repo / Monorepo Stance"

Suggested section:

> # Large Repos and Monorepos
>
> The v1 strategy is scoped adoption before whole-enterprise indexing.
>
> Target usage:
>
>     code-graph index .
>     code-graph index packages/api
>     code-graph index apps/web --include src/surfaces/organizer
>
> Planned support:
>
> - include/exclude path filters
> - package/module-scoped indexing
> - deterministic cache keys per scope
> - later workspace-level graph composition
>
> Deferred:
>
> - full multi-repo graph federation
> - all-language enterprise indexing

Checklist:

- [ ] Answer the monorepo question directly.
- [ ] Do not overpromise.
- [ ] Present scoped indexing as a feature, not a limitation.
- [ ] Mention multi-repo later.

---

## 13. Add "Roadmap Snapshot"

Suggested short roadmap:

> # Roadmap Snapshot
>
> ## Now
>
> - strengthen graph core
> - harden TypeScript indexer
> - expose practical query commands
> - document current capabilities clearly
>
> ## Next
>
> - real CLI facade
> - evidence-rich JSON/Markdown output
> - agent context pack generation
> - scoped indexing options
>
> ## Later
>
> - git-aware incremental cache
> - Mermaid/DOT export
> - local web viewer
> - deeper flow tracing
> - multi-language support

Checklist:

- [ ] Keep it shorter than the full roadmap doc.
- [ ] Link to full roadmap.
- [ ] Make the order match actual implementation priorities.

---

## 14. README Editing DoD

The README improvement is done when a first-time visitor can answer:

- [ ] What is Code Graph?
- [ ] Why does it exist now?
- [ ] How is it different from LLM repo mappers?
- [ ] Does it need LLM tokens to index a repo?
- [ ] What can it do today?
- [ ] What is planned?
- [ ] Can AI agents use the output?
- [ ] Can I trust the facts?
- [ ] Is there a UI?
- [ ] Does it work for monorepos?
- [ ] What is out of scope?

---

## 15. Suggested README Section Order

Recommended final structure:

> # Code Graph (Working Title)
>
> short pitch
>
> # Why This Exists Now
>
> # What Makes It Different
>
> # Current Status
>
> # Primary Use Cases
>
> # Example Commands
>
> # Trust Contract
>
> # Scope
>
> # Graph Layers
>
> # AI Context Pack Mode
>
> # Snapshot vs Incremental
>
> # Large Repos and Monorepos
>
> # Roadmap Snapshot
>
> # Non-Goals
>
> # License / Status

Checklist:

- [ ] Move detailed architecture lower.
- [ ] Put value proposition above architecture.
- [ ] Keep technical depth, but do not bury the pitch.
- [ ] Preserve links to architecture docs.

---

## 16. Remaining Gaps

- [ ] Decide whether README should keep the long graph-layer explanation inline or move it to docs.
- [ ] Decide whether the repo needs a short tagline.
- [ ] Decide whether to add a comparison table naming Understand Anything or keep it generic.
- [ ] Decide whether to add screenshots later, after Mermaid/DOT export exists.
