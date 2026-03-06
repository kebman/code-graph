import * as path from "node:path";
import { indexRepository } from "./indexer";

function runIndexer(): void {
  const rootDirArg = process.argv[2];
  const rootDir = rootDirArg ? path.resolve(rootDirArg) : process.cwd();

  const result = indexRepository({ rootDir });
  const stats = result.graph.stats();
  console.log(`Files indexed: ${result.files.length}`);
  console.log(`Nodes: ${stats.nodeCount}`);
  console.log(`Edges: ${stats.edgeCount}`);

  if (result.diagnostics.length > 0) {
    console.log(`Diagnostics: ${result.diagnostics.length}`);
    for (const diagnostic of result.diagnostics) {
      const location = formatLocation(diagnostic.filePath, diagnostic.line, diagnostic.column);
      console.log(`[${diagnostic.severity}] ${diagnostic.code}${location}: ${diagnostic.message}`);
    }
  }
}

try {
  runIndexer();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Indexer run failed: ${message}`);
  process.exitCode = 1;
}

function formatLocation(
  filePath: string | undefined,
  line: number | undefined,
  column: number | undefined,
): string {
  if (!filePath) {
    return "";
  }

  if (!line || !column) {
    return ` (${filePath})`;
  }

  return ` (${filePath}:${line}:${column})`;
}
