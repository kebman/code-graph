import assert from "node:assert/strict";
import * as ts from "typescript";
import { makeFileNodeId } from "../src/graph/ids";
import { extractApiCallsites } from "../src/indexer/api-callsite-extractor";
import { extractEndpoints } from "../src/indexer/endpoint-extractor";
import { extractSymbols } from "../src/indexer/symbol-extractor";
import { buildEndpointTruthReport } from "../src/queries/endpoint-truth-report";
import { renderProjectEndpointReport } from "../src/queries/run-endpoint-truth-report";
import {
  PROJECT_BACKEND_FIXTURE_FILES,
  PROJECT_CONSUMER_FIXTURE_FILES,
  type VirtualFixtureFile,
} from "./fixtures/project-endpoint-truth-fixture";

interface IndexedFixtureFile {
  readonly filePath: string;
  readonly sourceFile: ts.SourceFile;
  readonly symbols: ReturnType<typeof extractSymbols>;
}

run();

function run(): void {
  testDeterministicOutputOrdering();
  testSupportedProjectRouteExtraction();
  testSupportedProjectConsumerExtraction();
  testStableTruthReportGroupingAndRendering();
  console.log("Regression tests passed: 4");
}

function testDeterministicOutputOrdering(): void {
  const forwardFiles = indexFixtureFiles([
    ...PROJECT_BACKEND_FIXTURE_FILES,
    ...PROJECT_CONSUMER_FIXTURE_FILES,
  ]);
  const reverseFiles = indexFixtureFiles([
    ...PROJECT_CONSUMER_FIXTURE_FILES,
    ...PROJECT_BACKEND_FIXTURE_FILES,
  ]);

  const forwardEndpoints = extractEndpoints(forwardFiles);
  const reverseEndpoints = extractEndpoints(reverseFiles);
  const forwardCallsites = extractApiCallsites(forwardFiles);
  const reverseCallsites = extractApiCallsites(reverseFiles);
  const forwardReport = buildEndpointTruthReport({
    endpoints: forwardEndpoints,
    apiCallsites: forwardCallsites,
  });
  const reverseReport = buildEndpointTruthReport({
    endpoints: reverseEndpoints,
    apiCallsites: reverseCallsites,
  });
  const forwardRendered = renderProjectEndpointReport({
    rootDir: "/virtual/project",
    filesIndexed: forwardFiles.length,
    backendEndpoints: forwardEndpoints.endpoints.length,
    apiCallsites: forwardCallsites.callsites.length,
    report: forwardReport,
  });
  const reverseRendered = renderProjectEndpointReport({
    rootDir: "/virtual/project",
    filesIndexed: reverseFiles.length,
    backendEndpoints: reverseEndpoints.endpoints.length,
    apiCallsites: reverseCallsites.callsites.length,
    report: reverseReport,
  });

  assert.deepEqual(
    simplifyEndpoints(forwardEndpoints.endpoints),
    simplifyEndpoints(reverseEndpoints.endpoints),
  );
  assert.deepEqual(
    simplifyCallsites(forwardCallsites.callsites),
    simplifyCallsites(reverseCallsites.callsites),
  );
  assert.deepEqual(
    simplifyTruthReport(forwardReport),
    simplifyTruthReport(reverseReport),
  );
  assert.equal(forwardRendered, reverseRendered);
}

function testSupportedProjectRouteExtraction(): void {
  const files = indexFixtureFiles(PROJECT_BACKEND_FIXTURE_FILES);
  const result = extractEndpoints(files);

  assert.deepEqual(
    simplifyEndpoints(result.endpoints),
    [
      {
        method: "POST",
        path: "/api/orders/admin/reconcile",
        filePath: "src/routes/orderRoutes.ts",
        line: 9,
        handlerName: "reconcileOrders",
      },
      {
        method: "GET",
        path: "/api/orders/:id",
        filePath: "src/routes/orderRoutes.ts",
        line: 12,
        handlerName: "getOrder",
      },
      {
        method: "POST",
        path: "/api/orders/:id/refund",
        filePath: "src/routes/orderRoutes.ts",
        line: 13,
        handlerName: "refundOrder",
      },
    ],
  );

  assert.equal(
    result.diagnostics.filter((diagnostic) => diagnostic.code === "RECOGNIZED_ENDPOINT").length,
    3,
  );
  assert.equal(
    result.diagnostics.filter((diagnostic) => diagnostic.code !== "RECOGNIZED_ENDPOINT").length,
    0,
  );
}

function testSupportedProjectConsumerExtraction(): void {
  const files = indexFixtureFiles(PROJECT_CONSUMER_FIXTURE_FILES);
  const result = extractApiCallsites(files);

  assert.deepEqual(
    simplifyCallsites(result.callsites),
    [
      {
        method: "POST",
        path: "/api/orders",
        filePath: "src/e2e/orders.e2e.test.ts",
        line: 12,
      },
      {
        method: "GET",
        path: "/api/orders/{param}",
        filePath: "src/e2e/orders.e2e.test.ts",
        line: 13,
      },
      {
        method: "POST",
        path: "/api/orders/{param}/refund",
        filePath: "src/e2e/orders.e2e.test.ts",
        line: 14,
      },
      {
        method: "GET",
        path: "/api/missing",
        filePath: "src/e2e/orders.e2e.test.ts",
        line: 15,
      },
    ],
  );

  assert.deepEqual(
    simplifyApiDiagnostics(result.diagnostics),
    [
      {
        code: "RECOGNIZED_API_CALLSITE",
        path: "/api/orders",
        line: 12,
      },
      {
        code: "PARTIAL_API_CALLSITE",
        path: "/api/orders/{param}",
        line: 13,
      },
      {
        code: "PARTIAL_API_CALLSITE",
        path: "/api/orders/{param}/refund",
        line: 14,
      },
      {
        code: "RECOGNIZED_API_CALLSITE",
        path: "/api/missing",
        line: 15,
      },
      {
        code: "SKIPPED_DYNAMIC_API_CALLSITE",
        path: undefined,
        line: 16,
      },
    ],
  );
}

function testStableTruthReportGroupingAndRendering(): void {
  const files = indexFixtureFiles([
    ...PROJECT_BACKEND_FIXTURE_FILES,
    ...PROJECT_CONSUMER_FIXTURE_FILES,
  ]);
  const endpoints = extractEndpoints(files);
  const apiCallsites = extractApiCallsites(files);
  const report = buildEndpointTruthReport({ endpoints, apiCallsites });
  const rendered = renderProjectEndpointReport({
    rootDir: "/virtual/project",
    filesIndexed: files.length,
    backendEndpoints: endpoints.endpoints.length,
    apiCallsites: apiCallsites.callsites.length,
    report,
  });

  assert.deepEqual(
    report.matched.map((group) => `${group.method} ${group.path}`),
    ["GET /api/orders/{param}", "POST /api/orders/{param}/refund"],
  );
  assert.deepEqual(
    report.backendOnly.map((group) => `${group.method} ${group.path}`),
    ["POST /api/orders/admin/reconcile"],
  );
  assert.deepEqual(
    report.consumerOnly.map((group) => `${group.method} ${group.path}`),
    ["GET /api/missing", "POST /api/orders"],
  );
  assert.deepEqual(
    report.ambiguous.map((item) => `${item.source}:${item.code}:${item.path ?? ""}`),
    [
      "consumer:PARTIAL_API_CALLSITE:/api/orders/{param}",
      "consumer:PARTIAL_API_CALLSITE:/api/orders/{param}/refund",
      "consumer:SKIPPED_DYNAMIC_API_CALLSITE:",
    ],
  );

  assertSectionOrder(rendered, [
    "## Summary",
    "## Diagnostics Summary",
    "## Ambiguous / Unresolved By Type",
    "## Matched (2 signatures)",
    "## Backend-only (1 signatures)",
    "## Consumer-only (2 signatures)",
    "## Ambiguous / Unresolved (3 items)",
  ]);
  assert.match(rendered, /- \/api\/orders\/:id \(src\/routes\/orderRoutes\.ts:12:14\) -> getOrder/);
  assert.match(rendered, /- \/api\/orders\/\{param\}\/refund \(src\/e2e\/orders\.e2e\.test\.ts:14:22\)/);
  assert.match(
    rendered,
    /consumer PARTIAL_API_CALLSITE: 2 - likely extractor limitation: parameterized or alias-backed consumer path/,
  );
}

function indexFixtureFiles(files: readonly VirtualFixtureFile[]): IndexedFixtureFile[] {
  return files.map((file) => {
    const sourceFile = ts.createSourceFile(file.filePath, file.sourceText, ts.ScriptTarget.Latest, true);
    const fileId = makeFileNodeId(file.filePath);
    const symbols = extractSymbols({
      sourceFile,
      filePath: file.filePath,
      fileId,
    });

    return {
      filePath: file.filePath,
      sourceFile,
      symbols,
    };
  });
}

function simplifyEndpoints(
  endpoints: readonly {
    readonly method: string;
    readonly path: string;
    readonly filePath: string;
    readonly line: number;
    readonly handlerName?: string;
  }[],
): readonly object[] {
  return endpoints.map((endpoint) => ({
    method: endpoint.method,
    path: endpoint.path,
    filePath: endpoint.filePath,
    line: endpoint.line,
    handlerName: endpoint.handlerName,
  }));
}

function simplifyCallsites(
  callsites: readonly {
    readonly method?: string;
    readonly path: string;
    readonly filePath: string;
    readonly line: number;
  }[],
): readonly object[] {
  return callsites.map((callsite) => ({
    method: callsite.method,
    path: callsite.path,
    filePath: callsite.filePath,
    line: callsite.line,
  }));
}

function simplifyApiDiagnostics(
  diagnostics: readonly {
    readonly code: string;
    readonly path?: string;
    readonly line: number;
  }[],
): readonly object[] {
  return diagnostics.map((diagnostic) => ({
    code: diagnostic.code,
    path: diagnostic.path,
    line: diagnostic.line,
  }));
}

function simplifyTruthReport(report: ReturnType<typeof buildEndpointTruthReport>): object {
  return {
    matched: report.matched.map((group) => ({
      method: group.method,
      path: group.path,
      endpoints: simplifyEndpoints(group.endpoints),
      callsites: simplifyCallsites(group.callsites),
    })),
    backendOnly: report.backendOnly.map((group) => ({
      method: group.method,
      path: group.path,
      endpoints: simplifyEndpoints(group.endpoints),
    })),
    consumerOnly: report.consumerOnly.map((group) => ({
      method: group.method,
      path: group.path,
      callsites: simplifyCallsites(group.callsites),
    })),
    ambiguous: report.ambiguous.map((item) => ({
      source: item.source,
      code: item.code,
      path: item.path,
      filePath: item.filePath,
      line: item.line,
    })),
    diagnostics: report.diagnostics,
  };
}

function assertSectionOrder(markdown: string, headings: readonly string[]): void {
  let previousIndex = -1;

  for (const heading of headings) {
    const index = markdown.indexOf(heading);
    assert.notEqual(index, -1, `Missing heading: ${heading}`);
    assert.ok(index > previousIndex, `Heading out of order: ${heading}`);
    previousIndex = index;
  }
}
