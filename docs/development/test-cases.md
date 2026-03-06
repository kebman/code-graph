# Test Cases

> Project working title: Code Graph (temporary name)

Depends on:
- [../architecture/project-phases.md](../architecture/project-phases.md)
- [../architecture/graph-model.md](../architecture/graph-model.md)
- [../architecture/graph-views.md](../architecture/graph-views.md)
- [../architecture/endpoint-surface.md](../architecture/endpoint-surface.md)
- [../architecture/invariants.md](../architecture/invariants.md)
- [../roadmaps/roadmap-v1.md](../roadmaps/roadmap-v1.md)

Status: Draft

---

# 1. Purpose

This document defines the **real-world and synthetic repositories used to validate Code Graph**.

Test cases serve three purposes:

1. Verify that indexing produces deterministic graph output.
2. Confirm that graph queries provide meaningful engineering insight.
3. Ensure the system solves real development problems rather than only theoretical ones.

A project cannot be considered supported until it has been validated through the test case process defined here.

---

# 2. Categories of Test Cases

Code Graph test cases fall into three categories:

```
1. Minimal Fixtures
2. Structured Synthetic Repositories
3. Real-World Repositories
```

Each category validates different aspects of the system.

---

# 3. Minimal Fixtures

Minimal fixtures are extremely small codebases created specifically to test graph behavior.

Typical size:

```
1–10 files
```

Minimal fixtures are used to verify:

- node creation
- edge generation
- ID normalization
- deterministic ordering
- query correctness

Example structure:

```
fixtures/simple-call/  
a.ts  
b.ts
```

Where:

```
a.ts → imports b.ts  
a.ts → calls b()
```

Expected graph edges:

```
IMPORTS  
CALLS  
CONTAINS
```

Minimal fixtures should exist for every canonical edge type.

---

# 4. Structured Synthetic Repositories

Synthetic repositories simulate realistic backend structures but remain small and controlled.

Typical size:

```
20–100 files
```

These repos are designed to test:

- multi-module structure
- service layers
- controller layers
- DTO usage
- database access
- runtime topology

Example structure:

```
src/  
routes/  
controllers/  
services/  
repositories/  
models/
```

Synthetic repos allow controlled experimentation without the unpredictability of real projects.

---

# 5. Real-World Repositories

Real-world repositories provide the most important validation.

These projects represent actual developer environments and reveal:

- real dependency complexity
- inconsistent naming
- framework-specific routing patterns
- partial typing
- documentation drift

Real-world repos ensure the system remains practical.

---

# 6. Primary Proving Case

The first major real-world proving case is a **TypeScript backend with REST endpoints**.

This type of project stresses all critical surfaces:

- file graph
- symbol graph
- endpoint surface
- flow tracing
- contract drift detection
- documentation terminology drift

Such a backend typically includes:

```
routes  
controllers  
services  
validators or DTOs  
database access  
OpenAPI or similar API documentation
```

This environment exposes the exact problems Code Graph aims to solve.

---

# 7. Endpoint Surface Validation

The Endpoint Surface must be validated against a real backend.

Validation should confirm the system can reliably extract:

```
HTTP method  
route path  
handler symbol  
handler file  
registration location
```

Optional evidence:

```
request validation  
DTO usage  
response sinks  
database writes
```

The system must clearly distinguish between:

```
confirmed evidence  
unresolved handler linkage  
unsupported route patterns
```

False certainty is worse than incomplete extraction.

---

# 8. Contract Drift Testing

Once endpoint extraction works, contract drift detection can be evaluated.

This requires comparing:

```
Code Endpoint Inventory  
vs  
Published Contract (OpenAPI or similar)
```

Expected drift classes include:

```
missing endpoints  
extra contract entries  
method/path mismatches  
stale handlers
```

The system should generate objective reports rather than attempting to modify contracts automatically.

---

# 9. Documentation Term Graph Testing

The Documentation Term Graph must be validated against the project's documentation set.

The system should be able to detect:

```
terms used but not defined  
defined terms never referenced  
conflicting synonyms  
inconsistent usage across documents
```

Only explicitly defined glossary terms should be tracked.

See:

- [../architecture/docs-term-graph.md](../architecture/docs-term-graph.md)

---

# 10. Determinism Verification

Every test case must confirm that graph output is deterministic.

Repeated indexing should produce identical:

```
node IDs  
edge IDs  
ordering  
query results
```

Determinism is required for:

- stable CI
- diff-based validation
- reliable contract comparison
- reproducible AI context packs

See:

- [../architecture/id-and-normalization.md](../architecture/id-and-normalization.md)

---

# 11. Failure Reporting

When indexing encounters unsupported patterns, the system must report them.

Examples:

```
dynamic route registration  
runtime-generated imports  
unresolvable handler references
```

These situations must not produce fabricated graph relationships.

Instead, the system should emit diagnostic warnings.

---

# 12. Test Case Lifecycle

Each test case progresses through a lifecycle:

```
candidate → supported → validated → regression test
```

Definitions:

Candidate  
A repository proposed for testing.

Supported  
The indexer can successfully parse and build a graph.

Validated  
Queries produce meaningful engineering results.

Regression Test  
The repository is used to prevent future regressions.

---

# 13. CI Integration

Test cases should be executed automatically in CI.

CI responsibilities:

```
run indexer  
validate graph invariants  
execute query snapshots  
verify deterministic output
```

CI should fail if:

```
graph invariants break  
node/edge IDs change unexpectedly  
queries produce different results
```

---

# 14. Success Criteria

A test case is considered successful when:

```
indexing succeeds deterministically  
graph invariants hold  
queries provide meaningful developer insight  
endpoint surface extraction works where applicable
```

A system that works only on synthetic examples but fails on real repositories is not considered production-ready.

---

# 15. Future Test Classes

Additional test classes may be added later:

```
monorepos  
polyglot projects  
large enterprise repositories  
plugin-based systems
```

These should only be introduced after the core architecture proves stable.

---

# 16. Summary

Test cases ensure Code Graph remains grounded in real engineering needs.

They provide a controlled way to verify:

```
graph correctness  
query usefulness  
endpoint extraction  
documentation drift detection
```

Real-world validation is essential before claiming that the system can reliably support developer workflows.

