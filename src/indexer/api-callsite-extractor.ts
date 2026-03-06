import * as ts from "typescript";
import type { ExtractedSymbol } from "./symbol-extractor";

const HTTP_METHODS = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"] as const;
type HttpMethod = (typeof HTTP_METHODS)[number];

const AXIOS_METHODS = {
  delete: "DELETE",
  get: "GET",
  head: "HEAD",
  options: "OPTIONS",
  patch: "PATCH",
  post: "POST",
  put: "PUT",
} as const;

const SUPERTEST_METHODS = {
  delete: "DELETE",
  get: "GET",
  head: "HEAD",
  options: "OPTIONS",
  patch: "PATCH",
  post: "POST",
  put: "PUT",
} as const;

export interface ExtractedApiCallsite {
  readonly method?: HttpMethod;
  readonly path: string;
  readonly filePath: string;
  readonly line: number;
  readonly column: number;
  readonly enclosingSymbol?: string;
}

export interface ApiCallsiteDiagnostic {
  readonly code:
    | "RECOGNIZED_API_CALLSITE"
    | "PARTIAL_API_CALLSITE"
    | "SKIPPED_DYNAMIC_API_CALLSITE";
  readonly message: string;
  readonly filePath: string;
  readonly line: number;
  readonly column: number;
  readonly method?: HttpMethod;
  readonly path?: string;
  readonly enclosingSymbol?: string;
}

export interface ApiCallsiteExtractionFile {
  readonly filePath: string;
  readonly sourceFile: ts.SourceFile;
  readonly symbols: readonly ExtractedSymbol[];
}

export interface ApiCallsiteExtractionResult {
  readonly callsites: readonly ExtractedApiCallsite[];
  readonly diagnostics: readonly ApiCallsiteDiagnostic[];
}

/**
 * Extract a deterministic inventory of statically obvious API consumer callsites.
 */
export function extractApiCallsites(
  files: readonly ApiCallsiteExtractionFile[],
): ApiCallsiteExtractionResult {
  const callsites: ExtractedApiCallsite[] = [];
  const diagnostics: ApiCallsiteDiagnostic[] = [];
  const sortedFiles = [...files].sort(compareExtractionFiles);

  for (const file of sortedFiles) {
    const symbolByDeclaration = buildSymbolByDeclaration(file.symbols);
    const supertestRequestIdentifiers = collectSupertestRequestIdentifiers(file.sourceFile);
    const pathBindings = new PathBindingScopes();

    const visit = (node: ts.Node, enclosingSymbol: ExtractedSymbol | null): void => {
      const pushedScope = shouldCreateScope(node);
      if (pushedScope) {
        pathBindings.pushScope();
      }

      let currentSymbol = enclosingSymbol;
      const declarationSymbol = symbolByDeclaration.get(node);
      if (declarationSymbol) {
        currentSymbol = declarationSymbol;
      }

      registerPathBinding(node, pathBindings);

      if (ts.isCallExpression(node)) {
        const extracted = extractApiCallsite(
          node,
          file.filePath,
          file.sourceFile,
          currentSymbol,
          supertestRequestIdentifiers,
          pathBindings,
        );
        if (extracted.callsite) {
          callsites.push(extracted.callsite);
        }
        if (extracted.diagnostic) {
          diagnostics.push(extracted.diagnostic);
        }
      }

      ts.forEachChild(node, (childNode) => visit(childNode, currentSymbol));

      if (pushedScope) {
        pathBindings.popScope();
      }
    };

    visit(file.sourceFile, null);
  }

  callsites.sort(compareCallsites);
  diagnostics.sort(compareDiagnostics);

  return {
    callsites,
    diagnostics,
  };
}

function extractApiCallsite(
  callExpression: ts.CallExpression,
  filePath: string,
  sourceFile: ts.SourceFile,
  enclosingSymbol: ExtractedSymbol | null,
  supertestRequestIdentifiers: ReadonlySet<string>,
  pathBindings: PathBindingScopes,
): { readonly callsite: ExtractedApiCallsite | null; readonly diagnostic: ApiCallsiteDiagnostic | null } {
  const fetchResult = extractFetchCall(callExpression, filePath, sourceFile, enclosingSymbol);
  if (fetchResult) {
    return fetchResult;
  }

  const axiosResult = extractAxiosCall(callExpression, filePath, sourceFile, enclosingSymbol);
  if (axiosResult) {
    return axiosResult;
  }

  const supertestResult = extractSupertestCall(
    callExpression,
    filePath,
    sourceFile,
    enclosingSymbol,
    supertestRequestIdentifiers,
    pathBindings,
  );
  if (supertestResult) {
    return supertestResult;
  }

  return { callsite: null, diagnostic: null };
}

function extractSupertestCall(
  callExpression: ts.CallExpression,
  filePath: string,
  sourceFile: ts.SourceFile,
  enclosingSymbol: ExtractedSymbol | null,
  supertestRequestIdentifiers: ReadonlySet<string>,
  pathBindings: PathBindingScopes,
): { readonly callsite: ExtractedApiCallsite | null; readonly diagnostic: ApiCallsiteDiagnostic | null } | null {
  if (!ts.isPropertyAccessExpression(callExpression.expression)) {
    return null;
  }

  const methodName = callExpression.expression.name.text;
  if (!isSupertestMethod(methodName)) {
    return null;
  }

  if (!isSupertestRequestReceiver(callExpression.expression.expression, supertestRequestIdentifiers)) {
    return null;
  }

  const location = sourceFile.getLineAndCharacterOfPosition(callExpression.expression.name.getStart(sourceFile));
  const line = location.line + 1;
  const column = location.character + 1;
  const enclosingName = enclosingSymbol?.name;
  const pathResult = readRequestPath(callExpression.arguments[0], pathBindings);

  if (!pathResult) {
    return {
      callsite: null,
      diagnostic: {
        code: "SKIPPED_DYNAMIC_API_CALLSITE",
        message: `Skipped supertest.${methodName} call with unresolved request path.`,
        filePath,
        line,
        column,
        enclosingSymbol: enclosingName,
      },
    };
  }

  return buildCallsiteResult({
    filePath,
    line,
    column,
    method: SUPERTEST_METHODS[methodName],
    path: pathResult.path,
    enclosingSymbol: enclosingName,
    partialMessage: pathResult.isTemplate
      ? `Recognized supertest.${methodName} callsite using a parameterized request path template ${pathResult.path}.`
      : undefined,
  });
}

function extractFetchCall(
  callExpression: ts.CallExpression,
  filePath: string,
  sourceFile: ts.SourceFile,
  enclosingSymbol: ExtractedSymbol | null,
): { readonly callsite: ExtractedApiCallsite | null; readonly diagnostic: ApiCallsiteDiagnostic | null } | null {
  if (!ts.isIdentifier(callExpression.expression) || callExpression.expression.text !== "fetch") {
    return null;
  }

  const location = sourceFile.getLineAndCharacterOfPosition(callExpression.expression.getStart(sourceFile));
  const line = location.line + 1;
  const column = location.character + 1;
  const enclosingName = enclosingSymbol?.name;

  const path = readStaticRequestPath(callExpression.arguments[0]);
  if (!path) {
    return {
      callsite: null,
      diagnostic: {
        code: "SKIPPED_DYNAMIC_API_CALLSITE",
        message: "Skipped fetch call with non-static request path.",
        filePath,
        line,
        column,
        enclosingSymbol: enclosingName,
      },
    };
  }

  const method = readFetchMethod(callExpression.arguments[1]);
  return buildCallsiteResult({
    filePath,
    line,
    column,
    method,
    path,
    enclosingSymbol: enclosingName,
  });
}

function extractAxiosCall(
  callExpression: ts.CallExpression,
  filePath: string,
  sourceFile: ts.SourceFile,
  enclosingSymbol: ExtractedSymbol | null,
): { readonly callsite: ExtractedApiCallsite | null; readonly diagnostic: ApiCallsiteDiagnostic | null } | null {
  const location = sourceFile.getLineAndCharacterOfPosition(callExpression.getStart(sourceFile));
  const line = location.line + 1;
  const column = location.character + 1;
  const enclosingName = enclosingSymbol?.name;

  if (ts.isPropertyAccessExpression(callExpression.expression)) {
    if (!ts.isIdentifier(callExpression.expression.expression) || callExpression.expression.expression.text !== "axios") {
      return null;
    }

    const methodName = callExpression.expression.name.text;
    if (!isAxiosMethod(methodName)) {
      return null;
    }

    const path = readStaticRequestPath(callExpression.arguments[0]);
    if (!path) {
      return {
        callsite: null,
        diagnostic: {
          code: "SKIPPED_DYNAMIC_API_CALLSITE",
          message: `Skipped axios.${methodName} call with non-static request path.`,
          filePath,
          line,
          column,
          enclosingSymbol: enclosingName,
        },
      };
    }

    return buildCallsiteResult({
      filePath,
      line,
      column,
      method: AXIOS_METHODS[methodName],
      path,
      enclosingSymbol: enclosingName,
    });
  }

  if (!ts.isIdentifier(callExpression.expression) || callExpression.expression.text !== "axios") {
    return null;
  }

  const config = callExpression.arguments[0];
  if (!config || !ts.isObjectLiteralExpression(config)) {
    return {
      callsite: null,
      diagnostic: {
        code: "SKIPPED_DYNAMIC_API_CALLSITE",
        message: "Skipped axios call with non-object config.",
        filePath,
        line,
        column,
        enclosingSymbol: enclosingName,
      },
    };
  }

  const path = readStaticRequestPath(readObjectPropertyValue(config, "url"));
  if (!path) {
    return {
      callsite: null,
      diagnostic: {
        code: "SKIPPED_DYNAMIC_API_CALLSITE",
        message: "Skipped axios call with non-static config.url.",
        filePath,
        line,
        column,
        enclosingSymbol: enclosingName,
      },
    };
  }

  const method = readStaticMethod(readObjectPropertyValue(config, "method"));
  return buildCallsiteResult({
    filePath,
    line,
    column,
    method,
    path,
    enclosingSymbol: enclosingName,
  });
}

function buildCallsiteResult(input: {
  readonly filePath: string;
  readonly line: number;
  readonly column: number;
  readonly method?: HttpMethod;
  readonly path: string;
  readonly enclosingSymbol?: string;
  readonly partialMessage?: string;
}): { readonly callsite: ExtractedApiCallsite; readonly diagnostic: ApiCallsiteDiagnostic } {
  const messagePrefix = input.method ? `${input.method} ${input.path}` : input.path;
  const diagnosticCode = input.partialMessage || !input.method ? "PARTIAL_API_CALLSITE" : "RECOGNIZED_API_CALLSITE";
  const diagnosticMessage = input.partialMessage
    ? input.partialMessage
    : input.method
      ? `Recognized API callsite ${messagePrefix}.`
      : `Recognized API callsite ${messagePrefix}, but HTTP method is not statically clear.`;

  return {
    callsite: {
      method: input.method,
      path: input.path,
      filePath: input.filePath,
      line: input.line,
      column: input.column,
      enclosingSymbol: input.enclosingSymbol,
    },
    diagnostic: {
      code: diagnosticCode,
      message: diagnosticMessage,
      filePath: input.filePath,
      line: input.line,
      column: input.column,
      method: input.method,
      path: input.path,
      enclosingSymbol: input.enclosingSymbol,
    },
  };
}

function readFetchMethod(argument: ts.Expression | undefined): HttpMethod | undefined {
  if (!argument || !ts.isObjectLiteralExpression(argument)) {
    return undefined;
  }

  return readStaticMethod(readObjectPropertyValue(argument, "method"));
}

function readObjectPropertyValue(
  objectLiteral: ts.ObjectLiteralExpression,
  propertyName: string,
): ts.Expression | undefined {
  for (const property of objectLiteral.properties) {
    if (!ts.isPropertyAssignment(property) || !isNamedProperty(property.name, propertyName)) {
      continue;
    }

    return property.initializer;
  }

  return undefined;
}

function isNamedProperty(name: ts.PropertyName, expectedName: string): boolean {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name)) {
    return name.text === expectedName;
  }

  return false;
}

function readStaticMethod(argument: ts.Expression | undefined): HttpMethod | undefined {
  if (!argument || !ts.isStringLiteralLike(argument)) {
    return undefined;
  }

  const normalized = argument.text.trim().toUpperCase();
  return isHttpMethod(normalized) ? normalized : undefined;
}

function readStaticRequestPath(argument: ts.Expression | undefined): string | null {
  if (!argument) {
    return null;
  }

  if (ts.isStringLiteralLike(argument) || ts.isNoSubstitutionTemplateLiteral(argument)) {
    return normalizeRequestPath(argument.text);
  }

  return null;
}

function readRequestPath(
  argument: ts.Expression | undefined,
  pathBindings: PathBindingScopes,
  seenIdentifiers: ReadonlySet<string> = new Set<string>(),
): RequestPathResult | null {
  if (!argument) {
    return null;
  }

  if (ts.isStringLiteralLike(argument) || ts.isNoSubstitutionTemplateLiteral(argument)) {
    const path = normalizeRequestPath(argument.text);
    if (!path) {
      return null;
    }
    return { path, isTemplate: false, viaBinding: false };
  }

  if (ts.isTemplateExpression(argument)) {
    const path = normalizeTemplateRequestPath(argument);
    if (!path) {
      return null;
    }
    return { path, isTemplate: true, viaBinding: false };
  }

  if (ts.isIdentifier(argument)) {
    if (seenIdentifiers.has(argument.text)) {
      return null;
    }

    const binding = pathBindings.get(argument.text);
    if (!binding) {
      return null;
    }

    const nextSeen = new Set(seenIdentifiers);
    nextSeen.add(argument.text);
    const resolved = readRequestPath(binding.initializer, pathBindings, nextSeen);
    if (!resolved) {
      return null;
    }

    return {
      path: resolved.path,
      isTemplate: resolved.isTemplate,
      viaBinding: true,
    };
  }

  return null;
}

function normalizeTemplateRequestPath(argument: ts.TemplateExpression): string | null {
  let pathText = argument.head.text;

  for (const span of argument.templateSpans) {
    pathText += "{param}";
    pathText += span.literal.text;
  }

  return normalizeRequestPath(pathText);
}

function normalizeRequestPath(pathText: string): string | null {
  const trimmed = pathText.trim();
  if (trimmed.length === 0) {
    return null;
  }

  if (!trimmed.startsWith("/")) {
    return null;
  }

  const collapsed = trimmed.replace(/\/+/g, "/");
  if (collapsed === "/") {
    return collapsed;
  }

  return collapsed.endsWith("/") ? collapsed.slice(0, -1) : collapsed;
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

function collectSupertestRequestIdentifiers(sourceFile: ts.SourceFile): ReadonlySet<string> {
  const identifiers = new Set<string>();

  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) {
      continue;
    }

    if (statement.moduleSpecifier.text !== "supertest") {
      continue;
    }

    const clause = statement.importClause;
    if (clause?.name) {
      identifiers.add(clause.name.text);
    }
  }

  return identifiers;
}

function registerPathBinding(node: ts.Node, pathBindings: PathBindingScopes): void {
  if (!ts.isVariableDeclaration(node) || !ts.isIdentifier(node.name)) {
    return;
  }

  if (!isConstVariableDeclaration(node) || !node.initializer) {
    return;
  }

  if (!isStaticPathInitializer(node.initializer)) {
    return;
  }

  pathBindings.set(node.name.text, { initializer: node.initializer });
}

function isConstVariableDeclaration(node: ts.VariableDeclaration): boolean {
  const declarationList = node.parent;
  return ts.isVariableDeclarationList(declarationList)
    && (declarationList.flags & ts.NodeFlags.Const) === ts.NodeFlags.Const;
}

function isStaticPathInitializer(initializer: ts.Expression): boolean {
  return ts.isStringLiteralLike(initializer)
    || ts.isNoSubstitutionTemplateLiteral(initializer)
    || ts.isTemplateExpression(initializer)
    || ts.isIdentifier(initializer);
}

function shouldCreateScope(node: ts.Node): boolean {
  return ts.isSourceFile(node)
    || ts.isBlock(node)
    || ts.isModuleBlock(node)
    || ts.isCaseBlock(node)
    || ts.isFunctionLike(node);
}

function isSupertestRequestReceiver(
  expression: ts.Expression,
  supertestRequestIdentifiers: ReadonlySet<string>,
): boolean {
  return ts.isCallExpression(expression)
    && ts.isIdentifier(expression.expression)
    && supertestRequestIdentifiers.has(expression.expression.text);
}

function isAxiosMethod(methodName: string): methodName is keyof typeof AXIOS_METHODS {
  return Object.prototype.hasOwnProperty.call(AXIOS_METHODS, methodName);
}

function isSupertestMethod(methodName: string): methodName is keyof typeof SUPERTEST_METHODS {
  return Object.prototype.hasOwnProperty.call(SUPERTEST_METHODS, methodName);
}

function isHttpMethod(value: string): value is HttpMethod {
  return HTTP_METHODS.includes(value as HttpMethod);
}

function compareExtractionFiles(
  left: ApiCallsiteExtractionFile,
  right: ApiCallsiteExtractionFile,
): number {
  return compareText(left.filePath, right.filePath);
}

function compareCallsites(left: ExtractedApiCallsite, right: ExtractedApiCallsite): number {
  return (
    compareText(left.filePath, right.filePath)
    || compareNumber(left.line, right.line)
    || compareNumber(left.column, right.column)
    || compareText(left.method ?? "", right.method ?? "")
    || compareText(left.path, right.path)
    || compareText(left.enclosingSymbol ?? "", right.enclosingSymbol ?? "")
  );
}

function compareDiagnostics(left: ApiCallsiteDiagnostic, right: ApiCallsiteDiagnostic): number {
  return (
    compareText(left.filePath, right.filePath)
    || compareNumber(left.line, right.line)
    || compareNumber(left.column, right.column)
    || compareText(left.code, right.code)
    || compareText(left.method ?? "", right.method ?? "")
    || compareText(left.path ?? "", right.path ?? "")
    || compareText(left.enclosingSymbol ?? "", right.enclosingSymbol ?? "")
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

interface RequestPathResult {
  readonly path: string;
  readonly isTemplate: boolean;
  readonly viaBinding: boolean;
}

interface PathBinding {
  readonly initializer: ts.Expression;
}

class PathBindingScopes {
  private readonly scopes: Map<string, PathBinding>[] = [];

  constructor() {
    this.pushScope();
  }

  pushScope(): void {
    this.scopes.push(new Map<string, PathBinding>());
  }

  popScope(): void {
    if (this.scopes.length <= 1) {
      return;
    }

    this.scopes.pop();
  }

  set(name: string, binding: PathBinding): void {
    const current = this.scopes[this.scopes.length - 1];
    current.set(name, binding);
  }

  get(name: string): PathBinding | undefined {
    for (let index = this.scopes.length - 1; index >= 0; index -= 1) {
      const binding = this.scopes[index].get(name);
      if (binding) {
        return binding;
      }
    }

    return undefined;
  }
}
