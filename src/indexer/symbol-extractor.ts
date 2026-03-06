import * as ts from "typescript";
import { makeSymbolNodeId } from "../graph/ids";
import type { Node, NodeId } from "../graph/types";
import { normalizePath } from "../graph/normalize";

export type ExtractedSymbolKind = "function" | "class" | "method";

type SupportedDeclaration = ts.FunctionDeclaration | ts.ClassDeclaration | ts.MethodDeclaration;

export interface ExtractedSymbol {
  readonly id: NodeId;
  readonly name: string;
  readonly symbolKind: ExtractedSymbolKind;
  readonly filePath: string;
  readonly fileId: NodeId;
  readonly start: number;
  readonly line: number;
  readonly column: number;
  readonly declaration: SupportedDeclaration;
  readonly node: Node;
}

export interface ExtractSymbolsOptions {
  readonly sourceFile: ts.SourceFile;
  readonly filePath: string;
  readonly fileId: NodeId;
}

/**
 * Extract syntactically explicit symbol declarations from a parsed source file.
 */
export function extractSymbols(options: ExtractSymbolsOptions): ExtractedSymbol[] {
  const { sourceFile, fileId } = options;
  const filePath = normalizePath(options.filePath);
  const extractedById = new Map<NodeId, ExtractedSymbol>();

  const visit = (node: ts.Node): void => {
    if (ts.isFunctionDeclaration(node)) {
      const symbol = createFunctionSymbol(node, sourceFile, filePath, fileId);
      if (symbol) {
        extractedById.set(symbol.id, symbol);
      }
    } else if (ts.isClassDeclaration(node)) {
      const symbol = createClassSymbol(node, sourceFile, filePath, fileId);
      if (symbol) {
        extractedById.set(symbol.id, symbol);
      }
    } else if (ts.isMethodDeclaration(node)) {
      const symbol = createMethodSymbol(node, sourceFile, filePath, fileId);
      if (symbol) {
        extractedById.set(symbol.id, symbol);
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  return [...extractedById.values()].sort(compareExtractedSymbols);
}

function createFunctionSymbol(
  declaration: ts.FunctionDeclaration,
  sourceFile: ts.SourceFile,
  filePath: string,
  fileId: NodeId,
): ExtractedSymbol | null {
  if (!declaration.name || !ts.isIdentifier(declaration.name)) {
    return null;
  }

  return createSymbolRecord(
    declaration,
    sourceFile,
    filePath,
    fileId,
    declaration.name.text,
    "function",
  );
}

function createClassSymbol(
  declaration: ts.ClassDeclaration,
  sourceFile: ts.SourceFile,
  filePath: string,
  fileId: NodeId,
): ExtractedSymbol | null {
  if (!declaration.name || !ts.isIdentifier(declaration.name)) {
    return null;
  }

  return createSymbolRecord(
    declaration,
    sourceFile,
    filePath,
    fileId,
    declaration.name.text,
    "class",
  );
}

function createMethodSymbol(
  declaration: ts.MethodDeclaration,
  sourceFile: ts.SourceFile,
  filePath: string,
  fileId: NodeId,
): ExtractedSymbol | null {
  if (!ts.isIdentifier(declaration.name)) {
    return null;
  }

  const parentClass = declaration.parent;
  if (!ts.isClassDeclaration(parentClass) || !parentClass.name || !ts.isIdentifier(parentClass.name)) {
    return null;
  }

  const qualifiedName = `${parentClass.name.text}.${declaration.name.text}`;
  return createSymbolRecord(
    declaration,
    sourceFile,
    filePath,
    fileId,
    qualifiedName,
    "method",
  );
}

function createSymbolRecord(
  declaration: SupportedDeclaration,
  sourceFile: ts.SourceFile,
  filePath: string,
  fileId: NodeId,
  name: string,
  symbolKind: ExtractedSymbolKind,
): ExtractedSymbol {
  const start = declaration.getStart(sourceFile);
  const location = sourceFile.getLineAndCharacterOfPosition(start);
  const line = location.line + 1;
  const column = location.character + 1;
  const isDefaultExport = hasModifier(declaration, ts.SyntaxKind.DefaultKeyword);
  const id = makeSymbolNodeId(fileId, name, symbolKind);

  return {
    id,
    name,
    symbolKind,
    filePath,
    fileId,
    start,
    line,
    column,
    declaration,
    node: {
      id,
      kind: "Symbol",
      metadata: {
        name,
        kind: symbolKind,
        symbol_kind: symbolKind,
        file_id: fileId,
        file_path: filePath,
        start,
        line,
        column,
        is_default_export: isDefaultExport,
        is_reexport: false,
      },
    },
  };
}

function hasModifier(node: ts.Node, kind: ts.SyntaxKind): boolean {
  const modifiers = (node as { modifiers?: readonly ts.Node[] }).modifiers;
  return Boolean(modifiers?.some((modifier) => modifier.kind === kind));
}

function compareExtractedSymbols(left: ExtractedSymbol, right: ExtractedSymbol): number {
  if (left.id < right.id) {
    return -1;
  }
  if (left.id > right.id) {
    return 1;
  }
  return 0;
}
