import * as path from "node:path";
import { indexRepository } from "./indexer";

function runIndexer(): void {
  const rootDirArg = process.argv[2];
  const rootDir = rootDirArg ? path.resolve(rootDirArg) : process.cwd();

  const result = indexRepository({ rootDir });
  const validation = result.graph.validate();
  if (!validation.ok) {
    throw new Error(`Graph validation failed with ${validation.issues.length} issue(s).`);
  }

  const stats = result.graph.stats();
  console.log(`Files indexed: ${result.files.length}`);
  console.log(`Nodes: ${stats.nodeCount}`);
  console.log(`Edges: ${stats.edgeCount}`);
}

try {
  runIndexer();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Indexer run failed: ${message}`);
  process.exitCode = 1;
}
