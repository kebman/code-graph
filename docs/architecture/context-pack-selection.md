# Context Pack Selection

Status: Draft

Depends on:

- docs/architecture/graph-model.md
- docs/architecture/graph-views.md
- docs/architecture/query-semantics.md
- docs/architecture/graph-traversal-rules.md
- docs/architecture/id-and-normalization.md
- docs/designs/output-format.md
- docs/architecture/ai-context-pack.md

This document defines the deterministic algorithm used to build **AI Context Packs**.

A context pack is a curated collection of code fragments, files, and supporting graph evidence that provides structured context for AI-assisted reasoning.


---

# Scope

This document defines the **selection algorithm** used for:

- file inclusion
- symbol inclusion
- snippet extraction
- truncation behavior
- deterministic ordering

The goal is to ensure that context packs are:

- deterministic
- explainable
- minimal but sufficient


---

# Context Pack Overview

A context pack contains:

```
seed  
selected nodes  
selected edges  
code snippets  
supporting metadata
```


Typical pack output:

```
context-pack  
├ seed  
├ nodes  
├ edges  
├ files  
├ snippets  
└ evidence
```


---

# Seed Selection

Context pack generation begins with a **seed node**.

Seeds may be:

- file nodes
- symbol nodes
- query result nodes
- explicit CLI input

Examples:

```
pack src/indexer/parser.ts  
pack symbol:GraphBuilder.build  
pack result:callers
```

The seed determines the initial traversal starting point.


---

# Selection Algorithm

Context pack construction proceeds through several phases.

```
Seed Resolution  
↓  
Graph Expansion  
↓  
Node Selection  
↓  
File Aggregation  
↓  
Snippet Extraction  
↓  
Truncation  
↓  
Output Assembly
```


---

# Step 1 — Seed Resolution

The seed input is normalized into a graph node.

Examples:

- file path → File node
- symbol name → Symbol node

Normalization rules follow:

docs/architecture/id-and-normalization.md


---

# Step 2 — Graph Expansion

The graph is explored around the seed.

Traversal rules follow:

docs/architecture/graph-traversal-rules.md

Traversal may include:

- CALLS
- REFERENCES
- INSTANTIATES
- IMPORTS

Traversal limits must include:

- maxDepth
- maxNodes
- maxEdges


---

# Step 3 — Node Selection

Candidate nodes are selected based on traversal results.

Selection priority:

1. seed node
2. direct neighbors
3. dependency nodes
4. contextual support nodes

Nodes should be sorted deterministically by:

```
node_id
```


---

# Step 4 — File Aggregation

Selected nodes are mapped back to their source files.

File nodes are added to the pack if they contain:

- selected symbols
- relevant dependencies

Files are deduplicated and ordered deterministically.


---

# Step 5 — Snippet Extraction

Instead of including entire files, the pack may include targeted snippets.

Typical snippet targets:

- symbol definitions
- function bodies
- relevant imports
- surrounding context

Snippet extraction must preserve:

- code boundaries
- line ordering
- deterministic selection


---

# Step 6 — Truncation

Context packs must respect size limits.

Typical limits include:

- max files
- max snippets
- max characters
- max tokens

If limits are reached:

- lower-priority nodes are removed
- truncation flags are added to output


---

# Step 7 — Output Assembly

The final pack contains:

```
seed  
nodes  
edges  
files  
snippets  
evidence  
truncation
```

Output must conform to:

docs/designs/output-format.md


---

# Deterministic Ordering

Context packs must be reproducible.

Ordering must follow:

1. node_id ordering
2. file path ordering
3. snippet position ordering

Determinism is essential for:

- repeatable AI workflows
- stable testing
- predictable context generation


---

# Evidence Generation

Context packs must include evidence explaining selection.

Examples:

```
symbol A CALLS symbol B  
symbol B defined in file X  
file X imported by file Y
```

Evidence should reference graph edges.


---

# Example Context Pack

Example:

```
Seed: function parseFile

Selected Nodes:

- parseFile
- GraphBuilder
- buildGraph

Selected Files:

- src/indexer/parser.ts
- src/graph/builder.ts

Snippets:

- parseFile definition
- GraphBuilder.buildGraph method
```

Evidence explains how each element was selected.


---

# Relationship to Graph Views

Context packs correspond to **View 3**.

See:

docs/architecture/graph-views.md

View 3 combines:

- symbol-level graph
- file-level graph
- snippet extraction


---

# Long-Term Goal

Context pack selection allows AI tools to operate on **structured, explainable code context** rather than raw file scanning.

This enables:

- better reasoning
- smaller prompts
- reduced hallucination
- traceable analysis.

