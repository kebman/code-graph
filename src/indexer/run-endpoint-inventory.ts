import * as path from "node:path";
import { indexRepository } from "./indexer";

function runEndpointInventory(): void {
  const rootDirArg = process.argv[2];
  const rootDir = rootDirArg ? path.resolve(rootDirArg) : process.cwd();

  const result = indexRepository({ rootDir });

  console.log("API Surface Inventory");
  console.log(`- Files scanned: ${result.scannedFiles.length}`);
  console.log(`- Files indexed: ${result.files.length}`);
  console.log(`- Backend endpoints: ${result.endpoints.endpoints.length}`);
  console.log(`- Endpoint diagnostics: ${result.endpoints.diagnostics.length}`);
  console.log(`- API callsites: ${result.apiCallsites.callsites.length}`);
  console.log(`- Callsite diagnostics: ${result.apiCallsites.diagnostics.length}`);
  console.log("");

  console.log("Backend Endpoints");
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
  } else {
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
  console.log("");

  console.log("API Callsites");
  if (result.apiCallsites.callsites.length === 0) {
    console.log("- (none)");
  } else {
    for (const callsite of result.apiCallsites.callsites) {
      const methodPrefix = callsite.method ? `${callsite.method} ` : "";
      const enclosingSuffix = callsite.enclosingSymbol ? ` -> ${callsite.enclosingSymbol}` : "";
      console.log(
        `- ${methodPrefix}${callsite.path} (${callsite.filePath}:${callsite.line}:${callsite.column})${enclosingSuffix}`,
      );
    }
  }
  console.log("");

  console.log("API Callsite Diagnostics");
  if (result.apiCallsites.diagnostics.length === 0) {
    console.log("- (none)");
    return;
  }

  for (const diagnostic of result.apiCallsites.diagnostics) {
    const location = formatLocation(diagnostic.filePath, diagnostic.line, diagnostic.column);
    const methodPrefix = diagnostic.method ? `${diagnostic.method} ` : "";
    const pathSuffix = diagnostic.path ? ` ${diagnostic.path}` : "";
    const enclosingSuffix = diagnostic.enclosingSymbol ? ` -> ${diagnostic.enclosingSymbol}` : "";
    console.log(
      `- ${diagnostic.code}${location}: ${methodPrefix}${diagnostic.message}${pathSuffix}${enclosingSuffix}`,
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
