import * as path from "node:path";
import * as ts from "typescript";
import { normalizePath } from "../graph/normalize";
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

interface ExtractedLeafEndpoint {
  readonly receiverName: string;
  readonly method: SupportedHttpMethod;
  readonly leafPath: string;
  readonly filePath: string;
  readonly line: number;
  readonly column: number;
  readonly handlerName?: string;
}

interface RouterRef {
  readonly filePath: string;
  readonly routerName: string;
}

interface MountEdge {
  readonly source: RouterRef;
  readonly target: RouterRef;
  readonly prefix: string;
}

interface MountImportBindingDefault {
  readonly type: "default";
  readonly targetFilePath: string;
}

interface MountImportBindingNamed {
  readonly type: "named";
  readonly targetFilePath: string;
  readonly importedName: string;
}

type MountImportBinding = MountImportBindingDefault | MountImportBindingNamed;

interface RouterInfo {
  readonly filePath: string;
  readonly routerNames: ReadonlySet<string>;
  readonly defaultExportedRouterName?: string;
  readonly exportedRouterNames: ReadonlySet<string>;
  readonly importBindings: ReadonlyMap<string, MountImportBinding>;
}

export interface ExtractedEndpoint {
  readonly method: SupportedHttpMethod;
  readonly path: string;
  readonly filePath: string;
  readonly line: number;
  readonly column: number;
  readonly handlerName?: string;
}

export interface EndpointDiagnostic {
  readonly code:
    | "RECOGNIZED_ENDPOINT"
    | "PARTIAL_ENDPOINT"
    | "SKIPPED_DYNAMIC_ENDPOINT"
    | "SKIPPED_DYNAMIC_MOUNT_PREFIX"
    | "UNRESOLVED_MOUNT_TARGET";
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
  const diagnostics: EndpointDiagnostic[] = [];
  const sortedFiles = [...files].sort(compareExtractionFiles);
  const filePathSet = new Set(sortedFiles.map((file) => file.filePath));
  const routerInfoByFilePath = buildRouterInfos(sortedFiles, filePathSet);
  const leafEndpoints: ExtractedLeafEndpoint[] = [];
  const mountEdges: MountEdge[] = [];

  for (const file of sortedFiles) {
    const routerInfo = routerInfoByFilePath.get(file.filePath);
    if (!routerInfo) {
      continue;
    }

    const symbolByDeclaration = buildSymbolByDeclaration(file.symbols);

    const visit = (node: ts.Node, enclosingSymbol: ExtractedSymbol | null): void => {
      let currentSymbol = enclosingSymbol;
      const declarationSymbol = symbolByDeclaration.get(node);
      if (declarationSymbol) {
        currentSymbol = declarationSymbol;
      }

      if (ts.isCallExpression(node)) {
        const extractedMount = extractMountEdge(
          node,
          file,
          routerInfo,
          routerInfoByFilePath,
        );
        if (extractedMount.edge) {
          mountEdges.push(extractedMount.edge);
        }
        if (extractedMount.diagnostic) {
          diagnostics.push(extractedMount.diagnostic);
        }

        const extractedLeaf = extractLeafEndpointCall(
          node,
          file.filePath,
          file.sourceFile,
          currentSymbol,
          routerInfo.routerNames,
        );
        if (extractedLeaf.leafEndpoint) {
          leafEndpoints.push(extractedLeaf.leafEndpoint);
        }
        if (extractedLeaf.diagnostic) {
          diagnostics.push(extractedLeaf.diagnostic);
        }
      }

      ts.forEachChild(node, (childNode) => visit(childNode, currentSymbol));
    };

    visit(file.sourceFile, null);
  }

  const prefixesByRouterRef = buildEffectivePrefixesByRouterRef(routerInfoByFilePath, mountEdges);
  const endpoints = composeEffectiveEndpoints(leafEndpoints, prefixesByRouterRef);
  diagnostics.push(...buildEndpointDiagnostics(endpoints));

  endpoints.sort(compareEndpoints);
  diagnostics.sort(compareDiagnostics);

  return {
    endpoints,
    diagnostics,
  };
}

function buildRouterInfos(
  files: readonly EndpointExtractionFile[],
  filePathSet: ReadonlySet<string>,
): ReadonlyMap<string, RouterInfo> {
  const infos = new Map<string, RouterInfo>();

  for (const file of files) {
    const routerNames = collectRouterNames(file.sourceFile);
    const exportedRouterNames = collectExportedRouterNames(file.sourceFile, routerNames);
    const defaultExportedRouterName = readDefaultExportedRouterName(file.sourceFile, routerNames);
    const importBindings = buildImportBindings(file.filePath, file.sourceFile, filePathSet);

    infos.set(file.filePath, {
      filePath: file.filePath,
      routerNames,
      defaultExportedRouterName,
      exportedRouterNames,
      importBindings,
    });
  }

  return infos;
}

function collectRouterNames(sourceFile: ts.SourceFile): ReadonlySet<string> {
  const routerNames = new Set<string>();

  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) {
      continue;
    }

    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || !declaration.initializer) {
        continue;
      }

      if (isRouterFactoryCall(declaration.initializer)) {
        routerNames.add(declaration.name.text);
      }
    }
  }

  return routerNames;
}

function collectExportedRouterNames(
  sourceFile: ts.SourceFile,
  routerNames: ReadonlySet<string>,
): ReadonlySet<string> {
  const exportedRouterNames = new Set<string>();

  for (const statement of sourceFile.statements) {
    if (ts.isVariableStatement(statement) && hasExportModifier(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name) && routerNames.has(declaration.name.text)) {
          exportedRouterNames.add(declaration.name.text);
        }
      }
      continue;
    }

    if (!ts.isExportDeclaration(statement) || !statement.exportClause) {
      continue;
    }

    if (!ts.isNamedExports(statement.exportClause)) {
      continue;
    }

    for (const specifier of statement.exportClause.elements) {
      const exportedName = specifier.propertyName?.text ?? specifier.name.text;
      if (routerNames.has(exportedName)) {
        exportedRouterNames.add(exportedName);
      }
    }
  }

  return exportedRouterNames;
}

function readDefaultExportedRouterName(
  sourceFile: ts.SourceFile,
  routerNames: ReadonlySet<string>,
): string | undefined {
  for (const statement of sourceFile.statements) {
    if (!ts.isExportAssignment(statement) || statement.isExportEquals) {
      continue;
    }

    if (ts.isIdentifier(statement.expression) && routerNames.has(statement.expression.text)) {
      return statement.expression.text;
    }
  }

  return undefined;
}

function buildImportBindings(
  sourceFilePath: string,
  sourceFile: ts.SourceFile,
  filePathSet: ReadonlySet<string>,
): ReadonlyMap<string, MountImportBinding> {
  const bindings = new Map<string, MountImportBinding>();

  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) {
      continue;
    }

    const moduleSpecifier = readImportModuleSpecifier(statement);
    if (!moduleSpecifier) {
      continue;
    }

    const targetPath = resolveImportTargetPath(sourceFilePath, moduleSpecifier, filePathSet);
    if (!targetPath) {
      continue;
    }

    const clause = statement.importClause;
    if (!clause) {
      continue;
    }

    if (clause.name) {
      bindings.set(clause.name.text, {
        type: "default",
        targetFilePath: targetPath,
      });
    }

    const namedBindings = clause.namedBindings;
    if (!namedBindings || ts.isNamespaceImport(namedBindings)) {
      continue;
    }

    for (const element of namedBindings.elements) {
      const localName = element.name.text;
      const importedName = element.propertyName?.text ?? element.name.text;
      bindings.set(localName, {
        type: "named",
        targetFilePath: targetPath,
        importedName,
      });
    }
  }

  return bindings;
}

function extractMountEdge(
  callExpression: ts.CallExpression,
  file: EndpointExtractionFile,
  routerInfo: RouterInfo,
  routerInfoByFilePath: ReadonlyMap<string, RouterInfo>,
): { readonly edge: MountEdge | null; readonly diagnostic: EndpointDiagnostic | null } {
  if (!ts.isPropertyAccessExpression(callExpression.expression)) {
    return { edge: null, diagnostic: null };
  }

  const receiver = callExpression.expression.expression;
  if (!ts.isIdentifier(receiver) || !routerInfo.routerNames.has(receiver.text)) {
    return { edge: null, diagnostic: null };
  }

  if (callExpression.expression.name.text !== "use" || callExpression.arguments.length < 2) {
    return { edge: null, diagnostic: null };
  }

  const targetArgument = callExpression.arguments[1];
  if (!ts.isIdentifier(targetArgument)) {
    return { edge: null, diagnostic: null };
  }

  const targetResolution = resolveMountTarget(
    file.filePath,
    targetArgument.text,
    routerInfo,
    routerInfoByFilePath,
  );
  if (targetResolution.type === "not_applicable") {
    return { edge: null, diagnostic: null };
  }

  const position = file.sourceFile.getLineAndCharacterOfPosition(targetArgument.getStart(file.sourceFile));
  const line = position.line + 1;
  const column = position.character + 1;
  const prefix = readStaticRoutePath(callExpression.arguments[0]);
  if (!prefix) {
    return {
      edge: null,
      diagnostic: {
        code: "SKIPPED_DYNAMIC_MOUNT_PREFIX",
        message: `Skipped mount prefix for '${targetArgument.text}' because the prefix is not static.`,
        filePath: file.filePath,
        line,
        column,
      },
    };
  }

  if (targetResolution.type === "unresolved") {
    return {
      edge: null,
      diagnostic: {
        code: "UNRESOLVED_MOUNT_TARGET",
        message: targetResolution.message,
        filePath: file.filePath,
        line,
        column,
        path: prefix,
      },
    };
  }

  return {
    edge: {
      source: {
        filePath: file.filePath,
        routerName: receiver.text,
      },
      target: targetResolution.target,
      prefix,
    },
    diagnostic: null,
  };
}

function resolveMountTarget(
  sourceFilePath: string,
  targetName: string,
  routerInfo: RouterInfo,
  routerInfoByFilePath: ReadonlyMap<string, RouterInfo>,
):
  | { readonly type: "resolved"; readonly target: RouterRef }
  | { readonly type: "unresolved"; readonly message: string }
  | { readonly type: "not_applicable" } {
  if (routerInfo.routerNames.has(targetName)) {
    return {
      type: "resolved",
      target: {
        filePath: sourceFilePath,
        routerName: targetName,
      },
    };
  }

  const importBinding = routerInfo.importBindings.get(targetName);
  if (!importBinding) {
    return { type: "not_applicable" };
  }

  const targetRouterInfo = routerInfoByFilePath.get(importBinding.targetFilePath);
  if (!targetRouterInfo) {
    return {
      type: "unresolved",
      message: `Mount target '${targetName}' resolves to unknown file '${importBinding.targetFilePath}'.`,
    };
  }

  const targetRouterName = resolveImportedRouterName(importBinding, targetRouterInfo);
  if (!targetRouterName) {
    return {
      type: "unresolved",
      message: `Mount target '${targetName}' does not resolve to an obvious router export.`,
    };
  }

  return {
    type: "resolved",
    target: {
      filePath: importBinding.targetFilePath,
      routerName: targetRouterName,
    },
  };
}

function resolveImportedRouterName(
  importBinding: MountImportBinding,
  routerInfo: RouterInfo,
): string | null {
  if (importBinding.type === "default") {
    if (routerInfo.defaultExportedRouterName) {
      return routerInfo.defaultExportedRouterName;
    }

    if (routerInfo.routerNames.size === 1) {
      return [...routerInfo.routerNames][0];
    }

    return null;
  }

  if (routerInfo.exportedRouterNames.has(importBinding.importedName)
    && routerInfo.routerNames.has(importBinding.importedName)) {
    return importBinding.importedName;
  }

  if (routerInfo.routerNames.has(importBinding.importedName)) {
    return importBinding.importedName;
  }

  return null;
}

function extractLeafEndpointCall(
  callExpression: ts.CallExpression,
  filePath: string,
  sourceFile: ts.SourceFile,
  enclosingSymbol: ExtractedSymbol | null,
  routerNames: ReadonlySet<string>,
): { readonly leafEndpoint: ExtractedLeafEndpoint | null; readonly diagnostic: EndpointDiagnostic | null } {
  if (!ts.isPropertyAccessExpression(callExpression.expression)) {
    return { leafEndpoint: null, diagnostic: null };
  }

  if (!ts.isIdentifier(callExpression.expression.expression)) {
    return { leafEndpoint: null, diagnostic: null };
  }

  const receiverName = callExpression.expression.expression.text;
  const methodName = callExpression.expression.name.text;
  if (!routerNames.has(receiverName) || !isSupportedHttpMethod(methodName)) {
    return { leafEndpoint: null, diagnostic: null };
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
      leafEndpoint: null,
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

  return {
    leafEndpoint: {
      receiverName,
      method,
      leafPath: routePath,
      filePath,
      line,
      column,
      handlerName: readHandlerName(callExpression.arguments[callExpression.arguments.length - 1], enclosingSymbol) ?? undefined,
    },
    diagnostic: null,
  };
}

function buildEffectivePrefixesByRouterRef(
  routerInfoByFilePath: ReadonlyMap<string, RouterInfo>,
  mountEdges: readonly MountEdge[],
): ReadonlyMap<string, readonly string[]> {
  const inboundEdgesByTarget = new Map<string, MountEdge[]>();
  for (const edge of [...mountEdges].sort(compareMountEdges)) {
    const targetKey = routerRefKey(edge.target);
    const existing = inboundEdgesByTarget.get(targetKey) ?? [];
    existing.push(edge);
    inboundEdgesByTarget.set(targetKey, existing);
  }

  const memo = new Map<string, readonly string[]>();

  const resolvePrefixes = (routerRef: RouterRef, visiting: Set<string>): readonly string[] => {
    const key = routerRefKey(routerRef);
    const cached = memo.get(key);
    if (cached) {
      return cached;
    }

    if (visiting.has(key)) {
      return [];
    }

    visiting.add(key);
    const inboundEdges = inboundEdgesByTarget.get(key) ?? [];
    let prefixes: string[];

    if (inboundEdges.length === 0) {
      prefixes = [""];
    } else {
      prefixes = [];
      for (const edge of inboundEdges) {
        const sourcePrefixes = resolvePrefixes(edge.source, visiting);
        for (const sourcePrefix of sourcePrefixes) {
          const composedPrefix = composeMountedPath(sourcePrefix, edge.prefix);
          if (composedPrefix) {
            prefixes.push(composedPrefix === "/" ? "" : composedPrefix);
          }
        }
      }
    }

    visiting.delete(key);
    const uniquePrefixes = dedupeAndSortStrings(prefixes.length > 0 ? prefixes : [""]);
    memo.set(key, uniquePrefixes);
    return uniquePrefixes;
  };

  const prefixesByRouterRef = new Map<string, readonly string[]>();
  const routerRefs = [...routerInfoByFilePath.values()]
    .flatMap((routerInfo) =>
      [...routerInfo.routerNames]
        .sort(compareText)
        .map((routerName) => ({ filePath: routerInfo.filePath, routerName })),
    )
    .sort(compareRouterRefs);

  for (const routerRef of routerRefs) {
    prefixesByRouterRef.set(routerRefKey(routerRef), resolvePrefixes(routerRef, new Set()));
  }

  return prefixesByRouterRef;
}

function composeEffectiveEndpoints(
  leafEndpoints: readonly ExtractedLeafEndpoint[],
  prefixesByRouterRef: ReadonlyMap<string, readonly string[]>,
): ExtractedEndpoint[] {
  const endpoints: ExtractedEndpoint[] = [];
  const seen = new Set<string>();

  for (const leafEndpoint of [...leafEndpoints].sort(compareLeafEndpoints)) {
    const routerRef = {
      filePath: leafEndpoint.filePath,
      routerName: leafEndpoint.receiverName,
    } satisfies RouterRef;
    const prefixes = prefixesByRouterRef.get(routerRefKey(routerRef)) ?? [""];

    for (const prefix of prefixes) {
      const effectivePath = composeMountedPath(prefix, leafEndpoint.leafPath);
      if (!effectivePath) {
        continue;
      }

      const endpoint = {
        method: leafEndpoint.method,
        path: effectivePath,
        filePath: leafEndpoint.filePath,
        line: leafEndpoint.line,
        column: leafEndpoint.column,
        handlerName: leafEndpoint.handlerName,
      } satisfies ExtractedEndpoint;

      const key = endpointKey(endpoint);
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      endpoints.push(endpoint);
    }
  }

  return endpoints;
}

function buildEndpointDiagnostics(endpoints: readonly ExtractedEndpoint[]): EndpointDiagnostic[] {
  const diagnostics: EndpointDiagnostic[] = [];
  const seen = new Set<string>();

  for (const endpoint of endpoints) {
    const diagnostic: EndpointDiagnostic = endpoint.handlerName
      ? {
          code: "RECOGNIZED_ENDPOINT",
          message: `Recognized ${endpoint.method} ${endpoint.path}.`,
          filePath: endpoint.filePath,
          line: endpoint.line,
          column: endpoint.column,
          method: endpoint.method,
          path: endpoint.path,
          handlerName: endpoint.handlerName,
        }
      : {
          code: "PARTIAL_ENDPOINT",
          message: `Recognized ${endpoint.method} ${endpoint.path}, but handler name is not statically clear.`,
          filePath: endpoint.filePath,
          line: endpoint.line,
          column: endpoint.column,
          method: endpoint.method,
          path: endpoint.path,
        };

    const key = diagnosticKey(diagnostic);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    diagnostics.push(diagnostic);
  }

  return diagnostics;
}

function composeMountedPath(prefix: string, leafPath: string): string | null {
  const normalizedLeafPath = normalizeRoutePath(leafPath);
  if (!normalizedLeafPath) {
    return null;
  }

  if (prefix.length === 0) {
    return normalizedLeafPath;
  }

  const normalizedPrefix = normalizeRoutePath(prefix);
  if (!normalizedPrefix) {
    return null;
  }

  return normalizeRoutePath(`${normalizedPrefix}/${normalizedLeafPath}`);
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

function isRouterFactoryCall(expression: ts.Expression): boolean {
  if (!ts.isCallExpression(expression)) {
    return false;
  }

  if (ts.isIdentifier(expression.expression)) {
    return expression.expression.text === "Router" || expression.expression.text === "express";
  }

  return (
    ts.isPropertyAccessExpression(expression.expression)
    && ts.isIdentifier(expression.expression.expression)
    && expression.expression.expression.text === "express"
    && expression.expression.name.text === "Router"
  );
}

function hasExportModifier(statement: ts.VariableStatement): boolean {
  return ts.getModifiers(statement)?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ?? false;
}

function isSupportedHttpMethod(methodName: string): methodName is keyof typeof HTTP_METHODS {
  return Object.prototype.hasOwnProperty.call(HTTP_METHODS, methodName);
}

function readStaticRoutePath(argument: ts.Expression | undefined): string | null {
  if (!argument) {
    return null;
  }

  if (ts.isStringLiteralLike(argument) || ts.isNoSubstitutionTemplateLiteral(argument)) {
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

function readImportModuleSpecifier(importDeclaration: ts.ImportDeclaration): string | null {
  if (!ts.isStringLiteral(importDeclaration.moduleSpecifier)) {
    return null;
  }

  const moduleSpecifier = importDeclaration.moduleSpecifier.text.trim();
  if (moduleSpecifier.length === 0) {
    return null;
  }

  return moduleSpecifier;
}

function resolveImportTargetPath(
  sourceFilePath: string,
  moduleSpecifier: string,
  filePathSet: ReadonlySet<string>,
): string | null {
  if (!isRelativeSpecifier(moduleSpecifier)) {
    return null;
  }

  const sourceDir = path.posix.dirname(sourceFilePath);
  const candidateBase = normalizeJoinedPath(sourceDir, moduleSpecifier);
  if (!candidateBase) {
    return null;
  }

  const candidates = candidateImportPaths(candidateBase);
  for (const candidate of candidates) {
    if (filePathSet.has(candidate)) {
      return candidate;
    }
  }

  return null;
}

function candidateImportPaths(basePath: string): readonly string[] {
  const candidates: string[] = [basePath];

  if (basePath.endsWith(".ts") || basePath.endsWith(".tsx")) {
    return candidates;
  }

  candidates.push(`${basePath}.ts`);
  candidates.push(`${basePath}.tsx`);
  candidates.push(`${basePath}/index.ts`);
  candidates.push(`${basePath}/index.tsx`);

  return candidates;
}

function normalizeJoinedPath(directory: string, moduleSpecifier: string): string | null {
  try {
    return normalizePath(path.posix.join(directory, moduleSpecifier));
  } catch {
    return null;
  }
}

function isRelativeSpecifier(moduleSpecifier: string): boolean {
  return moduleSpecifier.startsWith("./") || moduleSpecifier.startsWith("../");
}

function routerRefKey(routerRef: RouterRef): string {
  return `${routerRef.filePath}::${routerRef.routerName}`;
}

function endpointKey(endpoint: ExtractedEndpoint): string {
  return [
    endpoint.filePath,
    endpoint.line,
    endpoint.column,
    endpoint.method,
    endpoint.path,
    endpoint.handlerName ?? "",
  ].join("|");
}

function diagnosticKey(diagnostic: EndpointDiagnostic): string {
  return [
    diagnostic.filePath,
    diagnostic.line,
    diagnostic.column,
    diagnostic.code,
    diagnostic.method ?? "",
    diagnostic.path ?? "",
    diagnostic.handlerName ?? "",
    diagnostic.message,
  ].join("|");
}

function dedupeAndSortStrings(values: readonly string[]): readonly string[] {
  return [...new Set(values)].sort(compareText);
}

function compareExtractionFiles(left: EndpointExtractionFile, right: EndpointExtractionFile): number {
  return compareText(left.filePath, right.filePath);
}

function compareRouterRefs(left: RouterRef, right: RouterRef): number {
  return compareText(left.filePath, right.filePath) || compareText(left.routerName, right.routerName);
}

function compareMountEdges(left: MountEdge, right: MountEdge): number {
  return (
    compareRouterRefs(left.source, right.source)
    || compareRouterRefs(left.target, right.target)
    || compareText(left.prefix, right.prefix)
  );
}

function compareLeafEndpoints(left: ExtractedLeafEndpoint, right: ExtractedLeafEndpoint): number {
  return (
    compareText(left.filePath, right.filePath)
    || compareNumber(left.line, right.line)
    || compareNumber(left.column, right.column)
    || compareText(left.receiverName, right.receiverName)
    || compareText(left.method, right.method)
    || compareText(left.leafPath, right.leafPath)
    || compareText(left.handlerName ?? "", right.handlerName ?? "")
  );
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
