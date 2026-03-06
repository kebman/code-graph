import * as path from "node:path";
import * as ts from "typescript";
import { Graph } from "../graph/graph";
import { makeFileNodeId } from "../graph/ids";
import { sortNodes } from "../graph/order";
import type { Node, NodeId, ValidationResult } from "../graph/types";
import { parseFileWithDiagnostics } from "./ast-parser";
import { scanTypeScriptFiles, type ScanTypeScriptFilesOptions } from "./file-scanner";
import {
  extractRelationships,
  type RelationshipDiagnostic,
  type RelationshipExtractionFile,
  type RelationshipExtractionResult,
} from "./relationship-extractor";
import { extractSymbols, type ExtractedSymbol } from "./symbol-extractor";

interface IndexedFile {
  readonly filePath: string;
  readonly fileId: NodeId;
  readonly sourceFile: ts.SourceFile;
  readonly symbols: readonly ExtractedSymbol[];
}

export interface IndexRepositoryOptions {
  readonly rootDir?: string;
  readonly excludedDirectories?: ScanTypeScriptFilesOptions["excludedDirectories"];
}

export interface IndexRepositoryResult {
  readonly graph: Graph;
  readonly validation: ValidationResult;
  readonly files: readonly string[];
  readonly scannedFiles: readonly string[];
  readonly sourceFiles: readonly ts.SourceFile[];
  readonly relationships: RelationshipExtractionResult;
  readonly diagnostics: readonly IndexerDiagnostic[];
}

export interface IndexerDiagnostic {
  readonly code:
    | "FILE_READ_ERROR"
    | "PARSE_ERROR"
    | "UNRESOLVED_IMPORT"
    | "UNRESOLVED_CALL"
    | "SYMBOL_EXTRACTION_ERROR"
    | "DUPLICATE_NODE_ID"
    | "DUPLICATE_EDGE_ID";
  readonly severity: "error" | "warning";
  readonly message: string;
  readonly filePath?: string;
  readonly line?: number;
  readonly column?: number;
  readonly id?: string;
}

/**
 * Build a deterministic structural graph for repository TypeScript files.
 */
export function indexRepository(options: IndexRepositoryOptions = {}): IndexRepositoryResult {
  const rootDir = path.resolve(options.rootDir ?? process.cwd());
  const scannedFiles = scanTypeScriptFiles({
    rootDir,
    excludedDirectories: options.excludedDirectories,
  });
  const diagnostics: IndexerDiagnostic[] = [];

  const indexedFiles: IndexedFile[] = [];
  for (const filePath of scannedFiles) {
    const fileId = makeFileNodeId(filePath);
    const absolutePath = path.resolve(rootDir, filePath);
    const parseResult = parseFileWithDiagnostics(absolutePath, { sourceFilePath: filePath });

    for (const diagnostic of parseResult.diagnostics) {
      diagnostics.push({
        code: diagnostic.code,
        severity: "error",
        message: diagnostic.message,
        filePath: diagnostic.filePath,
        line: diagnostic.line,
        column: diagnostic.column,
      });
    }

    if (!parseResult.sourceFile) {
      continue;
    }

    let symbols: readonly ExtractedSymbol[] = [];
    try {
      symbols = extractSymbols({ sourceFile: parseResult.sourceFile, filePath, fileId });
    } catch (error) {
      diagnostics.push({
        code: "SYMBOL_EXTRACTION_ERROR",
        severity: "error",
        message: `Failed to extract symbols from '${filePath}': ${toErrorMessage(error)}`,
        filePath,
      });
      continue;
    }

    indexedFiles.push({
      filePath,
      fileId,
      sourceFile: parseResult.sourceFile,
      symbols,
    });
  }

  const graph = new Graph();
  addFileNodes(graph, indexedFiles, diagnostics);
  addSymbolNodes(graph, indexedFiles, diagnostics);

  const relationshipFiles: RelationshipExtractionFile[] = indexedFiles.map((file) => ({
    filePath: file.filePath,
    fileId: file.fileId,
    sourceFile: file.sourceFile,
    symbols: file.symbols,
  }));
  const relationships = extractRelationships(relationshipFiles);
  diagnostics.push(...relationships.diagnostics.map(toIndexerDiagnostic));

  addEdges(graph, relationships.edges, diagnostics);

  const validation = graph.validate();
  if (!validation.ok) {
    throw new Error(formatValidationErrors(validation));
  }

  diagnostics.sort(compareDiagnostics);

  return {
    graph,
    validation,
    files: indexedFiles.map((file) => file.filePath),
    scannedFiles,
    sourceFiles: indexedFiles.map((file) => file.sourceFile),
    relationships,
    diagnostics,
  };
}

function addFileNodes(
  graph: Graph,
  indexedFiles: readonly IndexedFile[],
  diagnostics: IndexerDiagnostic[],
): void {
  const fileNodes = sortNodes(indexedFiles.map((file) => createFileNode(file.filePath, file.fileId)));
  addNodes(graph, fileNodes, diagnostics);
}

function addSymbolNodes(
  graph: Graph,
  indexedFiles: readonly IndexedFile[],
  diagnostics: IndexerDiagnostic[],
): void {
  const symbolNodes = sortNodes(indexedFiles.flatMap((file) => file.symbols.map((symbol) => symbol.node)));
  addNodes(graph, symbolNodes, diagnostics);
}

function addNodes(graph: Graph, nodes: readonly Node[], diagnostics: IndexerDiagnostic[]): void {
  const seen = new Set<string>();
  for (const node of nodes) {
    if (seen.has(node.id)) {
      diagnostics.push({
        code: "DUPLICATE_NODE_ID",
        severity: "warning",
        message: `Skipped duplicate node '${node.id}'.`,
        id: node.id,
      });
      continue;
    }
    seen.add(node.id);
    graph.addNode(node);
  }
}

function addEdges(
  graph: Graph,
  edges: RelationshipExtractionResult["edges"],
  diagnostics: IndexerDiagnostic[],
): void {
  const seen = new Set<string>();
  for (const edge of edges) {
    if (seen.has(edge.id)) {
      diagnostics.push({
        code: "DUPLICATE_EDGE_ID",
        severity: "warning",
        message: `Skipped duplicate edge '${edge.id}'.`,
        id: edge.id,
      });
      continue;
    }
    seen.add(edge.id);
    graph.addEdge(edge);
  }
}

function createFileNode(filePath: string, fileId: NodeId): Node {
  return {
    id: fileId,
    kind: "File",
    metadata: {
      path: filePath,
      extension: path.posix.extname(filePath),
      is_external: false,
    },
  };
}

function formatValidationErrors(validation: ValidationResult): string {
  const messages = validation.issues.map((issue) => {
    const idSuffix = issue.id ? ` [${issue.id}]` : "";
    return `${issue.code}${idSuffix}: ${issue.message}`;
  });

  return `Graph validation failed with ${validation.issues.length} issue(s):\n${messages.join("\n")}`;
}

function toIndexerDiagnostic(diagnostic: RelationshipDiagnostic): IndexerDiagnostic {
  return {
    code: diagnostic.code,
    severity: "warning",
    message: diagnostic.message,
    filePath: diagnostic.filePath,
    line: diagnostic.line,
    column: diagnostic.column,
  };
}

function compareDiagnostics(left: IndexerDiagnostic, right: IndexerDiagnostic): number {
  return (
    compareText(left.filePath ?? "", right.filePath ?? "")
    || compareNumber(left.line ?? 0, right.line ?? 0)
    || compareNumber(left.column ?? 0, right.column ?? 0)
    || compareText(left.code, right.code)
    || compareText(left.id ?? "", right.id ?? "")
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

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  return "Unknown error.";
}
