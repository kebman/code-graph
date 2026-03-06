# Graph Coverage

> Project working title: Code Graph (temporary name)

Depends on:
- [graph-model.md](./graph-model.md)
- [graph-views.md](./graph-views.md)
- [indexer-architecture.md](./indexer-architecture.md)
- [query-engine-architecture.md](./query-engine-architecture.md)
- [success-criteria.md](./success-criteria.md)
- [real-world-validation.md](./real-world-validation.md)

Status: Draft

---

# 1. Purpose

This document defines **graph coverage**.

Graph coverage describes **how much of a repository’s structure is represented inside the Code Graph**.

Coverage is an important diagnostic metric because it reveals:

```
which parts of the system are visible to the graph  
which parts remain opaque
```

Without understanding coverage, developers may incorrectly assume the graph is complete.

---

# 2. What Coverage Means

Graph coverage answers the question:

```
How much of the repository structure can the graph represent reliably?
```

Coverage is not binary.

Instead, it exists on a spectrum.

Examples:

```
file coverage  
symbol coverage  
call graph coverage  
endpoint coverage
```

Each category reflects a different level of structural insight.

---

# 3. File Coverage

File coverage measures whether the indexer can see all relevant source files.

Typical expectations:

```
all TypeScript source files indexed  
configuration files recognized  
documentation files optionally indexed
```

Files excluded intentionally (examples):

```
node_modules  
build artifacts  
generated files
```

These exclusions must be explicit.

---

# 4. Symbol Coverage

Symbol coverage measures how many program symbols are represented in the graph.

Examples of symbols:

```
functions  
classes  
methods  
exported variables  
types
```

Coverage may vary depending on language features.

Example limitation:

```
symbols created through runtime metaprogramming
```

Such symbols may not appear in static analysis.

---

# 5. Call Graph Coverage

Call graph coverage measures whether function calls are represented accurately.

Examples:

```
direct function calls  
method calls  
imported function calls
```

Limitations may include:

```
dynamic invocation  
reflection  
function references passed through complex structures
```

When the indexer cannot resolve a call target, it should record a diagnostic.

---

# 6. Endpoint Coverage

Endpoint coverage measures how many HTTP endpoints are discovered by the system.

Typical signals:

```
route registration calls  
handler bindings  
framework routing APIs
```

Example frameworks:

```
Express  
Fastify  
Koa
```

Endpoints generated dynamically may not be detectable through static analysis.

---

# 7. Runtime Topology Coverage

Some runtime configuration surfaces can be represented.

Examples:

```
Dockerfile  
docker-compose.yml  
service entrypoints
```

These surfaces allow the graph to represent:

```
service boundaries  
runtime dependencies  
container relationships
```

However, runtime orchestration may involve behavior that cannot be determined statically.

---

# 8. Documentation Coverage

Documentation coverage refers to how much documentation structure is included in the graph.

Possible elements:

```
glossary terms  
document references  
concept definitions
```

This layer is introduced in Phase C.

See:

- `phase-c-doc-terminology.md`

Documentation coverage focuses on **terminology relationships**, not full semantic understanding.

---

# 9. Coverage Metrics

Coverage may be expressed using simple metrics.

Examples:

```
files indexed / total files  
symbols indexed / total symbols  
calls resolved / total call expressions  
endpoints detected / expected endpoints
```

These metrics provide visibility into system limitations.

---

# 10. Coverage Gaps

Coverage gaps occur when parts of the system cannot be represented.

Common causes:

```
dynamic runtime behavior  
generated code  
reflection  
external services
```

Coverage gaps should be reported explicitly.

Silent omissions create misleading graph results.

---

# 11. Coverage Diagnostics

The system should provide diagnostics for coverage limitations.

Examples:

```
unresolved symbol reference  
dynamic import detected  
unsupported routing pattern
```

These diagnostics help developers understand why certain edges are missing.

---

# 12. Coverage and Trust

Coverage directly affects how much developers can trust the graph.

High coverage means:

```
structural queries are reliable  
relationships reflect actual code behavior
```

Low coverage means:

```
queries may omit important relationships  
developers must interpret results carefully
```

Understanding coverage helps prevent incorrect conclusions.

---

# 13. Coverage Evolution

Coverage should improve over time as the system supports more patterns.

However, improvements must maintain:

```
determinism  
bounded complexity  
architectural clarity
```

Coverage expansion should not introduce speculative inference.

---

# 14. Coverage in Real-World Validation

Real-world validation should evaluate coverage explicitly.

See:

- `real-world-validation.md`

Validation should confirm that:

```
major structural components are represented  
important queries produce meaningful results  
coverage gaps are documented
```

---

# 15. Summary

Graph coverage describes **how much of a repository’s structure is visible to the system**.

Understanding coverage ensures that developers:

```
interpret graph results correctly  
recognize system limitations  
maintain realistic expectations
```

A transparent coverage model strengthens the reliability of Code Graph.

