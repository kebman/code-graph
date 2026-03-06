import * as path from "node:path";
import { indexRepository } from "./indexer";

function runEndpointInventory(): void {
  const rootDirArg = process.argv[2];
  const rootDir = rootDirArg ? path.resolve(rootDirArg) : process.cwd();

  const result = indexRepository({ rootDir });

  console.log("Endpoint Inventory");
  console.log(`- Files scanned: ${result.scannedFiles.length}`);
  console.log(`- Files indexed: ${result.files.length}`);
  console.log(`- Endpoints: ${result.endpoints.endpoints.length}`);
  console.log(`- Diagnostics: ${result.endpoints.diagnostics.length}`);
  console.log("");

  console.log("Endpoints");
  if (result.endpoints.endpoints.length === 0) {
    console.log("- (none)");
  } else {
    for (const endpoint of result.endpoints.endpoints) {
      const handlerSuffix = endpoint.handlerName ? ` -> ${endpoint.handlerName}` : "";
      console.log(
        `- ${endpoint.method} ${endpoint.path} (${endpoint.filePath}:${endpoint.line}:${endpoint.column})${handlerSuffix}`,
      );
    }
  }
  console.log("");

  console.log("Endpoint Diagnostics");
  if (result.endpoints.diagnostics.length === 0) {
    console.log("- (none)");
    return;
  }

  for (const diagnostic of result.endpoints.diagnostics) {
    const location = formatLocation(diagnostic.filePath, diagnostic.line, diagnostic.column);
    const methodPrefix = diagnostic.method ? `${diagnostic.method} ` : "";
    const pathSuffix = diagnostic.path ? ` ${diagnostic.path}` : "";
    const handlerSuffix = diagnostic.handlerName ? ` -> ${diagnostic.handlerName}` : "";
    console.log(
      `- ${diagnostic.code}${location}: ${methodPrefix}${diagnostic.message}${pathSuffix}${handlerSuffix}`,
    );
  }
}

try {
  runEndpointInventory();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Endpoint inventory failed: ${message}`);
  process.exitCode = 1;
}

function formatLocation(filePath: string, line: number, column: number): string {
  return ` (${filePath}:${line}:${column})`;
}
