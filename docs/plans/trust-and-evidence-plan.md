# Trust and Evidence Plan

Status: Draft  
Purpose: Make Code Graph credible against the biggest market objection: AI-generated codebase maps can hallucinate, go stale, or blur facts with guesses.

---

## 1. Goal

Improve the repo so developers can immediately see that Code Graph is designed around trustworthy, mechanically explainable code facts.

The trust promise should be:

> Code Graph separates facts from guesses. Graph facts require static source evidence. Uncertain findings become diagnostics, not truth. Future semantic summaries are annotations, not authority.

---

## 2. Demand Signals

The YouTube comment section exposed several trust-related concerns:

- [ ] Some users worry that LLM repo mappers produce impressive dashboards with unreliable details.
- [ ] Some users reported hallucinated or unsafe business-logic claims.
- [ ] Some users prefer LSP/static-analysis-style precision over broad AI summaries.
- [ ] Some users distrust tools that generate large cached summaries that age quickly.
- [ ] Some users want graph output that can be used by agents without forcing the agent to trust vague prose.

Repo response:

- [ ] Move trust rules from internal/agent docs into public-facing docs.
- [ ] Make evidence references central to query output.
- [ ] Define what counts as a graph fact.
- [ ] Define what counts as a diagnostic.
- [ ] Define what counts as a semantic annotation.
- [ ] Make stale graph detection part of the trust story.

---

## 3. Public Trust Contract

Add or reuse a public trust section in `README.md`.

Suggested text:

> # Trust Contract
>
> Code Graph separates facts from guesses.
>
> Graph facts:
>
> - come from static source evidence
> - have stable IDs
> - point back to files and source locations where possible
> - are deterministic across equivalent runs
> - are validated before being accepted
>
> Diagnostics:
>
> - report parse failures
> - report unresolved imports
> - report unresolved calls
> - report skipped ambiguous relationships
> - report validation problems
>
> Semantic annotations:
>
> - may help explain the graph to humans or agents
> - must not replace graph facts
> - should cite graph evidence where possible
> - should be treated as derived commentary, not source truth

Checklist:

- [ ] Add this near the upper half of the README.
- [ ] Keep the tone factual.
- [ ] Avoid sounding defensive.
- [ ] Avoid claiming perfect accuracy.
- [ ] Avoid implying the graph understands runtime behaviour unless evidence exists.

---

## 4. Define Fact Categories

Create or update a public architecture/design doc that separates output categories.

Candidate file:

- [ ] `docs/architecture/trust-model.md`

Suggested sections:

> # Trust Model
>
> ## Graph Facts
>
> Graph facts are mechanically extracted relationships backed by static source evidence.
>
> Examples:
>
> - file A imports file B
> - file A contains exported symbol X
> - symbol X directly calls symbol Y when the call target is syntactically resolvable
> - route file declares endpoint method/path when statically detectable
>
> ## Diagnostics
>
> Diagnostics are warnings or errors about things the indexer could not safely convert into graph facts.
>
> Examples:
>
> - unresolved import
> - unresolved call target
> - parse failure
> - duplicate node ID
> - duplicate edge ID
> - skipped dynamic route expression
>
> ## Derived Summaries
>
> Derived summaries are readable explanations produced from graph facts.
>
> Examples:
>
> - human-readable route summary
> - endpoint overview
> - context-pack introduction
> - future LLM-generated explanation
>
> Derived summaries must not silently introduce facts that are absent from the graph.

Checklist:

- [ ] Define graph facts.
- [ ] Define diagnostics.
- [ ] Define derived summaries.
- [ ] Define future LLM annotations.
- [ ] Explicitly say summaries are not authority.
- [ ] Link to graph model and output format docs.

---

## 5. Evidence Reference Requirements

Tighten `docs/designs/output-format.md`.

Current direction is already good, but make it more explicit.

Evidence records should support:

- [ ] evidence ID
- [ ] edge ID
- [ ] node ID where relevant
- [ ] file path
- [ ] line
- [ ] column
- [ ] optional end line / end column
- [ ] optional snippet
- [ ] extractor name
- [ ] extraction rule ID or cause
- [ ] confidence class, if needed, but avoid numeric fake confidence

Suggested wording:

> Every returned edge that represents explainable source evidence should be able to point to an evidence record.
>
> If evidence is unavailable, the output must either:
>
> - explain why evidence is unavailable, or
> - omit the relationship, or
> - surface a diagnostic instead.

Checklist:

- [ ] Add explicit evidence requirements.
- [ ] Add examples for IMPORTS, CONTAINS, CALLS, endpoint extraction.
- [ ] Avoid evidence-free relationship claims.
- [ ] Add truncation flags when evidence is omitted due to limits.
- [ ] Add deterministic ordering requirement for evidence arrays.

---

## 6. Diagnostics as First-Class Output

Diagnostics should be treated as part of the trust model, not as noise.

Add to output design:

> Diagnostics are first-class trust signals. They tell the user where Code Graph refused to guess.

Diagnostic fields should include:

- [ ] code
- [ ] severity
- [ ] message
- [ ] file path when available
- [ ] line when available
- [ ] column when available
- [ ] related node/edge ID when available
- [ ] extractor stage
- [ ] suggested next action, optional

Potential diagnostic categories:

- [ ] `FILE_READ_ERROR`
- [ ] `PARSE_ERROR`
- [ ] `UNRESOLVED_IMPORT`
- [ ] `UNRESOLVED_CALL`
- [ ] `DYNAMIC_IMPORT_SKIPPED`
- [ ] `DYNAMIC_ROUTE_SKIPPED`
- [ ] `AMBIGUOUS_SYMBOL_SKIPPED`
- [ ] `DUPLICATE_NODE_ID`
- [ ] `DUPLICATE_EDGE_ID`
- [ ] `VALIDATION_ERROR`
- [ ] `TRUNCATED_OUTPUT`

Checklist:

- [ ] Ensure diagnostics are included in JSON output.
- [ ] Ensure diagnostics are visible in markdown output.
- [ ] Ensure diagnostics are sorted deterministically.
- [ ] Ensure skipped uncertain relationships become diagnostics where useful.
- [ ] Avoid hiding diagnostics in normal success output.

---

## 7. Graph Validation Story

Make validation visible as a trust feature.

Docs to update:

- [ ] `README.md`
- [ ] `docs/architecture/graph-validation.md`
- [ ] `docs/architecture/invariants.md`

Suggested README text:

> Code Graph validates generated graphs before returning them. Invalid node IDs, duplicate edges, missing endpoints, broken references, and schema violations are treated as defects, not tolerated silently.

Checklist:

- [ ] Document validation as product trust, not only internal architecture.
- [ ] Link graph validation to deterministic IDs.
- [ ] Explain that validation failure should fail loudly.
- [ ] Explain that strict graph core behaviour is intentional.
- [ ] Add examples of invalid graph states.

---

## 8. Static Evidence Rules

Promote internal `AGENTS.md` rules into public docs.

Public principles:

- [ ] Prefer syntax-backed extraction.
- [ ] Do not infer runtime behaviour unless explicitly modeled.
- [ ] Do not invent call edges without clear source evidence.
- [ ] Do not encode uncertain findings as graph truth.
- [ ] Prefer omission plus diagnostic over speculative edge.
- [ ] Prefer correctness over coverage.
- [ ] Prefer stable output over clever analysis.

Suggested text:

> Code Graph is conservative by design. It is better for the graph to omit an edge and report a diagnostic than to invent a relationship that looks useful but is false.

Checklist:

- [ ] Add to README.
- [ ] Add to trust model doc.
- [ ] Cross-link to indexer design.
- [ ] Cross-link to graph validation.

---

## 9. Future LLM Annotation Rules

Because the market is reacting to LLM-based codebase maps, define where LLMs may fit later.

Suggested section:

> # LLM Usage Policy
>
> Code Graph does not require an LLM to build the graph.
>
> Future LLM features may:
>
> - summarize graph query results
> - generate onboarding tours from evidence-backed paths
> - label clusters or modules
> - produce human-readable context-pack introductions
>
> Future LLM features must not:
>
> - create authoritative graph edges without static evidence
> - overwrite deterministic graph facts
> - hide uncertainty
> - produce uncited business-logic claims as if they were source facts

Checklist:

- [ ] Add to `docs/architecture/trust-model.md`.
- [ ] Mention briefly in README.
- [ ] Use "annotation" language.
- [ ] Avoid banning LLMs; place them correctly in the architecture.
- [ ] State that LLM output should cite graph evidence where practical.

---

## 10. Staleness and Freshness

A stale graph can be as dangerous as a hallucinated graph.

Add a freshness model to docs.

Suggested fields for future graph metadata:

- [ ] repository root
- [ ] git commit hash
- [ ] dirty working tree status
- [ ] indexed_at timestamp
- [ ] indexer version
- [ ] scope path
- [ ] include filters
- [ ] exclude filters
- [ ] file count
- [ ] diagnostics count

Suggested text:

> Query output should identify the indexed commit or workspace state where possible. A graph built from an old commit must not silently pretend to represent the current working tree.

Checklist:

- [ ] Add freshness section to trust model.
- [ ] Add future metadata to output format.
- [ ] Connect to incremental indexing plan.
- [ ] Add warning semantics for stale cache.
- [ ] Add future test plan for stale-edge removal.

---

## 11. Query Output Trust Markers

Every query result should make trust visible.

For JSON output:

- [ ] include `version`
- [ ] include `query`
- [ ] include `indexMetadata`
- [ ] include `result`
- [ ] include `evidence`
- [ ] include `diagnostics`
- [ ] include `truncation`

For markdown output:

- [ ] show query name and arguments
- [ ] show indexed repo/scope
- [ ] show node/edge/path results
- [ ] show evidence references
- [ ] show diagnostics
- [ ] show truncation warning if applicable

Suggested markdown pattern:

> Query: callers createOrder  
> Scope: packages/api  
> Indexed state: commit abc1234  
> Result: 4 callers  
> Diagnostics: 1 unresolved call skipped  
> Truncated: no

Checklist:

- [ ] Make trust markers compact.
- [ ] Avoid noisy walls of metadata by default.
- [ ] Provide verbose mode for full evidence.
- [ ] Provide JSON mode for agents.
- [ ] Provide markdown mode for humans.

---

## 12. Tests Needed

Add or plan tests that prove conservative behaviour.

Test categories:

- [ ] deterministic file scan order
- [ ] deterministic node order
- [ ] deterministic edge order
- [ ] duplicate node rejection
- [ ] duplicate edge rejection
- [ ] unresolved import becomes diagnostic
- [ ] unresolved call becomes diagnostic
- [ ] dynamic import is skipped or diagnosed
- [ ] dynamic route is skipped or diagnosed
- [ ] invalid graph fails validation
- [ ] evidence records point to correct file/line
- [ ] query output is stable across repeated runs
- [ ] stale edge removal after future incremental re-indexing

Checklist:

- [ ] Add regression fixtures for small TypeScript repo.
- [ ] Include dynamic/ambiguous examples.
- [ ] Include expected diagnostics snapshots.
- [ ] Ensure snapshots are deterministic.
- [ ] Ensure tests do not depend on filesystem order.

---

## 13. Files Likely Affected

Documentation:

- [ ] `README.md`
- [ ] `docs/architecture/trust-model.md`
- [ ] `docs/architecture/graph-validation.md`
- [ ] `docs/architecture/invariants.md`
- [ ] `docs/designs/output-format.md`
- [ ] `docs/designs/indexer.md`
- [ ] `docs/designs/query-engine.md`

Implementation later:

- [ ] `src/indexer/indexer.ts`
- [ ] `src/indexer/relationship-extractor.ts`
- [ ] `src/indexer/endpoint-extractor.ts`
- [ ] `src/queries/*`
- [ ] future CLI output formatter
- [ ] tests / fixtures

---

## 14. Implementation Priority

### Phase 1: Documentation Trust Contract

- [ ] Add public trust model.
- [ ] Update README trust section.
- [ ] Update output-format evidence requirements.
- [ ] Update query-engine docs with diagnostics expectations.

### Phase 2: Output Consistency

- [ ] Ensure query outputs include diagnostics.
- [ ] Ensure evidence references are shaped consistently.
- [ ] Add compact markdown trust markers.
- [ ] Add JSON trust envelope.

### Phase 3: Test Hardening

- [ ] Add diagnostic fixtures.
- [ ] Add evidence-location tests.
- [ ] Add deterministic output tests.
- [ ] Add skipped-dynamic-pattern tests.

### Phase 4: Staleness Metadata

- [ ] Add graph/index metadata design.
- [ ] Add commit/scope metadata to output plan.
- [ ] Connect to incremental indexing implementation later.

---

## 15. Definition of Done

This trust-and-evidence improvement is done when:

- [ ] README clearly says graph facts require static evidence.
- [ ] README clearly says uncertain findings become diagnostics.
- [ ] A public trust model doc exists.
- [ ] Output format requires evidence references where practical.
- [ ] Diagnostics are first-class output.
- [ ] Future LLM use is framed as annotation, not authority.
- [ ] Staleness/freshness is documented.
- [ ] Tests cover at least one ambiguous case that is skipped or diagnosed instead of guessed.
- [ ] A skeptical developer can see why Code Graph is not just another hallucination-prone AI map.

---

## 16. Remaining Gaps

- [ ] Decide whether to create `docs/architecture/trust-model.md` or fold the trust model into existing validation/invariants docs.
- [ ] Decide whether graph metadata belongs in graph core or output envelopes only.
- [ ] Decide how verbose default CLI evidence should be.
- [ ] Decide whether to use stable evidence IDs in persisted storage or generate them per query output.
- [ ] Decide whether future LLM annotations should live inside the same output envelope or separate files.

