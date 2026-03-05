# Indexer Design (v1)

> Project working title: Code Graph (temporary name)

This document describes the concrete design of the **Indexer implementation** for v1.

It translates architectural intent into implementable components.

This document is implementation-oriented.
It must conform to:
- `graph-model.md`
- `graph-views.md`
- `invariants.md`

---

# 1. Responsibilities

The Indexer must:

1. Load a TypeScript project
2. Extract structural information
3. Build node and edge records
4. Persist graph state
5. Support incremental updates
6. Remain deterministic

It must not:
- Execute queries
- Perform multi-hop traversal
- Implement ranking logic

---

# 2. Technology Stack (v1)

- Node.js
- TypeScript
- TypeScript Compiler API
- Local embedded storage (SQLite or equivalent)

No runtime dependencies on IDE tooling.

---

# 3. Component Structure

Proposed internal structure:

```
src/  
indexer/  
program-loader.ts  
file-extractor.ts  
symbol-extractor.ts  
reference-extractor.ts  
call-extractor.ts  
type-extractor.ts  
runtime-extractor.ts  
incremental.ts
```

Each module must be single-responsibility.

---

# 4. Program Loader

## Responsibilities

- Locate `tsconfig.json`
- Construct TypeScript Program
- Normalize file paths
- Filter included source files

## Implementation Notes

Use:

- `ts.parseJsonConfigFileContent`
- `ts.createProgram`
- `program.getSourceFiles()`

Exclude:

- `.d.ts` files (unless explicitly needed)
- Node_modules (unless future external resolution enabled)

---

# 5. File Extraction

For each source file:

1. Create File node
2. Extract:
   - Import declarations
   - Export declarations
3. Record IMPORTS edges

Path normalization must be consistent across OS.

---

# 6. Symbol Extraction

Process exported declarations only.

## Supported Kinds (v1)

- FunctionDeclaration
- ClassDeclaration
- InterfaceDeclaration
- TypeAliasDeclaration
- VariableStatement (exported const)

## Rules

- Ignore non-exported declarations
- Handle:
  - `export default`
  - `export { foo }`
  - `export * from`
- Resolve re-exports if possible

Stable ID generation must follow graph-model specification.

---

# 7. Reference Extraction

Traverse AST of each file.

For each identifier:

1. Resolve symbol via `typeChecker.getSymbolAtLocation`
2. Determine:
   - Referenced declaration
   - Whether it is exported
3. If exported:
   - Record REFERENCES edge

Aggregation:
- Multiple references between same pair may increment counter
- At least one source location stored

---

# 8. Call Extraction

Traverse CallExpression nodes.

For each call:

1. Resolve expression symbol
2. Confirm target is exported symbol
3. Record CALLS edge

If symbol resolution fails:
- Do not create speculative edge
- Optionally log unresolved call (debug mode)

No dynamic resolution in v1.

---

# 9. Instantiation Extraction

Detect `new ClassName()` expressions.

If ClassName resolves to exported class:
- Record INSTANTIATES edge

---

# 10. Type Extraction

For each exported function:

- Extract parameter types
- Extract return type

Record:

- ACCEPTS_TYPE
- RETURNS_TYPE

Type nodes may reuse Symbol nodes in v1.

No deep type graph propagation.

---

# 11. Runtime Extraction (View 0)

Optional v1 feature.

Parse:

- docker-compose files
- Dockerfile

Extract:

- Services
- depends_on
- build relationships

Represent as runtime nodes and edges.

No runtime inspection.

---

# 12. Storage Layer Interaction

Indexer writes:

- Node records
- Edge records

Workflow:

1. Begin transaction
2. Remove outdated nodes/edges (if incremental)
3. Insert/update nodes
4. Insert/update edges
5. Commit

Must avoid partial writes.

---

# 13. Incremental Mode

## Strategy

1. Run `git diff --name-only`
2. Identify changed files
3. For each changed file:
   - Remove all outbound edges
   - Remove symbol nodes belonging to file
   - Re-index file
4. Update inbound references where necessary

If git not available:
- Fallback to full rebuild

---

# 14. Determinism Controls

Before persisting:

- Sort files by canonical path
- Sort symbols by name
- Sort edges by:
  - from_id
  - to_id
  - kind

Never rely on object iteration order.

---

# 15. Error Handling

Indexer must:

- Fail on TypeScript program construction error
- Skip malformed files with clear log
- Avoid persisting partial state
- Support `--clean` full rebuild flag

---

# 16. Performance Strategy

Initial performance target:

- Medium repo (~100k LOC)
- Full index under ~10 seconds
- Incremental index under ~2 seconds

Optimization deferred until correctness achieved.

Potential optimizations (future):

- Parallel file traversal
- File hash caching
- AST caching

---

# 17. Logging Strategy

Two modes:

- Normal: minimal output
- Debug: verbose:
  - Unresolved symbols
  - Re-export chains
  - Incremental decisions

Logging must not affect determinism.

---

# 18. Testing Strategy

Required tests:

- File import extraction
- Symbol export detection
- Call resolution
- Stable ID generation
- Incremental rebuild correctness

Snapshot tests may be used to verify graph stability.

---

# 19. Known Limitations (v1)

- Does not resolve dynamic imports
- Does not model runtime-only resolution
- Does not detect circular dependency at symbol-level during indexing
- Does not track local variable propagation

These are acceptable under v1 invariants.

---

# 20. Definition of Done (Indexer v1)

Indexer is complete when:

- Full graph can be generated for a TS project
- All exported symbols are indexed
- CALLS and IMPORTS edges are correct for common cases
- Incremental indexing works reliably
- Graph output is deterministic

---

# Status

This document defines the concrete Indexer implementation design for v1.

All changes must remain consistent with:
- Graph Model
- Invariants
- Roadmap v1 scope
