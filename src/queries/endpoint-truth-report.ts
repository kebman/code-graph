import type {
  ApiCallsiteDiagnostic,
  ApiCallsiteExtractionResult,
  ExtractedApiCallsite,
} from "../indexer/api-callsite-extractor";
import type {
  EndpointDiagnostic,
  EndpointExtractionResult,
  ExtractedEndpoint,
} from "../indexer/endpoint-extractor";

type HttpMethod = ExtractedEndpoint["method"];

export interface EndpointTruthReportInput {
  readonly endpoints: EndpointExtractionResult;
  readonly apiCallsites: ApiCallsiteExtractionResult;
}

export interface MatchedEndpointTruthGroup {
  readonly method: HttpMethod;
  readonly path: string;
  readonly endpoints: readonly ExtractedEndpoint[];
  readonly callsites: readonly ExtractedComparableApiCallsite[];
}

export interface BackendOnlyEndpointTruthGroup {
  readonly method: HttpMethod;
  readonly path: string;
  readonly endpoints: readonly ExtractedEndpoint[];
}

export interface ConsumerOnlyEndpointTruthGroup {
  readonly method: HttpMethod;
  readonly path: string;
  readonly callsites: readonly ExtractedComparableApiCallsite[];
}

export interface EndpointTruthAmbiguousItem {
  readonly source: "backend" | "consumer";
  readonly code:
    | EndpointDiagnostic["code"]
    | ApiCallsiteDiagnostic["code"];
  readonly message: string;
  readonly filePath: string;
  readonly line: number;
  readonly column: number;
  readonly method?: HttpMethod;
  readonly path?: string;
  readonly detail?: string;
}

export interface EndpointTruthDiagnosticsSummary {
  readonly endpointRecognized: number;
  readonly endpointPartial: number;
  readonly endpointSkippedDynamic: number;
  readonly callsiteRecognized: number;
  readonly callsitePartial: number;
  readonly callsiteSkippedDynamic: number;
}

export interface EndpointTruthReport {
  readonly matched: readonly MatchedEndpointTruthGroup[];
  readonly backendOnly: readonly BackendOnlyEndpointTruthGroup[];
  readonly consumerOnly: readonly ConsumerOnlyEndpointTruthGroup[];
  readonly ambiguous: readonly EndpointTruthAmbiguousItem[];
  readonly diagnostics: EndpointTruthDiagnosticsSummary;
}

export interface ExtractedComparableApiCallsite extends ExtractedApiCallsite {
  readonly method: HttpMethod;
}

interface Signature {
  readonly method: HttpMethod;
  readonly path: string;
  readonly key: string;
}

/**
 * Build a deterministic truth report by comparing normalized backend endpoint and consumer callsite signatures.
 */
export function buildEndpointTruthReport(
  input: EndpointTruthReportInput,
): EndpointTruthReport {
  const comparableEndpoints = [...input.endpoints.endpoints].sort(compareEndpoints);
  const comparableCallsites = input.apiCallsites.callsites
    .flatMap(normalizeComparableCallsite)
    .sort(compareComparableCallsites);

  const endpointsBySignature = groupEndpointsBySignature(comparableEndpoints);
  const callsitesBySignature = groupCallsitesBySignature(comparableCallsites);
  const signatures = [...collectSignatureKeys(endpointsBySignature, callsitesBySignature)].sort(
    compareSignatureKeys,
  );

  const matched: MatchedEndpointTruthGroup[] = [];
  const backendOnly: BackendOnlyEndpointTruthGroup[] = [];
  const consumerOnly: ConsumerOnlyEndpointTruthGroup[] = [];

  for (const signatureKey of signatures) {
    const endpoints = endpointsBySignature.get(signatureKey) ?? [];
    const callsites = callsitesBySignature.get(signatureKey) ?? [];
    const signature = parseSignatureKey(signatureKey);

    if (endpoints.length > 0 && callsites.length > 0) {
      matched.push({
        method: signature.method,
        path: signature.path,
        endpoints,
        callsites,
      });
      continue;
    }

    if (endpoints.length > 0) {
      backendOnly.push({
        method: signature.method,
        path: signature.path,
        endpoints,
      });
      continue;
    }

    if (callsites.length > 0) {
      consumerOnly.push({
        method: signature.method,
        path: signature.path,
        callsites,
      });
    }
  }

  const ambiguous = collectAmbiguousItems(input).sort(compareAmbiguousItems);

  return {
    matched,
    backendOnly,
    consumerOnly,
    ambiguous,
    diagnostics: summarizeDiagnostics(input),
  };
}

function groupEndpointsBySignature(
  endpoints: readonly ExtractedEndpoint[],
): ReadonlyMap<string, ExtractedEndpoint[]> {
  const grouped = new Map<string, ExtractedEndpoint[]>();
  for (const endpoint of endpoints) {
    const signature = makeSignature(endpoint.method, endpoint.path);
    const existing = grouped.get(signature.key);
    if (existing) {
      existing.push(endpoint);
      continue;
    }

    grouped.set(signature.key, [endpoint]);
  }

  return grouped;
}

function groupCallsitesBySignature(
  callsites: readonly ExtractedComparableApiCallsite[],
): ReadonlyMap<string, ExtractedComparableApiCallsite[]> {
  const grouped = new Map<string, ExtractedComparableApiCallsite[]>();
  for (const callsite of callsites) {
    const signature = makeSignature(callsite.method, callsite.path);
    const existing = grouped.get(signature.key);
    if (existing) {
      existing.push(callsite);
      continue;
    }

    grouped.set(signature.key, [callsite]);
  }

  return grouped;
}

function collectSignatureKeys(
  endpointsBySignature: ReadonlyMap<string, readonly ExtractedEndpoint[]>,
  callsitesBySignature: ReadonlyMap<string, readonly ExtractedComparableApiCallsite[]>,
): ReadonlySet<string> {
  const keys = new Set<string>();
  for (const key of endpointsBySignature.keys()) {
    keys.add(key);
  }
  for (const key of callsitesBySignature.keys()) {
    keys.add(key);
  }
  return keys;
}

function normalizeComparableCallsite(
  callsite: ExtractedApiCallsite,
): readonly ExtractedComparableApiCallsite[] {
  if (!callsite.method) {
    return [];
  }

  const normalizedPath = normalizeComparablePath(callsite.path);
  if (!normalizedPath) {
    return [];
  }

  return [
    {
      ...callsite,
      method: callsite.method,
      path: normalizedPath,
    },
  ];
}

function collectAmbiguousItems(input: EndpointTruthReportInput): EndpointTruthAmbiguousItem[] {
  const ambiguous: EndpointTruthAmbiguousItem[] = [];

  for (const diagnostic of input.endpoints.diagnostics) {
    if (diagnostic.code === "RECOGNIZED_ENDPOINT") {
      continue;
    }

    ambiguous.push({
      source: "backend",
      code: diagnostic.code,
      message: diagnostic.message,
      filePath: diagnostic.filePath,
      line: diagnostic.line,
      column: diagnostic.column,
      method: diagnostic.method,
      path: normalizeComparablePath(diagnostic.path),
      detail: diagnostic.handlerName,
    });
  }

  for (const diagnostic of input.apiCallsites.diagnostics) {
    if (diagnostic.code === "RECOGNIZED_API_CALLSITE") {
      continue;
    }

    ambiguous.push({
      source: "consumer",
      code: diagnostic.code,
      message: diagnostic.message,
      filePath: diagnostic.filePath,
      line: diagnostic.line,
      column: diagnostic.column,
      method: diagnostic.method,
      path: normalizeComparablePath(diagnostic.path),
      detail: diagnostic.enclosingSymbol,
    });
  }

  return ambiguous;
}

function summarizeDiagnostics(input: EndpointTruthReportInput): EndpointTruthDiagnosticsSummary {
  let endpointRecognized = 0;
  let endpointPartial = 0;
  let endpointSkippedDynamic = 0;
  let callsiteRecognized = 0;
  let callsitePartial = 0;
  let callsiteSkippedDynamic = 0;

  for (const diagnostic of input.endpoints.diagnostics) {
    switch (diagnostic.code) {
      case "RECOGNIZED_ENDPOINT":
        endpointRecognized += 1;
        break;
      case "PARTIAL_ENDPOINT":
        endpointPartial += 1;
        break;
      case "SKIPPED_DYNAMIC_ENDPOINT":
        endpointSkippedDynamic += 1;
        break;
    }
  }

  for (const diagnostic of input.apiCallsites.diagnostics) {
    switch (diagnostic.code) {
      case "RECOGNIZED_API_CALLSITE":
        callsiteRecognized += 1;
        break;
      case "PARTIAL_API_CALLSITE":
        callsitePartial += 1;
        break;
      case "SKIPPED_DYNAMIC_API_CALLSITE":
        callsiteSkippedDynamic += 1;
        break;
    }
  }

  return {
    endpointRecognized,
    endpointPartial,
    endpointSkippedDynamic,
    callsiteRecognized,
    callsitePartial,
    callsiteSkippedDynamic,
  };
}

function makeSignature(method: HttpMethod, path: string): Signature {
  const normalizedPath = normalizeComparisonPath(path);
  if (!normalizedPath) {
    throw new Error(`Invalid comparable path '${path}'.`);
  }

  return {
    method,
    path: normalizedPath,
    key: `${method} ${normalizedPath}`,
  };
}

function parseSignatureKey(signatureKey: string): { readonly method: HttpMethod; readonly path: string } {
  const separatorIndex = signatureKey.indexOf(" ");
  if (separatorIndex <= 0) {
    throw new Error(`Invalid endpoint truth signature '${signatureKey}'.`);
  }

  const method = signatureKey.slice(0, separatorIndex) as HttpMethod;
  const path = signatureKey.slice(separatorIndex + 1);
  return { method, path };
}

export function normalizeComparisonPath(pathValue: string | undefined): string | undefined {
  const normalizedPath = normalizeComparablePath(pathValue);
  if (!normalizedPath) {
    return undefined;
  }

  if (normalizedPath === "/") {
    return normalizedPath;
  }

  const normalizedSegments = normalizedPath
    .split("/")
    .map((segment) => (isParameterizedSegment(segment) ? "{param}" : segment));
  return normalizedSegments.join("/");
}

function normalizeComparablePath(pathValue: string | undefined): string | undefined {
  if (!pathValue) {
    return undefined;
  }

  const trimmed = pathValue.trim();
  if (trimmed.length === 0) {
    return undefined;
  }

  const ensuredLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  const collapsed = ensuredLeadingSlash.replace(/\/+/g, "/");
  if (collapsed === "/") {
    return collapsed;
  }

  return collapsed.endsWith("/") ? collapsed.slice(0, -1) : collapsed;
}

function isParameterizedSegment(segment: string): boolean {
  return /^:[A-Za-z0-9_]+$/.test(segment) || /^\{[^/{}]+\}$/.test(segment);
}

function compareEndpoints(left: ExtractedEndpoint, right: ExtractedEndpoint): number {
  return (
    compareText(left.method, right.method)
    || compareText(left.path, right.path)
    || compareText(left.filePath, right.filePath)
    || compareNumber(left.line, right.line)
    || compareNumber(left.column, right.column)
    || compareText(left.handlerName ?? "", right.handlerName ?? "")
  );
}

function compareComparableCallsites(
  left: ExtractedComparableApiCallsite,
  right: ExtractedComparableApiCallsite,
): number {
  return (
    compareText(left.method, right.method)
    || compareText(left.path, right.path)
    || compareText(left.filePath, right.filePath)
    || compareNumber(left.line, right.line)
    || compareNumber(left.column, right.column)
    || compareText(left.enclosingSymbol ?? "", right.enclosingSymbol ?? "")
  );
}

function compareAmbiguousItems(
  left: EndpointTruthAmbiguousItem,
  right: EndpointTruthAmbiguousItem,
): number {
  return (
    compareText(left.source, right.source)
    || compareText(left.filePath, right.filePath)
    || compareNumber(left.line, right.line)
    || compareNumber(left.column, right.column)
    || compareText(left.code, right.code)
    || compareText(left.method ?? "", right.method ?? "")
    || compareText(left.path ?? "", right.path ?? "")
    || compareText(left.detail ?? "", right.detail ?? "")
    || compareText(left.message, right.message)
  );
}

function compareSignatureKeys(left: string, right: string): number {
  const leftSignature = parseSignatureKey(left);
  const rightSignature = parseSignatureKey(right);
  return compareSignatures(leftSignature, rightSignature);
}

function compareSignatures(
  left: { readonly method: string; readonly path: string },
  right: { readonly method: string; readonly path: string },
): number {
  return compareText(left.method, right.method) || compareText(left.path, right.path);
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

function compareNumber(left: number, right: number): number {
  return left - right;
}
