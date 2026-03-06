import * as path from "node:path";
import { indexRepository } from "../indexer/indexer";
import {
  buildEndpointTruthReport,
  type BackendOnlyEndpointTruthGroup,
  type ConsumerOnlyEndpointTruthGroup,
  type EndpointTruthAmbiguousItem,
  type MatchedEndpointTruthGroup,
} from "./endpoint-truth-report";

function runEndpointTruthReport(): void {
  const rootDirArg = process.argv[2];
  const rootDir = rootDirArg ? path.resolve(rootDirArg) : process.cwd();

  const result = indexRepository({ rootDir });
  const report = buildEndpointTruthReport({
    endpoints: result.endpoints,
    apiCallsites: result.apiCallsites,
  });

  console.log("Endpoint Truth Report");
  console.log(`- Files indexed: ${result.files.length}`);
  console.log(`- Backend endpoints: ${result.endpoints.endpoints.length}`);
  console.log(`- API callsites: ${result.apiCallsites.callsites.length}`);
  console.log(`- Matched signatures: ${report.matched.length}`);
  console.log(`- Backend-only signatures: ${report.backendOnly.length}`);
  console.log(`- Consumer-only signatures: ${report.consumerOnly.length}`);
  console.log(`- Ambiguous / unresolved: ${report.ambiguous.length}`);
  console.log("");

  printMatchedSection(report.matched);
  printBackendOnlySection(report.backendOnly);
  printConsumerOnlySection(report.consumerOnly);
  printAmbiguousSection(report.ambiguous);
  printDiagnosticsSummary(report);
}

function printMatchedSection(groups: readonly MatchedEndpointTruthGroup[]): void {
  console.log("Matched");
  if (groups.length === 0) {
    console.log("- (none)");
    console.log("");
    return;
  }

  for (const group of groups) {
    console.log(`- ${group.method} ${group.path}`);
    for (const endpoint of group.endpoints) {
      const handlerSuffix = endpoint.handlerName ? ` -> ${endpoint.handlerName}` : "";
      console.log(
        `  backend: ${endpoint.filePath}:${endpoint.line}:${endpoint.column}${handlerSuffix}`,
      );
    }
    for (const callsite of group.callsites) {
      const enclosingSuffix = callsite.enclosingSymbol ? ` -> ${callsite.enclosingSymbol}` : "";
      console.log(
        `  consumer: ${callsite.filePath}:${callsite.line}:${callsite.column}${enclosingSuffix}`,
      );
    }
  }
  console.log("");
}

function printBackendOnlySection(groups: readonly BackendOnlyEndpointTruthGroup[]): void {
  console.log("Backend-only");
  if (groups.length === 0) {
    console.log("- (none)");
    console.log("");
    return;
  }

  for (const group of groups) {
    console.log(`- ${group.method} ${group.path}`);
    for (const endpoint of group.endpoints) {
      const handlerSuffix = endpoint.handlerName ? ` -> ${endpoint.handlerName}` : "";
      console.log(
        `  backend: ${endpoint.filePath}:${endpoint.line}:${endpoint.column}${handlerSuffix}`,
      );
    }
  }
  console.log("");
}

function printConsumerOnlySection(groups: readonly ConsumerOnlyEndpointTruthGroup[]): void {
  console.log("Consumer-only");
  if (groups.length === 0) {
    console.log("- (none)");
    console.log("");
    return;
  }

  for (const group of groups) {
    console.log(`- ${group.method} ${group.path}`);
    for (const callsite of group.callsites) {
      const enclosingSuffix = callsite.enclosingSymbol ? ` -> ${callsite.enclosingSymbol}` : "";
      console.log(
        `  consumer: ${callsite.filePath}:${callsite.line}:${callsite.column}${enclosingSuffix}`,
      );
    }
  }
  console.log("");
}

function printAmbiguousSection(items: readonly EndpointTruthAmbiguousItem[]): void {
  console.log("Ambiguous / Unresolved");
  if (items.length === 0) {
    console.log("- (none)");
    console.log("");
    return;
  }

  for (const item of items) {
    const signature = formatSignature(item.method, item.path);
    const detailSuffix = item.detail ? ` -> ${item.detail}` : "";
    console.log(
      `- ${item.source} ${item.code} (${item.filePath}:${item.line}:${item.column})${signature}: ${item.message}${detailSuffix}`,
    );
  }
  console.log("");
}

function printDiagnosticsSummary(
  report: {
    readonly diagnostics: {
      readonly endpointRecognized: number;
      readonly endpointPartial: number;
      readonly endpointSkippedDynamic: number;
      readonly callsiteRecognized: number;
      readonly callsitePartial: number;
      readonly callsiteSkippedDynamic: number;
    };
  },
): void {
  console.log("Diagnostics Summary");
  console.log(`- Endpoint recognized: ${report.diagnostics.endpointRecognized}`);
  console.log(`- Endpoint partial: ${report.diagnostics.endpointPartial}`);
  console.log(`- Endpoint skipped dynamic: ${report.diagnostics.endpointSkippedDynamic}`);
  console.log(`- Callsite recognized: ${report.diagnostics.callsiteRecognized}`);
  console.log(`- Callsite partial: ${report.diagnostics.callsitePartial}`);
  console.log(`- Callsite skipped dynamic: ${report.diagnostics.callsiteSkippedDynamic}`);
}

function formatSignature(method: string | undefined, path: string | undefined): string {
  if (!method && !path) {
    return "";
  }

  if (!method) {
    return ` [${path}]`;
  }

  if (!path) {
    return ` [${method}]`;
  }

  return ` [${method} ${path}]`;
}

try {
  runEndpointTruthReport();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Endpoint truth report failed: ${message}`);
  process.exitCode = 1;
}
