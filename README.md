# Code Graph (Working Title)

> ⚠️ **Name is temporary.**
>
> `code-graph` is a placeholder name used during early design and prototyping.
> The final name may change due to clarity, scope, or trademark reasons.
> Do not assume branding stability at this stage.

Code Graph is an early prototype for a deterministic, local, evidence-backed map of a TypeScript codebase.

It indexes repository structure without requiring LLM tokens, then lets you query the graph for imports, calls, dependencies, and bounded context slices.
The canonical graph model lives in:
- [docs/architecture/graph-model.md](docs/architecture/graph-model.md)

Supporting reference guides:

- [docs/architecture/graph-node-kinds.md](docs/architecture/graph-node-kinds.md)
- [docs/architecture/graph-edge-kinds.md](docs/architecture/graph-edge-kinds.md)

## Why It Exists

Large TypeScript repositories are hard to reason about from ad hoc file reads alone.

Code Graph exists to make the structural facts explicit so developers and AI agents can work from a smaller, verified context.

## Current Status

The project is still early, but it is no longer only a design sketch.

Runnable scripts currently available:

- `npm test` for regression tests
- `npm run indexer:run` for the indexer run
- `npm run query:demo` for the query demo
- `npm run endpoints:inventory` for endpoint inventory
- `npm run endpoints:truth` for the endpoint truth report

The implementation is intentionally bounded. It is not a full IDE replacement, and it does not claim complete semantic understanding.

## What It Does Not Claim

- No full intra-function dataflow
- No dynamic runtime instrumentation
- No speculative edge emission
- No architecture-sized UI promise
- No final branding

## Documentation Entry Points

- [docs/README.md](docs/README.md)
- [docs/architecture/architecture-overview.md](docs/architecture/architecture-overview.md)
- [docs/architecture/doc-authority-map.md](docs/architecture/doc-authority-map.md)
- [docs/development/repo-structure.md](docs/development/repo-structure.md)

## License

TBD
