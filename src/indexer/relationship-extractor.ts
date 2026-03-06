import * as path from "node:path";
import * as ts from "typescript";
import { makeEdgeId } from "../graph/ids";
import { normalizePath } from "../graph/normalize";
import { sortEdges } from "../graph/order";
import type { Edge, NodeId } from "../graph/types";
import type { ExtractedSymbol } from "./symbol-extractor";

interface RelationAggregate {
  readonly fromId: NodeId;
  readonly toId: NodeId;
  readonly kind: "IMPORTS" | "CALLS";
  readonly filePath: string;
  readonly line: number;
  readonly column: number;
  readonly label: string;
  count: number;
}

interface FileSymbolLookup {
  readonly byDeclaration: ReadonlyMap<ts.Node, ExtractedSymbol>;
  readonly callableByName: ReadonlyMap<string, readonly ExtractedSymbol[]>;
  readonly defaultCallableSymbols: readonly ExtractedSymbol[];
}

interface ImportBindingNamed {
  readonly type: "named";
  readonly targetFilePath: string;
  readonly importedName: string;
}

interface ImportBindingDefault {
  readonly type: "default";
  readonly targetFilePath: string;
}

type ImportBinding = ImportBindingNamed | ImportBindingDefault;

export interface RelationshipExtractionFile {
  readonly filePath: string;
  readonly fileId: NodeId;
  readonly sourceFile: ts.SourceFile;
  readonly symbols: readonly ExtractedSymbol[];
}

export interface RelationshipExtractionResult {
  readonly importEdges: readonly Edge[];
  readonly containsEdges: readonly Edge[];
  readonly callEdges: readonly Edge[];
  readonly edges: readonly Edge[];
  readonly diagnostics: readonly RelationshipDiagnostic[];
}

export interface RelationshipDiagnostic {
  readonly code: "UNRESOLVED_IMPORT" | "UNRESOLVED_CALL";
  readonly message: string;
  readonly filePath: string;
  readonly line: number;
  readonly column: number;
}

/**
 * Extract deterministic structural relationships from parsed files and symbols.
 */
export function extractRelationships(
  files: readonly RelationshipExtractionFile[],
): RelationshipExtractionResult {
  const sortedFiles = [...files].sort(compareRelationshipFiles);
  const fileIdByPath = new Map<string, NodeId>();
  for (const file of sortedFiles) {
    fileIdByPath.set(file.filePath, file.fileId);
  }

  const symbolLookupsByFilePath = buildFileSymbolLookups(sortedFiles);
  const containsEdges = extractContainsEdges(sortedFiles);
  const importExtraction = extractImportEdges(sortedFiles, fileIdByPath);
  const callExtraction = extractCallEdges(sortedFiles, fileIdByPath, symbolLookupsByFilePath);
  const importEdges = importExtraction.edges;
  const callEdges = callExtraction.edges;
  const edges = sortEdges([...containsEdges, ...importEdges, ...callEdges]);
  const diagnostics = [...importExtraction.diagnostics, ...callExtraction.diagnostics].sort(
    compareRelationshipDiagnostics,
  );

  return {
    importEdges,
    containsEdges,
    callEdges,
    edges,
    diagnostics,
  };
}

function extractContainsEdges(files: readonly RelationshipExtractionFile[]): Edge[] {
  const edgeByKey = new Map<string, Edge>();

  for (const file of files) {
    for (const symbol of file.symbols) {
      const edge = {
        id: makeEdgeId(file.fileId, "CONTAINS", symbol.id),
        from_id: file.fileId,
        to_id: symbol.id,
        kind: "CONTAINS",
        metadata: {
          file_path: file.filePath,
          symbol_name: symbol.name,
          symbol_kind: symbol.symbolKind,
        },
      } satisfies Edge;

      const key = `${edge.from_id}|${edge.kind}|${edge.to_id}`;
      if (!edgeByKey.has(key)) {
        edgeByKey.set(key, edge);
      }
    }
  }

  return sortEdges([...edgeByKey.values()]);
}

function extractImportEdges(
  files: readonly RelationshipExtractionFile[],
  fileIdByPath: ReadonlyMap<string, NodeId>,
): { readonly edges: Edge[]; readonly diagnostics: RelationshipDiagnostic[] } {
  const aggregates = new Map<string, RelationAggregate>();
  const diagnostics: RelationshipDiagnostic[] = [];

  for (const file of files) {
    for (const statement of file.sourceFile.statements) {
      if (!ts.isImportDeclaration(statement)) {
        continue;
      }

      const moduleSpecifier = readImportModuleSpecifier(statement);
      if (!moduleSpecifier) {
        continue;
      }

      const targetPath = resolveImportTargetPath(file.filePath, moduleSpecifier, fileIdByPath);
      if (!targetPath) {
        if (isRelativeSpecifier(moduleSpecifier)) {
          const position = file.sourceFile.getLineAndCharacterOfPosition(
            statement.moduleSpecifier.getStart(file.sourceFile),
          );
          diagnostics.push({
            code: "UNRESOLVED_IMPORT",
            message: `Unresolved relative import '${moduleSpecifier}'.`,
            filePath: file.filePath,
            line: position.line + 1,
            column: position.character + 1,
          });
        }
        continue;
      }

      const targetFileId = fileIdByPath.get(targetPath);
      if (!targetFileId) {
        continue;
      }

      const location = statement.moduleSpecifier.getStart(file.sourceFile);
      const position = file.sourceFile.getLineAndCharacterOfPosition(location);

      upsertRelationAggregate(aggregates, {
        fromId: file.fileId,
        toId: targetFileId,
        kind: "IMPORTS",
        filePath: file.filePath,
        line: position.line + 1,
        column: position.character + 1,
        label: moduleSpecifier,
      });
    }
  }

  const edges = sortEdges(
    [...aggregates.values()].map(
      (aggregate) =>
        ({
          id: makeEdgeId(aggregate.fromId, aggregate.kind, aggregate.toId),
          from_id: aggregate.fromId,
          to_id: aggregate.toId,
          kind: aggregate.kind,
          metadata: {
            file_path: aggregate.filePath,
            line: aggregate.line,
            column: aggregate.column,
            module_specifier: aggregate.label,
            import_count: aggregate.count,
          },
        }) satisfies Edge,
    ),
  );

  diagnostics.sort(compareRelationshipDiagnostics);
  return { edges, diagnostics };
}

function extractCallEdges(
  files: readonly RelationshipExtractionFile[],
  fileIdByPath: ReadonlyMap<string, NodeId>,
  symbolLookupsByFilePath: ReadonlyMap<string, FileSymbolLookup>,
): { readonly edges: Edge[]; readonly diagnostics: RelationshipDiagnostic[] } {
  const aggregates = new Map<string, RelationAggregate>();
  const diagnostics: RelationshipDiagnostic[] = [];

  for (const file of files) {
    const fileLookup = symbolLookupsByFilePath.get(file.filePath);
    if (!fileLookup) {
      continue;
    }

    const importBindings = buildImportBindings(file, fileIdByPath);

    const visit = (node: ts.Node, currentSymbol: ExtractedSymbol | null): void => {
      let enclosingSymbol = currentSymbol;
      const declarationSymbol = fileLookup.byDeclaration.get(node);
      if (declarationSymbol) {
        enclosingSymbol = declarationSymbol;
      }

      if (enclosingSymbol && ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
        const resolution = resolveCallTarget(
          node.expression.text,
          importBindings,
          symbolLookupsByFilePath,
        );
        const location = node.expression.getStart(file.sourceFile);
        const position = file.sourceFile.getLineAndCharacterOfPosition(location);

        if (resolution.type === "resolved") {
          const targetSymbol = resolution.symbol;

          upsertRelationAggregate(aggregates, {
            fromId: enclosingSymbol.id,
            toId: targetSymbol.id,
            kind: "CALLS",
            filePath: file.filePath,
            line: position.line + 1,
            column: position.character + 1,
            label: targetSymbol.name,
          });
        } else if (resolution.type === "unresolved") {
          diagnostics.push({
            code: "UNRESOLVED_CALL",
            message: resolution.message,
            filePath: file.filePath,
            line: position.line + 1,
            column: position.character + 1,
          });
        }
      }

      ts.forEachChild(node, (childNode) => visit(childNode, enclosingSymbol));
    };

    visit(file.sourceFile, null);
  }

  const edges = sortEdges(
    [...aggregates.values()].map(
      (aggregate) =>
        ({
          id: makeEdgeId(aggregate.fromId, aggregate.kind, aggregate.toId),
          from_id: aggregate.fromId,
          to_id: aggregate.toId,
          kind: aggregate.kind,
          metadata: {
            file_path: aggregate.filePath,
            line: aggregate.line,
            column: aggregate.column,
            target_name: aggregate.label,
            call_count: aggregate.count,
          },
        }) satisfies Edge,
    ),
  );

  diagnostics.sort(compareRelationshipDiagnostics);
  return { edges, diagnostics };
}

function buildImportBindings(
  file: RelationshipExtractionFile,
  fileIdByPath: ReadonlyMap<string, NodeId>,
): ReadonlyMap<string, ImportBinding> {
  const bindings = new Map<string, ImportBinding>();

  for (const statement of file.sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) {
      continue;
    }

    const moduleSpecifier = readImportModuleSpecifier(statement);
    if (!moduleSpecifier) {
      continue;
    }

    const targetPath = resolveImportTargetPath(file.filePath, moduleSpecifier, fileIdByPath);
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
    if (!namedBindings) {
      continue;
    }

    if (ts.isNamespaceImport(namedBindings)) {
      continue;
    }

    for (const element of namedBindings.elements) {
      const importedName = element.propertyName?.text ?? element.name.text;
      const localName = element.name.text;

      bindings.set(localName, {
        type: "named",
        targetFilePath: targetPath,
        importedName,
      });
    }
  }

  return bindings;
}

function resolveCallTarget(
  targetName: string,
  importBindings: ReadonlyMap<string, ImportBinding>,
  symbolLookupsByFilePath: ReadonlyMap<string, FileSymbolLookup>,
):
  | { readonly type: "resolved"; readonly symbol: ExtractedSymbol }
  | { readonly type: "unresolved"; readonly message: string }
  | { readonly type: "not_applicable" } {
  const binding = importBindings.get(targetName);
  if (!binding) {
    return { type: "not_applicable" };
  }

  const targetFileLookup = symbolLookupsByFilePath.get(binding.targetFilePath);
  if (!targetFileLookup) {
    return {
      type: "unresolved",
      message: `Imported call target '${targetName}' resolves to unknown file '${binding.targetFilePath}'.`,
    };
  }

  if (binding.type === "default") {
    if (targetFileLookup.defaultCallableSymbols.length === 1) {
      return { type: "resolved", symbol: targetFileLookup.defaultCallableSymbols[0] };
    }
    if (targetFileLookup.defaultCallableSymbols.length === 0) {
      return {
        type: "unresolved",
        message: `Default import '${targetName}' does not resolve to a callable exported symbol.`,
      };
    }
    return {
      type: "unresolved",
      message: `Default import '${targetName}' resolves to multiple callable exported symbols.`,
    };
  }

  const importedCandidates = targetFileLookup.callableByName.get(binding.importedName);
  if (!importedCandidates || importedCandidates.length === 0) {
    return {
      type: "unresolved",
      message: `Named import '${binding.importedName}' for '${targetName}' does not resolve to a callable exported symbol.`,
    };
  }

  if (importedCandidates.length > 1) {
    return {
      type: "unresolved",
      message: `Named import '${binding.importedName}' for '${targetName}' is ambiguous.`,
    };
  }

  return { type: "resolved", symbol: importedCandidates[0] };
}

function buildFileSymbolLookups(
  files: readonly RelationshipExtractionFile[],
): ReadonlyMap<string, FileSymbolLookup> {
  const byFilePath = new Map<string, FileSymbolLookup>();

  for (const file of files) {
    const byDeclaration = new Map<ts.Node, ExtractedSymbol>();
    const callableByNameMutable = new Map<string, ExtractedSymbol[]>();
    const defaultCallableSymbols: ExtractedSymbol[] = [];

    for (const symbol of file.symbols) {
      byDeclaration.set(symbol.declaration, symbol);

      if (!isCallableSymbol(symbol)) {
        continue;
      }

      const list = callableByNameMutable.get(symbol.name) ?? [];
      list.push(symbol);
      callableByNameMutable.set(symbol.name, list);

      if (symbol.node.metadata.is_default_export === true) {
        defaultCallableSymbols.push(symbol);
      }
    }

    const callableByName = new Map<string, readonly ExtractedSymbol[]>();
    for (const [name, symbols] of callableByNameMutable.entries()) {
      symbols.sort(compareSymbolIds);
      callableByName.set(name, symbols);
    }

    defaultCallableSymbols.sort(compareSymbolIds);

    byFilePath.set(file.filePath, {
      byDeclaration,
      callableByName,
      defaultCallableSymbols,
    });
  }

  return byFilePath;
}

function isCallableSymbol(symbol: ExtractedSymbol): boolean {
  return symbol.symbolKind === "function" || symbol.symbolKind === "class";
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
  fileIdByPath: ReadonlyMap<string, NodeId>,
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
    if (fileIdByPath.has(candidate)) {
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

function upsertRelationAggregate(
  aggregates: Map<string, RelationAggregate>,
  input: Omit<RelationAggregate, "count">,
): void {
  const key = `${input.fromId}|${input.kind}|${input.toId}`;
  const existing = aggregates.get(key);
  if (existing) {
    existing.count += 1;
    return;
  }

  aggregates.set(key, {
    ...input,
    count: 1,
  });
}

function compareSymbolIds(left: ExtractedSymbol, right: ExtractedSymbol): number {
  if (left.id < right.id) {
    return -1;
  }
  if (left.id > right.id) {
    return 1;
  }
  return 0;
}

function compareRelationshipDiagnostics(
  left: RelationshipDiagnostic,
  right: RelationshipDiagnostic,
): number {
  return (
    compareText(left.filePath, right.filePath)
    || compareNumber(left.line, right.line)
    || compareNumber(left.column, right.column)
    || compareText(left.code, right.code)
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

function compareRelationshipFiles(
  left: RelationshipExtractionFile,
  right: RelationshipExtractionFile,
): number {
  return compareText(left.filePath, right.filePath) || compareText(left.fileId, right.fileId);
}
