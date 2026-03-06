# Project Phases

> Project working title: Code Graph (temporary name)

Depends on:
- [architecture-overview.md](./architecture-overview.md)
- [graph-model.md](./graph-model.md)
- [graph-views.md](./graph-views.md)
- [invariants.md](./invariants.md)
- [indexer-architecture.md](./indexer-architecture.md)
- [query-engine-architecture.md](./query-engine-architecture.md)
- [../roadmaps/roadmap-v1.md](../roadmaps/roadmap-v1.md)
- [../roadmaps/milestones-v1.md](../roadmaps/milestones-v1.md)

Status: Draft

---

# 1. Purpose

This document defines the major project phases beyond the base v1 roadmap.

It exists to answer:

- what the system should prove first
- in what order major capabilities should be built
- which ideas are core to early usefulness
- which ideas are intentionally deferred

This is a planning and scope-control document.

It does not replace:
- the architectural model
- the graph model
- the implementation roadmap

Instead, it explains **why certain work comes first**.

---

# 2. Phase Strategy

Code Graph should not expand evenly in all directions.

The project should grow in the order that most quickly produces:

1. objective truth
2. real developer value
3. bounded complexity
4. reusable graph primitives

The phase order is therefore:

- **Phase A — Code Truth Surfaces**
- **Phase B — Contract Alignment Surfaces**
- **Phase C — Documentation Term Surfaces**

This ordering is intentional.

---

# 3. Phase A — Code Truth Surfaces

## 3.1 Goal

Build a trustworthy graph of code structure that can answer practical questions about a real backend system.

This phase establishes the first useful “truth surface”:
- files
- exported symbols
- call relationships
- runtime topology
- endpoint-related structure where statically extractable

## 3.2 Why Phase A Comes First

Without code-side truth:

- contract docs drift
- OpenAPI drifts
- front-end work starts on uncertain assumptions
- audits become manual and repetitive
- AI assistance becomes noisy because context selection is weak

Phase A creates the objective base layer.

## 3.3 Included Work

Phase A includes the core graph capabilities already defined in:
- [graph-model.md](./graph-model.md)
- [graph-views.md](./graph-views.md)
- [indexer-architecture.md](./indexer-architecture.md)
- [query-engine-architecture.md](./query-engine-architecture.md)

This means:

- file graph
- symbol graph
- bounded flow-oriented traversal
- deterministic indexing
- incremental indexing
- evidence-backed queries

## 3.4 Primary Outcome

At the end of Phase A, the system should be able to answer:

- what files depend on what
- what exported symbols are related
- what calls what
- where key backend information travels across function boundaries
- what route/handler surface exists in the codebase, if supported by extractors

## 3.5 Success Criteria

Phase A is successful when the system can be trusted as an objective structural reference for a real TypeScript backend.

That means:

- indexed output is deterministic
- graph queries are bounded and reproducible
- key engineering surfaces can be extracted from code without speculation
- a real project can be inspected without graph explosion

---

# 4. Phase B — Contract Alignment Surfaces

## 4.1 Goal

Use code truth from Phase A to detect and reduce contract drift.

Primary target:
- API contract alignment, especially OpenAPI-style surface comparison

## 4.2 Why Phase B Is Second

Contract alignment is highly useful, but it should be derived from code truth rather than guessed from incomplete documentation.

If Phase B starts before Phase A is stable, the project risks:

- hardcoding assumptions into contract tooling
- generating misleading reports
- creating a second drifting representation

Phase B depends on code extraction being trustworthy first.

## 4.3 Included Work

Phase B may include:

- endpoint inventory
- route-to-handler mapping
- request/response schema hints
- endpoint drift reports
- comparison against published API contracts
- generation of skeleton contract artifacts from code evidence

## 4.4 Primary Outcome

At the end of Phase B, the system should be able to say:

- what backend endpoints objectively exist
- which ones are missing from published contracts
- which contract entries appear stale or unsupported
- what request/response shape evidence exists in code

## 4.5 Scope Constraint

Phase B does **not** make OpenAPI the source of truth.

Code remains primary.
Published contracts are secondary artifacts that can be validated against code.

---

# 5. Phase C — Documentation Term Surfaces

## 5.1 Goal

Track key project terminology across documentation in a bounded, explicit way.

Primary target:
- glossary-defined terms
- aliases/synonyms
- term mentions across docs
- optional linkage between terms and code symbols

## 5.2 Why Phase C Is Third

Documentation semantics are useful, but they are more ambiguous than code structure.

If this work starts too early, the project risks:

- over-modeling prose
- inventing weak semantic relationships
- distracting from the more objective code graph core

Phase C is therefore deferred until the code-side graph proves its value.

## 5.3 Included Work

Phase C may include:

- glossary term nodes
- alias mappings
- doc mention tracking
- heading/topic associations
- drift reports for undefined or inconsistently used terms
- optional term-to-symbol mapping

## 5.4 Primary Outcome

At the end of Phase C, the system should be able to answer:

- where a term is defined
- where it is used
- whether competing synonyms exist
- whether a key term is drifting across docs
- whether a documented term has a corresponding code concept

## 5.5 Scope Constraint

Phase C is not a general-purpose prose understanding system.

It is limited to:
- explicitly tracked terms
- explicitly defined aliases
- bounded document references

---

# 6. Why This Phase Order Matters

The phases are ordered by evidence quality.

## 6.1 Code Has the Strongest Evidence

Static code structure gives:
- declarations
- references
- calls
- routes
- sinks
- deterministic paths

This is the strongest place to begin.

## 6.2 Contracts Depend on Code

API contracts are useful, but often drift when maintained manually.

They should be validated against code, not trusted blindly.

## 6.3 Documentation Semantics Are the Softest Layer

Documentation is essential, but less mechanically precise.
It benefits from grounding in both:
- glossary definitions
- code-side concepts already extracted

---

# 7. Relationship to Views 0–3

The project phases do not replace the canonical Views 0–3 from [graph-views.md](./graph-views.md).

Instead, they determine how those views are applied to real use cases.

- **Phase A** primarily exercises Views 0–3 directly
- **Phase B** derives contract alignment surfaces from Phase A graph data
- **Phase C** adds bounded documentation-oriented surfaces linked to the same model where appropriate

Views remain canonical.
Phases define delivery order and application emphasis.

---

# 8. Relationship to Real-World Test Cases

A real project should be used after the core system is stable enough to prove value.

The first intended proving case is a medium-sized TypeScript backend with:

- routes
- handlers
- services
- DTOs or validators
- database calls
- existing documentation and API contracts

This is a strong test because it stresses:

- file relationships
- symbol relationships
- endpoint extraction
- contract drift detection
- later glossary/doc drift detection

This document does not lock a specific repository into scope, but it assumes that a real backend test case will be necessary before declaring Phase A complete.

---

# 9. Scope Guards

The following rules remain in force across all phases:

- exported-symbol-first indexing in v1
- no intra-function local-variable graphing in v1
- no speculative inference
- depth-bounded traversal only
- deterministic output only

See:
- [invariants.md](./invariants.md)
- [graph-model.md](./graph-model.md)

No phase may silently override these rules.

---

# 10. Deferred Work

The following remain explicitly outside the current phased scope unless separately approved:

- full dynamic runtime tracing
- complete OpenAPI generation from arbitrary code patterns
- automatic synonym inference from prose
- general semantic understanding of all documentation
- enterprise-scale graph orchestration

These may be explored later, but they are not phase requirements.

---

# 11. Planning Guidance

When planning work, use this order:

1. strengthen Phase A foundations
2. add Phase B surfaces only when they derive from stable code truth
3. add Phase C surfaces only when terminology tracking can stay bounded and explicit

If a proposed feature does not clearly support one of these phases, it should be challenged before acceptance.

---

# 12. Status

This document defines the current project phase strategy.

Current emphasis:
- **Phase A first**
- document Phase B clearly enough to guide future updates
- acknowledge Phase C without letting it hijack core delivery
