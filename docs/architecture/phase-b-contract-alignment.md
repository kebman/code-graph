# Phase B — Contract Alignment

> Project working title: Code Graph (temporary name)

Depends on:
- [project-phases.md](./project-phases.md)
- [phase-a-scope.md](./phase-a-scope.md)
- [endpoint-surface.md](./endpoint-surface.md)
- [graph-model.md](./graph-model.md)
- [graph-views.md](./graph-views.md)
- [invariants.md](./invariants.md)
- [../designs/output-format.md](../designs/output-format.md)

Status: Draft

---

# 1. Purpose

This document defines **Phase B: Contract Alignment**.

Phase B builds on the structural truth established in Phase A and uses that information to detect and reduce **contract drift**.

The primary focus is **API contract alignment**, particularly with specifications such as:

```
OpenAPI  
Swagger  
API Blueprint
```

Phase B does not replace contracts.

Instead, it provides a **mechanical verification layer** between:

```
code reality  
and  
published API contracts
```

---

# 2. Why Phase B Exists

In most real systems, API contracts drift because:

- endpoints evolve in code
- routes move across files
- handlers change behavior
- documentation updates lag behind implementation

Manual contract maintenance leads to inconsistencies such as:

```
endpoints present in code but missing in contracts  
contracts describing endpoints that no longer exist  
incorrect HTTP methods  
incorrect route paths  
stale request or response schemas
```

Phase B exists to make these inconsistencies **detectable automatically**.

---

# 3. Relationship to Phase A

Phase B depends entirely on Phase A.

Phase A provides:

```
file graph  
symbol graph  
flow graph  
endpoint surface foundations
```

Phase B consumes this information.

Phase B must never attempt to infer contract information directly from raw code without Phase A graph evidence.

---

# 4. Core Concept

The central concept of Phase B is **endpoint inventory comparison**.

Two inventories are constructed:

```
Code Endpoint Inventory  
Contract Endpoint Inventory
```

These inventories are then compared.

The result is a **drift report**.

---

# 5. Code Endpoint Inventory

The Code Endpoint Inventory is derived from the **Endpoint Surface**.

Each entry contains at minimum:

```
HTTP method  
normalized route path  
handler symbol  
handler file  
registration location
```

Optional evidence may include:

```
validator usage  
DTO references  
response sinks  
downstream service calls
```

This inventory must remain evidence-based.

See:

- [endpoint-surface.md](./endpoint-surface.md)

---

# 6. Contract Endpoint Inventory

The Contract Endpoint Inventory is derived from the contract specification.

Example fields:

```
HTTP method  
path  
operation identifier  
declared request schema  
declared response schema
```

The system must normalize contract entries before comparison.

Normalization may include:

```
path normalization  
method normalization  
parameter placeholder normalization
```

---

# 7. Drift Classes

Phase B identifies several classes of drift.

## 7.1 Missing Endpoint

An endpoint exists in code but does not appear in the contract.

Example:

```
POST /events/import
```

present in code but absent from OpenAPI.

---

## 7.2 Phantom Endpoint

An endpoint exists in the contract but not in code.

Example:

```
GET /orders/history
```

present in contract but no handler exists.

---

## 7.3 Method Mismatch

The path exists but the method differs.

Example:

```
Code: POST /orders  
Contract: PUT /orders
```

---

## 7.4 Path Mismatch

The contract path is different from the code path.

Example:

```
Code: /orders/:id  
Contract: /orders/{orderId}
```

This mismatch may require normalization before classification.

---

## 7.5 Handler Uncertainty

The system cannot resolve the handler symbol.

This does not produce a drift error but generates a **diagnostic warning**.

---

# 8. Schema Evidence (Optional)

Phase B may also compare **schema hints**.

Examples:

```
request validator usage  
DTO type references  
response wrapper types
```

These hints allow approximate comparison between:

```
declared contract schemas  
observed code schemas
```

However, schema comparison must remain conservative.

If evidence is insufficient, the system must report:

```
schema comparison inconclusive
```

rather than guessing.

---

# 9. Reporting

Phase B should produce structured drift reports.

Example report sections:

```
missing endpoints  
phantom endpoints  
method mismatches  
path mismatches  
schema mismatches  
extraction diagnostics
```

Reports must include evidence references:

```
file path  
line number  
symbol name
```

---

# 10. Output Formats

Drift reports may be emitted in several formats.

Examples:

```
CLI output  
JSON report  
CI report artifact
```

JSON output should follow the structure defined in:

- [../designs/output-format.md](../designs/output-format.md)

---

# 11. CI Integration

Contract drift detection is particularly valuable in CI.

A CI pipeline may:

```
index repository  
extract endpoint inventory  
parse contract specification  
generate drift report
```

The pipeline may fail when:

```
new endpoints lack contract entries  
contract entries reference missing endpoints
```

This ensures contract alignment remains enforced.

---

# 12. Limitations

Phase B intentionally avoids:

```
automatic contract rewriting  
automatic schema generation  
runtime request tracing
```

The system should report drift but leave contract updates to developers.

This avoids creating hidden contract logic inside the tool.

---

# 13. Risks

## False Positives

If extraction logic misidentifies routes, drift reports become unreliable.

Mitigation:

- restrict supported framework patterns
- report unresolved extraction explicitly

---

## Framework Variability

Different frameworks register routes differently.

Mitigation:

- support explicit static patterns first
- add framework adapters incrementally

---

## Overreliance on Contracts

Contracts are useful but should not become the source of truth.

Mitigation:

- code evidence remains primary
- contract artifacts remain secondary

---

# 14. Relationship to Developer Workflow

Phase B enables several useful workflows:

```
backend refactoring validation  
frontend contract verification  
documentation drift detection  
API lifecycle auditing
```

Developers gain a reliable way to answer:

```
Does the contract still match the code?
```

---

# 15. Future Extensions

Later phases may expand contract alignment to include:

```
schema propagation analysis  
permission mapping  
rate-limit documentation  
endpoint ownership tracking
```

These features must remain grounded in graph evidence.

---

# 16. Summary

Phase B adds **contract awareness** to the Code Graph system.

It does not replace API contracts.

Instead it provides a mechanical comparison between:

```
what the code actually exposes  
and  
what the contract claims exists
```

This significantly reduces the risk of long-term contract drift.

