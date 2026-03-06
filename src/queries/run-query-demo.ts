import * as path from "node:path";
import { indexRepository } from "../indexer/indexer";
import {
  findCallers,
  findContainedSymbols,
  findDependencies,
  findImporters,
} from "./graph-queries";

function runQueryDemo(): void {
  const rootDirArg = process.argv[2];
  const rootDir = rootDirArg ? path.resolve(rootDirArg) : process.cwd();

  const result = indexRepository({ rootDir });
  const stats = result.graph.stats();
  console.log("Graph Stats");
  console.log(`- Files indexed: ${result.files.length}`);
  console.log(`- Nodes: ${stats.nodeCount}`);
  console.log(`- Edges: ${stats.edgeCount}`);
  console.log(`- Diagnostics: ${result.diagnostics.length}`);
  console.log("");

  const importersTarget = "src/graph/graph.ts";
  printFileQuerySection(
    `Query: Importers of ${importersTarget}`,
    findImporters(result.graph, importersTarget),
  );

  const containsTarget = "src/graph/validate.ts";
  printSymbolQuerySection(
    `Query: Contained symbols in ${containsTarget}`,
    findContainedSymbols(result.graph, containsTarget),
  );

  const callersTarget = "validate";
  printSymbolQuerySection(
    `Query: Callers of ${callersTarget}`,
    findCallers(result.graph, callersTarget),
  );

  const dependenciesTarget = "src/graph/ids.ts";
  printFileQuerySection(
    `Query: Dependencies of ${dependenciesTarget}`,
    findDependencies(result.graph, dependenciesTarget),
  );
}

function printFileQuerySection(title: string, nodes: readonly { readonly metadata: unknown }[]): void {
  console.log(title);
  if (nodes.length === 0) {
    console.log("- (none)");
    console.log("");
    return;
  }

  for (const node of nodes) {
    const metadata = node.metadata as { readonly path?: unknown };
    const pathValue = typeof metadata.path === "string" ? metadata.path : "(missing path)";
    console.log(`- ${pathValue}`);
  }
  console.log("");
}

function printSymbolQuerySection(
  title: string,
  nodes: readonly { readonly id: string; readonly metadata: unknown }[],
): void {
  console.log(title);
  if (nodes.length === 0) {
    console.log("- (none)");
    console.log("");
    return;
  }

  for (const node of nodes) {
    const metadata = node.metadata as { readonly name?: unknown; readonly file_path?: unknown };
    const name = typeof metadata.name === "string" ? metadata.name : node.id;
    const filePath = typeof metadata.file_path === "string" ? metadata.file_path : undefined;
    if (filePath) {
      console.log(`- ${name} (${filePath})`);
    } else {
      console.log(`- ${name}`);
    }
  }
  console.log("");
}

try {
  runQueryDemo();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Query demo failed: ${message}`);
  process.exitCode = 1;
}
