import * as ts from "typescript";
import type { ExtractedSymbol } from "./symbol-extractor";

const HTTP_METHODS = {
  delete: "DELETE",
  get: "GET",
  head: "HEAD",
  options: "OPTIONS",
  patch: "PATCH",
  post: "POST",
  put: "PUT",
} as const;

type SupportedHttpMethod = (typeof HTTP_METHODS)[keyof typeof HTTP_METHODS];

export interface ExtractedEndpoint {
  readonly method: SupportedHttpMethod;
  readonly path: string;
  readonly filePath: string;
  readonly line: number;
  readonly column: number;
  readonly handlerName?: string;
}

export interface EndpointDiagnostic {
  readonly code: "RECOGNIZED_ENDPOINT" | "PARTIAL_ENDPOINT" | "SKIPPED_DYNAMIC_ENDPOINT";
  readonly message: string;
  readonly filePath: string;
  readonly line: number;
  readonly column: number;
  readonly method?: SupportedHttpMethod;
  readonly path?: string;
  readonly handlerName?: string;
}

export interface EndpointExtractionFile {
  readonly filePath: string;
  readonly sourceFile: ts.SourceFile;
  readonly symbols: readonly ExtractedSymbol[];
}

export interface EndpointExtractionResult {
  readonly endpoints: readonly ExtractedEndpoint[];
  readonly diagnostics: readonly EndpointDiagnostic[];
}

/**
 * Extract a deterministic inventory of statically obvious backend routes.
 */
export function extractEndpoints(files: readonly EndpointExtractionFile[]): EndpointExtractionResult {
  const endpoints: ExtractedEndpoint[] = [];
  const diagnostics: EndpointDiagnostic[] = [];
  const sortedFiles = [...files].sort(compareExtractionFiles);

  for (const file of sortedFiles) {
    const symbolByDeclaration = buildSymbolByDeclaration(file.symbols);

    const visit = (node: ts.Node, enclosingSymbol: ExtractedSymbol | null): void => {
      let currentSymbol = enclosingSymbol;
      const declarationSymbol = symbolByDeclaration.get(node);
      if (declarationSymbol) {
        currentSymbol = declarationSymbol;
      }

      if (ts.isCallExpression(node)) {
        const extracted = extractEndpointCall(node, file.filePath, file.sourceFile, currentSymbol);
        if (extracted.endpoint) {
          endpoints.push(extracted.endpoint);
        }
        if (extracted.diagnostic) {
          diagnostics.push(extracted.diagnostic);
        }
      }

      ts.forEachChild(node, (childNode) => visit(childNode, currentSymbol));
    };

    visit(file.sourceFile, null);
  }

  endpoints.sort(compareEndpoints);
  diagnostics.sort(compareDiagnostics);

  return {
    endpoints,
    diagnostics,
  };
}

function extractEndpointCall(
  callExpression: ts.CallExpression,
  filePath: string,
  sourceFile: ts.SourceFile,
  enclosingSymbol: ExtractedSymbol | null,
): { readonly endpoint: ExtractedEndpoint | null; readonly diagnostic: EndpointDiagnostic | null } {
  if (!ts.isPropertyAccessExpression(callExpression.expression)) {
    return { endpoint: null, diagnostic: null };
  }

  if (!ts.isIdentifier(callExpression.expression.expression)) {
    return { endpoint: null, diagnostic: null };
  }

  const receiverName = callExpression.expression.expression.text;
  const methodName = callExpression.expression.name.text;
  if (!isSupportedRouteReceiver(receiverName) || !isSupportedHttpMethod(methodName)) {
    return { endpoint: null, diagnostic: null };
  }

  const location = sourceFile.getLineAndCharacterOfPosition(
    callExpression.expression.name.getStart(sourceFile),
  );
  const line = location.line + 1;
  const column = location.character + 1;
  const method = HTTP_METHODS[methodName];

  const routePath = readStaticRoutePath(callExpression.arguments[0]);
  if (!routePath) {
    return {
      endpoint: null,
      diagnostic: {
        code: "SKIPPED_DYNAMIC_ENDPOINT",
        message: `Skipped ${method} route with non-static path.`,
        filePath,
        line,
        column,
        method,
      },
    };
  }

  const handler = readHandlerName(callExpression.arguments[callExpression.arguments.length - 1], enclosingSymbol);
  if (!handler) {
    return {
      endpoint: {
        method,
        path: routePath,
        filePath,
        line,
        column,
      },
      diagnostic: {
        code: "PARTIAL_ENDPOINT",
        message: `Recognized ${method} ${routePath}, but handler name is not statically clear.`,
        filePath,
        line,
        column,
        method,
        path: routePath,
      },
    };
  }

  return {
    endpoint: {
      method,
      path: routePath,
      filePath,
      line,
      column,
      handlerName: handler,
    },
    diagnostic: {
      code: "RECOGNIZED_ENDPOINT",
      message: `Recognized ${method} ${routePath}.`,
      filePath,
      line,
      column,
      method,
      path: routePath,
      handlerName: handler,
    },
  };
}

function buildSymbolByDeclaration(
  symbols: readonly ExtractedSymbol[],
): ReadonlyMap<ts.Node, ExtractedSymbol> {
  const symbolByDeclaration = new Map<ts.Node, ExtractedSymbol>();
  for (const symbol of symbols) {
    symbolByDeclaration.set(symbol.declaration, symbol);
  }
  return symbolByDeclaration;
}

function isSupportedRouteReceiver(receiverName: string): boolean {
  return receiverName === "app" || receiverName === "router";
}

function isSupportedHttpMethod(methodName: string): methodName is keyof typeof HTTP_METHODS {
  return Object.prototype.hasOwnProperty.call(HTTP_METHODS, methodName);
}

function readStaticRoutePath(argument: ts.Expression | undefined): string | null {
  if (!argument) {
    return null;
  }

  if (ts.isStringLiteralLike(argument)) {
    return normalizeRoutePath(argument.text);
  }

  if (ts.isNoSubstitutionTemplateLiteral(argument)) {
    return normalizeRoutePath(argument.text);
  }

  return null;
}

function normalizeRoutePath(pathText: string): string | null {
  const trimmed = pathText.trim();
  if (trimmed.length === 0) {
    return null;
  }

  const ensuredLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  const collapsed = ensuredLeadingSlash.replace(/\/+/g, "/");
  if (collapsed === "/") {
    return collapsed;
  }

  return collapsed.endsWith("/") ? collapsed.slice(0, -1) : collapsed;
}

function readHandlerName(
  argument: ts.Expression | undefined,
  enclosingSymbol: ExtractedSymbol | null,
): string | null {
  if (!argument) {
    return null;
  }

  if (ts.isIdentifier(argument)) {
    return argument.text;
  }

  if (ts.isPropertyAccessExpression(argument)) {
    return argument.getText();
  }

  if (ts.isArrowFunction(argument) || ts.isFunctionExpression(argument)) {
    return enclosingSymbol ? `<inline:${enclosingSymbol.name}>` : "<inline-handler>";
  }

  return null;
}

function compareExtractionFiles(left: EndpointExtractionFile, right: EndpointExtractionFile): number {
  return compareText(left.filePath, right.filePath);
}

function compareEndpoints(left: ExtractedEndpoint, right: ExtractedEndpoint): number {
  return (
    compareText(left.filePath, right.filePath)
    || compareNumber(left.line, right.line)
    || compareNumber(left.column, right.column)
    || compareText(left.method, right.method)
    || compareText(left.path, right.path)
    || compareText(left.handlerName ?? "", right.handlerName ?? "")
  );
}

function compareDiagnostics(left: EndpointDiagnostic, right: EndpointDiagnostic): number {
  return (
    compareText(left.filePath, right.filePath)
    || compareNumber(left.line, right.line)
    || compareNumber(left.column, right.column)
    || compareText(left.code, right.code)
    || compareText(left.method ?? "", right.method ?? "")
    || compareText(left.path ?? "", right.path ?? "")
    || compareText(left.handlerName ?? "", right.handlerName ?? "")
    || compareText(left.message, right.message)
  );
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
