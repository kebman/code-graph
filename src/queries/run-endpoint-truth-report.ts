import * as fs from "node:fs";
import * as path from "node:path";
import { indexRepository } from "../indexer/indexer";
import {
  buildEndpointTruthReport,
  type BackendOnlyEndpointTruthGroup,
  type ConsumerOnlyEndpointTruthGroup,
  type EndpointTruthAmbiguousItem,
  type EndpointTruthReport,
  type MatchedEndpointTruthGroup,
} from "./endpoint-truth-report";

const REPORT_FILENAME = "project-endpoint-report.md";

function runEndpointTruthReport(): void {
  const rootDirArg = process.argv[2];
  const rootDir = rootDirArg ? path.resolve(rootDirArg) : process.cwd();

  const result = indexRepository({ rootDir });
  const report = buildEndpointTruthReport({
    endpoints: result.endpoints,
    apiCallsites: result.apiCallsites,
  });

  const output = renderReport({
    rootDir,
    filesIndexed: result.files.length,
    backendEndpoints: result.endpoints.endpoints.length,
    apiCallsites: result.apiCallsites.callsites.length,
    report,
  });

  const outputPath = path.resolve(process.cwd(), REPORT_FILENAME);
  fs.writeFileSync(outputPath, output, "utf8");
  process.stdout.write(output);
  if (!output.endsWith("\n")) {
    process.stdout.write("\n");
  }
  process.stdout.write(`\nReport written: ${outputPath}\n`);
}

function renderReport(input: {
  readonly rootDir: string;
  readonly filesIndexed: number;
  readonly backendEndpoints: number;
  readonly apiCallsites: number;
  readonly report: EndpointTruthReport;
}): string {
  const lines: string[] = [];

  lines.push("# Project Endpoint Report");
  lines.push("");
  lines.push("## Summary");
  lines.push(`- Project root: \`${input.rootDir}\``);
  lines.push(`- Files indexed: ${input.filesIndexed}`);
  lines.push(`- Backend endpoints: ${input.backendEndpoints}`);
  lines.push(`- API callsites: ${input.apiCallsites}`);
  lines.push(`- Matched signatures: ${input.report.matched.length}`);
  lines.push(`- Backend-only signatures: ${input.report.backendOnly.length}`);
  lines.push(`- Consumer-only signatures: ${input.report.consumerOnly.length}`);
  lines.push(`- Ambiguous / unresolved items: ${input.report.ambiguous.length}`);
  lines.push("");

  lines.push("## Diagnostics Summary");
  lines.push(`- Endpoint recognized: ${input.report.diagnostics.endpointRecognized}`);
  lines.push(`- Endpoint partial: ${input.report.diagnostics.endpointPartial}`);
  lines.push(`- Endpoint skipped dynamic: ${input.report.diagnostics.endpointSkippedDynamic}`);
  lines.push(`- Callsite recognized: ${input.report.diagnostics.callsiteRecognized}`);
  lines.push(`- Callsite partial: ${input.report.diagnostics.callsitePartial}`);
  lines.push(`- Callsite skipped dynamic: ${input.report.diagnostics.callsiteSkippedDynamic}`);
  lines.push("");

  renderDiagnosticBuckets(lines, input.report.ambiguous);
  renderMatchedSection(lines, input.report.matched);
  renderBackendOnlySection(lines, input.report.backendOnly);
  renderConsumerOnlySection(lines, input.report.consumerOnly);
  renderAmbiguousSection(lines, input.report.ambiguous);

  return lines.join("\n");
}

function renderDiagnosticBuckets(
  lines: string[],
  items: readonly EndpointTruthAmbiguousItem[],
): void {
  lines.push("## Ambiguous / Unresolved By Type");
  if (items.length === 0) {
    lines.push("- (none)");
    lines.push("");
    return;
  }

  for (const bucket of groupAmbiguousItems(items)) {
    const marker = classifyLikelyExtractorLimitation(bucket.items[0]);
    const markerSuffix = marker ? ` - likely extractor limitation: ${marker}` : "";
    lines.push(`- ${bucket.source} ${bucket.code}: ${bucket.items.length}${markerSuffix}`);
  }
  lines.push("");
}

function renderMatchedSection(
  lines: string[],
  groups: readonly MatchedEndpointTruthGroup[],
): void {
  lines.push(`## Matched (${groups.length} signatures)`);
  if (groups.length === 0) {
    lines.push("- (none)");
    lines.push("");
    return;
  }

  for (const group of groups) {
    lines.push(
      `### ${group.method} ${group.path} (${group.endpoints.length} backend, ${group.callsites.length} consumer)`,
    );
    lines.push("Backend declarations:");
    for (const endpoint of group.endpoints) {
      lines.push(`- ${formatEndpointDetail(endpoint)}`);
    }
    lines.push("Consumer callsites:");
    for (const callsite of group.callsites) {
      lines.push(`- ${formatCallsiteDetail(callsite)}`);
    }
    lines.push("");
  }
}

function renderBackendOnlySection(
  lines: string[],
  groups: readonly BackendOnlyEndpointTruthGroup[],
): void {
  lines.push(`## Backend-only (${groups.length} signatures)`);
  if (groups.length === 0) {
    lines.push("- (none)");
    lines.push("");
    return;
  }

  for (const group of groups) {
    lines.push(`### ${group.method} ${group.path} (${group.endpoints.length} backend)`);
    for (const endpoint of group.endpoints) {
      lines.push(`- ${formatEndpointDetail(endpoint)}`);
    }
    lines.push("");
  }
}

function renderConsumerOnlySection(
  lines: string[],
  groups: readonly ConsumerOnlyEndpointTruthGroup[],
): void {
  lines.push(`## Consumer-only (${groups.length} signatures)`);
  if (groups.length === 0) {
    lines.push("- (none)");
    lines.push("");
    return;
  }

  for (const group of groups) {
    lines.push(`### ${group.method} ${group.path} (${group.callsites.length} consumer)`);
    for (const callsite of group.callsites) {
      lines.push(`- ${formatCallsiteDetail(callsite)}`);
    }
    lines.push("");
  }
}

function renderAmbiguousSection(
  lines: string[],
  items: readonly EndpointTruthAmbiguousItem[],
): void {
  lines.push(`## Ambiguous / Unresolved (${items.length} items)`);
  if (items.length === 0) {
    lines.push("- (none)");
    lines.push("");
    return;
  }

  for (const bucket of groupAmbiguousItems(items)) {
    const marker = classifyLikelyExtractorLimitation(bucket.items[0]);
    const markerSuffix = marker ? ` - likely extractor limitation: ${marker}` : "";
    lines.push(`### ${bucket.source} ${bucket.code} (${bucket.items.length})${markerSuffix}`);
    for (const item of bucket.items) {
      const signature = formatSignature(item.method, item.path);
      const detailSuffix = item.detail ? ` -> ${item.detail}` : "";
      lines.push(
        `- ${formatLocation(item.filePath, item.line, item.column)}${signature}: ${item.message}${detailSuffix}`,
      );
    }
    lines.push("");
  }
}

function groupAmbiguousItems(
  items: readonly EndpointTruthAmbiguousItem[],
): readonly {
  readonly source: EndpointTruthAmbiguousItem["source"];
  readonly code: EndpointTruthAmbiguousItem["code"];
  readonly items: readonly EndpointTruthAmbiguousItem[];
}[] {
  const buckets = new Map<string, EndpointTruthAmbiguousItem[]>();

  for (const item of items) {
    const key = `${item.source}::${item.code}`;
    const existing = buckets.get(key);
    if (existing) {
      existing.push(item);
      continue;
    }
    buckets.set(key, [item]);
  }

  return [...buckets.entries()]
    .sort((left, right) => compareText(left[0], right[0]))
    .map(([key, bucketItems]) => {
      const [source, code] = key.split("::") as [
        EndpointTruthAmbiguousItem["source"],
        EndpointTruthAmbiguousItem["code"],
      ];
      return {
        source,
        code,
        items: bucketItems,
      };
    });
}

function classifyLikelyExtractorLimitation(item: EndpointTruthAmbiguousItem): string | null {
  if (item.source === "backend" && item.code === "PARTIAL_ENDPOINT") {
    return "partially recognized backend route shape";
  }
  if (item.source === "backend" && item.code === "SKIPPED_DYNAMIC_ENDPOINT") {
    return "dynamic backend route path or mount";
  }
  if (item.source === "consumer" && item.code === "PARTIAL_API_CALLSITE") {
    return "parameterized or alias-backed consumer path";
  }
  if (item.source === "consumer" && item.code === "SKIPPED_DYNAMIC_API_CALLSITE") {
    return "dynamic consumer URL";
  }
  return null;
}

function formatEndpointDetail(endpoint: {
  readonly path: string;
  readonly filePath: string;
  readonly line: number;
  readonly column: number;
  readonly handlerName?: string;
}): string {
  const handlerSuffix = endpoint.handlerName ? ` -> ${endpoint.handlerName}` : "";
  return `${endpoint.path} (${formatLocation(endpoint.filePath, endpoint.line, endpoint.column)})${handlerSuffix}`;
}

function formatCallsiteDetail(callsite: {
  readonly path: string;
  readonly filePath: string;
  readonly line: number;
  readonly column: number;
  readonly enclosingSymbol?: string;
}): string {
  const enclosingSuffix = callsite.enclosingSymbol ? ` -> ${callsite.enclosingSymbol}` : "";
  return `${callsite.path} (${formatLocation(callsite.filePath, callsite.line, callsite.column)})${enclosingSuffix}`;
}

function formatLocation(filePath: string, line: number, column: number): string {
  return `${filePath}:${line}:${column}`;
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

function compareText(left: string, right: string): number {
  if (left < right) {
    return -1;
  }
  if (left > right) {
    return 1;
  }
  return 0;
}

try {
  runEndpointTruthReport();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Endpoint truth report failed: ${message}`);
  process.exitCode = 1;
}
