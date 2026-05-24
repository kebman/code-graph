# ProJect Endpoint Truth Spike

_(Code Graph Phase B – ProJect-specific)_

## Objective

Produce an **objective inventory of backend endpoints** in ProJect and compare it against the **OpenAPI specification**, generating a **drift report**.

The spike is successful if we can answer:

1. Which endpoints exist in the backend?
2. Which endpoints exist in OpenAPI?
3. Which endpoints exist in both?
4. Which endpoints are **missing** from either side?

The output should help **tie the ProJect backend to the frontend** with confidence.

---

# Constraints

### Time limit

Maximum **2 days of work**.

### Scope

ProJect backend only.

### Goal

Deliver **useful output**, not perfect architecture.

### Out of scope

Do NOT build:

- full semantic analysis
- full framework abstraction
- complete API schema extraction
- frontend usage analysis
- Neo4j integration
- storage layer

Those may come later.

---

# Deliverable

The spike must produce **one concrete artifact**:

```
project-endpoint-report.md
```

Containing:

### Backend endpoints

```
GET    /api/auth/me
POST   /api/auth/login
GET    /api/events
POST   /api/events
...
```

### OpenAPI endpoints

```
GET    /api/auth/me
POST   /api/auth/login
GET    /api/events
...
```

### Drift report

```
Endpoints in backend but NOT in OpenAPI
---------------------------------------
POST /api/internal/debug

Endpoints in OpenAPI but NOT in backend
---------------------------------------
PUT /api/user/profile

Endpoints in both
-----------------
GET /api/events
POST /api/auth/login
```

---

# High-Level Architecture

Reuse the existing **Code Graph indexer**.

Add a small **endpoint extraction layer**.

```
repo
 ├─ code graph indexer
 │
 ├─ endpoint extractor (NEW)
 │
 ├─ openapi parser (NEW)
 │
 └─ comparison report (NEW)
```

No graph changes required.

---

# Step 1 — Backend Endpoint Extraction

Create:

```
src/extractors/endpoint-extractor.ts
```

Goal: detect endpoints defined in backend code.

We only need to support **simple patterns**.

### Target patterns

Examples:

```ts
router.get("/api/events", handler)
router.post("/api/auth/login", handler)
app.get("/api/auth/me", handler)
app.post("/api/events", handler)
```

Capture:

```
method
path
handler symbol name
file path
```

Example output:

```
{
  method: "GET",
  path: "/api/events",
  handler: "getEvents",
  file: "src/routes/events.ts"
}
```

### Implementation approach

Use existing:

```
ast-parser
symbol-extractor
relationship-extractor
```

Then scan AST for:

```
CallExpression
```

Where:

```
identifier.property = HTTP method
```

Valid methods:

```
get
post
put
patch
delete
```

And first argument is string literal path.

---

# Step 2 — Endpoint Registry

Create:

```
src/endpoints/endpoint-registry.ts
```

This collects endpoints extracted from the backend.

Structure:

```
Endpoint {
  method
  path
  file
  handler
}
```

Registry result:

```
Endpoint[]
```

Sorted deterministically.

---

# Step 3 — OpenAPI Parser

Create:

```
src/openapi/openapi-parser.ts
```

Input:

```
openapi.yaml
```

Extract:

```
method
path
```

Output:

```
OpenApiEndpoint[]
```

Example:

```
GET /api/events
POST /api/auth/login
```

Only method + path needed.

---

# Step 4 — Endpoint Comparison

Create:

```
src/endpoints/endpoint-diff.ts
```

Compute:

```
backend_only
openapi_only
both
```

Use normalized key:

```
METHOD + PATH
```

Example key:

```
GET /api/events
```

---

# Step 5 — Report Generator

Create:

```
src/endpoints/generate-report.ts
```

Output file:

```
project-endpoint-report.md
```

Sections:

```
Backend endpoints
OpenAPI endpoints
Endpoints missing from OpenAPI
Endpoints missing from backend
Endpoints in both
```

Sorted alphabetically.

---

# Step 6 — CLI Runner

Create:

```
src/endpoints/run-endpoint-report.ts
```

Usage:

```
npm run endpoints:report
```

Example output:

```
Backend endpoints: 32
OpenAPI endpoints: 29

Missing from OpenAPI: 5
Missing from backend: 2
```

---

# Step 7 — Test on ProJect

Run against:

```
project/backend
```

Then generate:

```
project-endpoint-report.md
```

This is the **actual value artifact**.

---

# Definition of Done

The spike is complete when:

1. Backend endpoints can be extracted.
2. OpenAPI endpoints can be parsed.
3. A drift report is generated.
4. Report works on ProJect repo.

---

# Expected Value

The report should help answer:

### Backend cleanup

```
Which endpoints exist but are undocumented?
```

### OpenAPI cleanup

```
Which OpenAPI endpoints are obsolete?
```

### Frontend planning

```
Which endpoints must be implemented next?
```

---

# Non-goals

This spike intentionally does NOT include:

- request schema extraction
- response schema extraction
- auth inference
- controller/service call analysis
- Neo4j export

Those can come later.

---

# Stretch Goal (Optional)

If time remains:

Add handler tracing:

```
endpoint → handler → service calls
```

This would help frontend understand which backend subsystems an endpoint touches.

But this is **not required for the spike**.

---

# Success Criteria

The spike is successful if it produces:

```
project-endpoint-report.md
```

that meaningfully helps align:

```
Backend
OpenAPI
Frontend
```

