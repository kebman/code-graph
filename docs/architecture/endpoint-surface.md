# Endpoint Surface

> Project working title: Code Graph (temporary name)

Depends on:
- [architecture-overview.md](./architecture-overview.md)
- [graph-model.md](./graph-model.md)
- [graph-views.md](./graph-views.md)
- [invariants.md](./invariants.md)
- [indexer-architecture.md](./indexer-architecture.md)
- [query-engine-architecture.md](./query-engine-architecture.md)
- [project-phases.md](./project-phases.md)

Status: Draft

---

# 1. Purpose

This document defines the **Endpoint Surface** as a derived, objective surface built on top of the core graph.

Its purpose is to make backend API entrypoints explicit and queryable.

This surface exists to answer:

- what endpoints exist in the code
- which handler symbol implements each endpoint
- what request/response evidence is visible
- how endpoint truth can later be compared against API contracts

This is especially important for systems where hand-maintained API descriptions may drift.

---

# 2. What the Endpoint Surface Is

The Endpoint Surface is not a replacement for the canonical graph Views 0–3.

It is a **derived application surface** built from the same indexed evidence.

It should be understood as:

- a practical backend truth surface
- a route/handler inventory
- a contract-alignment foundation
- a concrete proving use case for the graph system

The Endpoint Surface is an application of the graph, not a separate competing model.

---

# 3. Why This Surface Exists

In many backend systems, API contract files drift because:

- routes evolve in code
- handlers move or split
- documentation is updated manually
- schema details become stale
- endpoint coverage becomes incomplete

A stable code graph should make route truth explicit enough that contract drift can be detected mechanically.

The Endpoint Surface exists to provide that objective base layer.

---

# 4. Scope

## 4.1 Included Intent

The Endpoint Surface should model, where statically extractable:

- HTTP method
- route path
- route registration location
- handler symbol
- handler file
- request-shape evidence
- response-shape evidence
- downstream sink evidence such as DB write or HTTP response

## 4.2 Excluded Intent (v1)

The Endpoint Surface does not require:

- perfect inference for every framework pattern
- complete request/response schema derivation
- runtime-only route discovery
- full OpenAPI generation
- intra-function local-variable flow tracing

It remains bounded by the same v1 rules as the core graph.

See:
- [invariants.md](./invariants.md)
- [graph-views.md](./graph-views.md)

---

# 5. Relationship to the Canonical Views

The Endpoint Surface derives from existing graph layers.

## 5.1 Runtime View (View 0)

May provide service/runtime context for where the backend runs.

## 5.2 File View (View 1)

Provides route registration file relationships and import paths.

## 5.3 Symbol View (View 2)

Provides handler symbols, called services, and related exported symbols.

## 5.4 Flow View (View 3)

Provides bounded evidence for:

- request entry
- service calls
- DB writes
- HTTP responses

The Endpoint Surface combines evidence from these views into a route-centered surface.

---

# 6. Core Concepts

## 6.1 Endpoint

An Endpoint is a route-level API entrypoint, normally represented as:

- HTTP method
- normalized path

Examples:

- `GET /events`
- `POST /orders`
- `PATCH /admin/events/:id`

An Endpoint is not identical to a handler symbol.
A single handler symbol may serve one or more endpoints.

## 6.2 Handler

A Handler is the exported symbol or resolvable function associated with endpoint execution.

The system should prefer explicit handler-symbol linkage where possible.

## 6.3 Request Evidence

Request evidence is any statically extractable indication of expected input, such as:

- typed request parameters
- validator/schema calls
- named DTOs
- route param usage
- request body / query / params handling

## 6.4 Response Evidence

Response evidence is any statically extractable indication of output, such as:

- `res.json(...)`
- response helpers
- typed response wrappers
- known response DTOs
- return flows that terminate in HTTP response writes

---

# 7. Proposed Node and Edge Treatment

The Endpoint Surface may be represented in one of two ways:

## 7.1 Derived Surface Only

Endpoints are emitted as query/view results, not persisted as canonical graph nodes in v1.

This is the safer initial position.

## 7.2 Future Explicit Node Type

A later version may introduce an explicit Endpoint node if the surface proves stable and broadly useful.

That requires updates to:
- [graph-model.md](./graph-model.md)
- [graph-views.md](./graph-views.md)
- [invariants.md](./invariants.md)

For now, treat Endpoint as a derived surface concept unless explicitly promoted.

---

# 8. Extraction Goals

The system should aim to extract the following route-centered facts:

## 8.1 Route Identity

- method
- path
- source file
- source location

## 8.2 Route Implementation

- handler symbol
- handler file
- evidence of route-to-handler linkage

## 8.3 Request-Side Clues

Where available:

- validator/schema symbol
- DTO/type symbol
- param/body/query usage evidence

## 8.4 Response-Side Clues

Where available:

- response writer evidence
- known response type
- sink evidence
- downstream service chain

---

# 9. Static Evidence Boundaries

The Endpoint Surface must remain evidence-based.

It may use:

- route registration calls
- imported handler references
- resolver-backed symbol links
- known framework call patterns
- bounded flow evidence from handler to sink

It must not:

- invent endpoints
- infer undocumented runtime-only routes without code evidence
- guess handler mappings when symbol resolution fails
- claim request/response schema precision without evidence

This follows the no-speculation rule from [invariants.md](./invariants.md).

---

# 10. Framework Pattern Strategy

The Endpoint Surface should not depend on one framework only, but v1 may support a bounded set of common static patterns.

Examples:

- `router.get("/path", handler)`
- `router.post("/path", controller.create)`
- `app.use("/prefix", router)`
- exported route registration modules

The design should prioritize:
- explicit registration patterns
- symbol-resolvable handlers
- deterministic extraction

Dynamic or highly indirect registration patterns may be unsupported in v1.

Unsupported patterns should be reported, not guessed.

---

# 11. Output Shape

An endpoint-oriented result should include at minimum:

- method
- normalized path
- route file
- route location
- handler symbol (if resolved)
- handler file
- evidence summary

Optional fields:

- request evidence
- response evidence
- related validator/type symbols
- downstream sink hints

This output may later be formalized in:
- CLI output
- JSON export
- contract drift reports

---

# 12. Relationship to Contract Alignment

The Endpoint Surface is the prerequisite for later contract alignment work.

It allows the system to compare:

- endpoints found in code
- endpoints described in external contract artifacts

This can support later capabilities such as:

- missing endpoint reports
- stale contract entry reports
- request/response evidence comparison
- skeleton contract generation for uncovered routes

The contract file remains secondary.
Code evidence remains primary.

See also:
- [project-phases.md](./project-phases.md)

---

# 13. Relationship to OpenAPI Drift

A major intended use case is reducing OpenAPI drift.

The Endpoint Surface should make it possible to detect:

- endpoints present in code but absent in contract docs
- endpoints present in contract docs but unsupported in code
- mismatched handler linkage assumptions
- missing request/response evidence

This does not require full OpenAPI generation in v1.
It requires an objective route/handler surface first.

---

# 14. Query Implications

The Endpoint Surface suggests future query/report capabilities such as:

- list all endpoints
- show handler for endpoint
- show all endpoints served by handler
- trace endpoint to sink
- compare endpoint inventory to contract inventory

These are endpoint-oriented applications of the existing graph rather than replacements for core traversal semantics.

---

# 15. Phase Position

The Endpoint Surface belongs to **Phase A / early Phase B transition**.

It is justified early because it remains grounded in code truth and offers immediate practical value.

It should be built only in ways that preserve:

- determinism
- bounded extraction
- no speculative inference
- alignment with Views 0–3

It must not become an excuse to expand into uncontrolled contract generation.

---

# 16. Risks

## 16.1 False Confidence

If extraction overclaims certainty, contract comparison becomes misleading.

Mitigation:
- require evidence-backed output
- mark unresolved handler mappings clearly

## 16.2 Framework Overfitting

If extraction is tailored too narrowly, the surface becomes brittle.

Mitigation:
- support explicit common patterns first
- report unsupported patterns rather than guessing

## 16.3 Scope Creep

Request/response shape inference can grow into full dataflow work.

Mitigation:
- keep request/response evidence bounded
- defer deep morph tracking

---

# 17. Future Extensions

Possible future extensions include:

- explicit Endpoint nodes
- schema-aware request/response linking
- OpenAPI diff reports
- skeleton contract generation
- endpoint cluster reports
- route-to-permission mapping

None of these are required to define the surface now.

---

# 18. Status

This document defines the Endpoint Surface as a derived, route-centered truth surface built on top of the canonical graph.

It is intended as one of the first practical proofs that Code Graph can solve real engineering drift problems without abandoning bounded architectural discipline.
