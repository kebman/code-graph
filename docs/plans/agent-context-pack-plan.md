# Agent Context Pack Plan

Status: Draft  
Purpose: Make Code Graph useful to AI coding agents by generating small, deterministic, evidence-backed context packs instead of forcing agents to rediscover the repository through broad file reads and token-heavy summarization.

---

## 1. Goal

Create a clear plan for Code Graph context packs.

A context pack is a bounded output bundle that answers:

- [ ] What code is relevant to this task?
- [ ] Why is it relevant?
- [ ] Which files/ranges should an agent inspect?
- [ ] Which graph facts support the selection?
- [ ] What diagnostics or uncertainty should the agent know?
- [ ] What should the agent avoid assuming?

Core promise:

> Code Graph does not spend LLM tokens to understand the whole repo. It indexes locally, queries deterministically, then emits the smallest useful context pack for an AI agent.

---

## 2. Demand Signals

The video and comment section show strong demand for agent-facing repo context:

- [ ] Users want agents to understand codebases before editing.
- [ ] Users are tired of dumping random files into prompts.
- [ ] Users worry that agents guess when they only see three files.
- [ ] Users want planning support before feature work.
- [ ] Users want lower token use.
- [ ] Users want reusable repo maps instead of regenerating summaries.
- [ ] Users want something more trustworthy than broad LLM prose.

Repo response:

- [ ] Treat context packs as a flagship feature.
- [ ] Make context packs deterministic and evidence-backed.
- [ ] Support Markdown for copy-paste prompts.
- [ ] Support JSON for tool/agent ingestion.
- [ ] Include diagnostics and truncation flags.
- [ ] Never require an LLM to generate the pack.

---

## 3. Definition

Add a dedicated design doc.

Candidate file:

- [ ] `docs/designs/context-packs.md`

Suggested definition:

> A context pack is a bounded, deterministic output generated from a graph query.
>
> It contains the files, symbols, paths, evidence, diagnostics, and optional snippets needed for a human or AI coding agent to reason about a specific change.
>
> A context pack is not a semantic summary of the whole repository. It is a scoped evidence bundle.

Checklist:

- [ ] Define context pack.
- [ ] Define what it is not.
- [ ] Explain local/deterministic generation.
- [ ] Link to query engine design.
- [ ] Link to output format design.
- [ ] Link to trust model.

---

## 4. Core Use Cases

### 4.1 Before an AI Coding Task

Example target command:

> code-graph pack --blast TicketOffer --max-tokens 3000 --format markdown

Use when:

- [ ] asking Codex/Claude/Cursor to modify a feature
- [ ] preparing a refactor prompt
- [ ] asking an agent to write tests
- [ ] asking an agent to audit one subsystem

Pack should include:

- [ ] relevant files
- [ ] relevant exported symbols
- [ ] inbound/outbound relationships
- [ ] likely direct blast radius
- [ ] diagnostics
- [ ] cautions about unresolved/dynamic areas

---

### 4.2 Endpoint Investigation

Example target command:

> code-graph pack --endpoint "POST /api/orders" --max-tokens 3000 --format markdown

Use when:

- [ ] tracing a route to handler/service/db
- [ ] asking an agent to fix endpoint behaviour
- [ ] comparing docs to implementation
- [ ] generating endpoint truth report

Pack should include:

- [ ] endpoint method/path
- [ ] route file and source location
- [ ] handler symbol
- [ ] direct call path where available
- [ ] API callsites where available
- [ ] known sinks where available
- [ ] diagnostics for skipped dynamic pieces

---

### 4.3 Refactor Planning

Example target command:

> code-graph pack --from createOrder --depth 3 --max-tokens 4000 --format markdown

Use when:

- [ ] changing a central function
- [ ] moving files
- [ ] renaming symbols
- [ ] extracting modules
- [ ] checking likely breakage

Pack should include:

- [ ] callers
- [ ] callees
- [ ] importing files
- [ ] imported files
- [ ] related types where available
- [ ] direct paths
- [ ] truncation warnings

---

### 4.4 Onboarding Tour

Example target command:

> code-graph pack --tour payments --max-tokens 5000 --format markdown

Use when:

- [ ] onboarding to an unfamiliar subsystem
- [ ] preparing a human-readable overview
- [ ] giving an AI agent bounded subsystem context

Pack should include:

- [ ] entry points
- [ ] central files
- [ ] central symbols
- [ ] endpoint list if relevant
- [ ] dependency clusters if available
- [ ] diagnostics and caveats

Note:

- [ ] This can be post-v1.
- [ ] Avoid semantic cluster naming until graph facts are strong.

---

## 5. Pack Types

Define explicit pack types instead of one vague mode.

### 5.1 Blast Pack

Purpose:

- [ ] estimate direct and bounded transitive impact

Inputs:

- [ ] symbol name
- [ ] file path
- [ ] depth
- [ ] max tokens
- [ ] format

Example:

> code-graph pack --blast TicketOffer --depth 2 --max-tokens 3000

---

### 5.2 Endpoint Pack

Purpose:

- [ ] gather context around one endpoint

Inputs:

- [ ] method/path
- [ ] max tokens
- [ ] include/exclude tests
- [ ] format

Example:

> code-graph pack --endpoint "POST /api/orders" --max-tokens 3000

---

### 5.3 Path Pack

Purpose:

- [ ] gather context along a graph path from source to sink

Inputs:

- [ ] from symbol
- [ ] to symbol or sink
- [ ] depth
- [ ] max paths
- [ ] max tokens

Example:

> code-graph pack --from createOrder --to db --depth 4 --max-tokens 4000

---

### 5.4 File Pack

Purpose:

- [ ] gather context around one file

Inputs:

- [ ] file path
- [ ] include importers
- [ ] include dependencies
- [ ] include contained symbols
- [ ] max tokens

Example:

> code-graph pack --file src/orders/create-order.ts --max-tokens 2500

---

### 5.5 Scope Pack

Purpose:

- [ ] gather a bounded overview of a directory/module

Inputs:

- [ ] scope path
- [ ] max files
- [ ] max tokens
- [ ] format

Example:

> code-graph pack --scope packages/api/src/orders --max-tokens 5000

---

## 6. Pack Output Structure

The pack should have a stable structure.

Markdown output sections:

- [ ] title
- [ ] query metadata
- [ ] indexed state
- [ ] summary
- [ ] included files
- [ ] relevant symbols
- [ ] relevant paths/edges
- [ ] evidence
- [ ] diagnostics
- [ ] truncation
- [ ] suggested agent instructions
- [ ] explicit caveats

Suggested markdown shape:

> # Code Graph Context Pack
>
> Query: pack --blast TicketOffer
>
> Scope: .
>
> Indexed state: current working tree or commit hash
>
> Token budget: 3000
>
> Truncated: no
>
> ## Included Files
>
> - src/tickets/ticket-offer.ts
> - src/orders/create-order.ts
>
> ## Relevant Symbols
>
> - TicketOffer
> - createTicketOffer
>
> ## Evidence
>
> - edge CALLS from createOrder to createTicketOffer at src/orders/create-order.ts:42
>
> ## Diagnostics
>
> - 1 unresolved call skipped in src/legacy/orders.ts
>
> ## Agent Notes
>
> - Treat listed graph facts as static evidence.
> - Do not assume unresolved calls are irrelevant.
> - Inspect diagnostics before editing central paths.

JSON output fields:

- [ ] version
- [ ] kind
- [ ] query
- [ ] indexMetadata
- [ ] limits
- [ ] files
- [ ] ranges
- [ ] nodes
- [ ] edges
- [ ] paths
- [ ] evidence
- [ ] diagnostics
- [ ] truncation
- [ ] agentNotes

---

## 7. Token Budgeting

Context packs should not need perfect token counting in the first implementation, but they need a clear budget model.

Priority order when trimming:

- [ ] include query metadata first
- [ ] include diagnostics and truncation flags
- [ ] include directly matched file/symbol
- [ ] include direct evidence edges
- [ ] include direct callers/callees
- [ ] include transitive paths by rank
- [ ] include snippets only after structural facts
- [ ] trim lower-ranked paths first
- [ ] never hide that trimming happened

Rules:

- [ ] If max token budget is hit, set `truncated: true`.
- [ ] Explain what was omitted.
- [ ] Prefer file/range references over huge snippets.
- [ ] Keep JSON complete enough for an agent to request more.

Suggested truncation reasons:

- [ ] maxTokens
- [ ] maxFiles
- [ ] maxPaths
- [ ] maxDepth
- [ ] snippetBudget
- [ ] diagnosticsLimit

---

## 8. Ranking Rules

A context pack needs deterministic ranking so repeated runs are stable.

Ranking inputs:

- [ ] direct match to query
- [ ] graph distance from query target
- [ ] edge kind priority
- [ ] endpoint relevance
- [ ] file path proximity
- [ ] symbol kind priority
- [ ] inbound/outbound degree, used carefully
- [ ] deterministic tie-break by stable ID

Avoid:

- [ ] random ranking
- [ ] filesystem order
- [ ] LLM-based ranking in v1
- [ ] fake confidence scores
- [ ] hiding ties

Suggested edge priority for v1:

- [ ] CONTAINS
- [ ] CALLS
- [ ] IMPORTS
- [ ] REFERENCES
- [ ] known endpoint/sink relationships where implemented

---

## 9. Agent Instruction Block

Markdown packs should optionally include a small instruction block for coding agents.

Suggested content:

> Use this context pack as a scoped map, not as complete repository truth.
>
> Prioritize files and symbols listed under direct evidence.
>
> Treat diagnostics as warnings about incomplete static resolution.
>
> Do not assume omitted files are irrelevant if the pack is truncated.
>
> Before editing, inspect the referenced files/ranges directly.

Checklist:

- [ ] Keep instructions short.
- [ ] Make them model-agnostic.
- [ ] Do not mention internal prompt strategies.
- [ ] Do not over-explain.
- [ ] Make them useful for Codex/Claude/Cursor/local agents.

---

## 10. Pack Generation Pipeline

Suggested pipeline:

- [ ] parse CLI args
- [ ] resolve query target
- [ ] detect ambiguity
- [ ] run graph query
- [ ] rank nodes/edges/paths
- [ ] collect evidence
- [ ] collect diagnostics
- [ ] select files/ranges
- [ ] apply limits
- [ ] mark truncation
- [ ] render Markdown or JSON

Do not:

- [ ] call LLMs during pack generation
- [ ] create graph facts from natural-language summaries
- [ ] include huge unrelated files by default
- [ ] silently drop diagnostics
- [ ] hide ambiguity

---

## 11. File Range Selection

The pack should eventually include precise file ranges, not whole files by default.

Range sources:

- [ ] symbol declaration span
- [ ] callsite line
- [ ] endpoint declaration span
- [ ] import declaration line
- [ ] surrounding context window
- [ ] test references if included

Initial simple strategy:

- [ ] include file paths only
- [ ] include line references where available
- [ ] add snippets later

Better later strategy:

- [ ] include symbol declaration range
- [ ] include callsite range
- [ ] include bounded context before/after
- [ ] merge overlapping ranges
- [ ] sort ranges deterministically

---

## 12. Diagnostics and Caveats

Every pack should include caveats when relevant.

Examples:

- [ ] unresolved import found
- [ ] unresolved call found
- [ ] duplicate symbol name
- [ ] dynamic route skipped
- [ ] output truncated
- [ ] graph built from stale commit
- [ ] dirty working tree detected
- [ ] unsupported language files ignored
- [ ] tests excluded by scope

Suggested pack caveat text:

> Caveat: Code Graph found unresolved calls in this scope. The pack may omit dynamic or ambiguous relationships. Inspect diagnostics before treating this as complete blast radius.

Checklist:

- [ ] Caveats should be factual.
- [ ] Caveats should not be alarmist.
- [ ] Caveats should be visible in both Markdown and JSON.
- [ ] Caveats should explain what the agent should not assume.

---

## 13. Implementation Phases

### Phase 1: Documentation

- [ ] Create `docs/designs/context-packs.md`.
- [ ] Update README AI Context Pack section.
- [ ] Update output format design.
- [ ] Update CLI design.
- [ ] Add example pack workflows.

### Phase 2: Minimal Pack Command

- [ ] Implement `pack --file`.
- [ ] Implement `pack --blast` using existing graph query capabilities where possible.
- [ ] Output markdown first.
- [ ] Include files, symbols, diagnostics, and truncation.
- [ ] Avoid snippets initially if line range extraction is not ready.

### Phase 3: JSON Pack Output

- [ ] Add JSON envelope.
- [ ] Add stable ordering.
- [ ] Add evidence objects.
- [ ] Add index metadata.
- [ ] Add diagnostics.
- [ ] Add truncation flags.

### Phase 4: Endpoint Pack

- [ ] Implement `pack --endpoint`.
- [ ] Reuse endpoint inventory.
- [ ] Add route/handler/callsite context.
- [ ] Include skipped dynamic route diagnostics.

### Phase 5: Snippet and Range Support

- [ ] Add range selection.
- [ ] Add snippet extraction.
- [ ] Add token-budget trimming.
- [ ] Add truncation explanations.

---

## 14. Tests Needed

Context-pack tests:

- [ ] pack output is deterministic
- [ ] markdown pack includes query metadata
- [ ] JSON pack is valid JSON
- [ ] diagnostics are included
- [ ] truncation is included when limits are hit
- [ ] ambiguous symbol does not silently pick one
- [ ] direct file pack includes contained symbols
- [ ] blast pack includes direct callers/callees
- [ ] endpoint pack includes method/path/file/line
- [ ] token budget trimming is deterministic
- [ ] snippets do not exceed requested limits
- [ ] unresolved calls appear as diagnostics/caveats

Fixtures:

- [ ] small TypeScript API
- [ ] duplicate symbol names
- [ ] endpoint route
- [ ] direct service call
- [ ] unresolved dynamic call
- [ ] import cycle
- [ ] large enough fixture to trigger truncation

---

## 15. Documentation Files Likely Affected

- [ ] `README.md`
- [ ] `docs/designs/context-packs.md`
- [ ] `docs/designs/cli.md`
- [ ] `docs/designs/output-format.md`
- [ ] `docs/designs/query-engine.md`
- [ ] `docs/roadmaps/roadmap-v1.md`
- [ ] `docs/examples/context-pack-examples.md`

Implementation later:

- [ ] `src/cli/*`
- [ ] `src/queries/context-pack.ts`
- [ ] `src/queries/graph-queries.ts`
- [ ] `src/queries/output-formatters.ts`
- [ ] tests / fixtures

---

## 16. README Messaging

Add a short README section.

Suggested text:

> # AI Context Packs
>
> Code Graph can generate bounded context packs for AI coding agents.
>
> Instead of asking an agent to scan the whole repository, query the graph first and hand the agent a compact evidence-backed slice:
>
>     code-graph pack --blast TicketOffer --max-tokens 3000 --format markdown
>
> Context packs are generated locally from deterministic graph facts. They can include relevant files, symbols, paths, evidence, diagnostics, and truncation warnings.
>
> LLMs are optional consumers of the pack; they are not required to build the graph.

Checklist:

- [ ] Mention no LLM required.
- [ ] Mention bounded context.
- [ ] Mention evidence.
- [ ] Mention diagnostics.
- [ ] Mention token budget.
- [ ] Mention agents explicitly.

---

## 17. Definition of Done

This context-pack work is done when:

- [ ] Context packs are defined in docs.
- [ ] README presents context packs as a flagship feature.
- [ ] CLI plan includes `pack`.
- [ ] Output format supports pack-specific fields.
- [ ] Diagnostics and truncation are required in pack output.
- [ ] Token-budget behaviour is documented.
- [ ] Future LLM role is clearly downstream/optional.
- [ ] Minimal implementation can produce at least one useful pack type.
- [ ] A developer can copy a pack into Codex/Claude/Cursor and understand why each file was included.

---

## 18. Remaining Gaps

- [ ] Decide whether `pack` should be implemented before full `blast`.
- [ ] Decide whether pack output should include snippets in v1 or only file/range references.
- [ ] Decide how to estimate tokens without adding heavy dependencies.
- [ ] Decide whether context packs should be saved to files by default.
- [ ] Decide whether to include test files by default.
- [ ] Decide how to represent multiple candidate symbols in pack JSON.
- [ ] Decide whether to add a `--for codex|claude|cursor|generic` output mode later.

