import * as path from "node:path";
import * as ts from "typescript";
import { Graph } from "../graph/graph";
import { makeFileNodeId } from "../graph/ids";
import { sortNodes } from "../graph/order";
import type { Node, NodeId, ValidationResult } from "../graph/types";
import { parseFile } from "./ast-parser";
import { scanTypeScriptFiles, type ScanTypeScriptFilesOptions } from "./file-scanner";
import {
  extractRelationships,
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
  readonly sourceFiles: readonly ts.SourceFile[];
  readonly relationships: RelationshipExtractionResult;
}

/**
 * Build a deterministic structural graph for repository TypeScript files.
 */
export function indexRepository(options: IndexRepositoryOptions = {}): IndexRepositoryResult {
  const rootDir = path.resolve(options.rootDir ?? process.cwd());
  const files = scanTypeScriptFiles({
    rootDir,
    excludedDirectories: options.excludedDirectories,
  });

  const indexedFiles: IndexedFile[] = files.map((filePath) => {
    const fileId = makeFileNodeId(filePath);
    const absolutePath = path.resolve(rootDir, filePath);
    const sourceFile = parseFile(absolutePath);
    const symbols = extractSymbols({ sourceFile, filePath, fileId });

    return {
      filePath,
      fileId,
      sourceFile,
      symbols,
    };
  });

  const graph = new Graph();
  addFileNodes(graph, indexedFiles);
  addSymbolNodes(graph, indexedFiles);

  const relationshipFiles: RelationshipExtractionFile[] = indexedFiles.map((file) => ({
    filePath: file.filePath,
    fileId: file.fileId,
    sourceFile: file.sourceFile,
    symbols: file.symbols,
  }));
  const relationships = extractRelationships(relationshipFiles);

  for (const edge of relationships.edges) {
    graph.addEdge(edge);
  }

  const validation = graph.validate();
  if (!validation.ok) {
    throw new Error(formatValidationErrors(validation));
  }

  return {
    graph,
    validation,
    files,
    sourceFiles: indexedFiles.map((file) => file.sourceFile),
    relationships,
  };
}

function addFileNodes(graph: Graph, indexedFiles: readonly IndexedFile[]): void {
  const fileNodes = sortNodes(indexedFiles.map((file) => createFileNode(file.filePath, file.fileId)));
  for (const fileNode of fileNodes) {
    graph.addNode(fileNode);
  }
}

function addSymbolNodes(graph: Graph, indexedFiles: readonly IndexedFile[]): void {
  const symbolNodes = sortNodes(indexedFiles.flatMap((file) => file.symbols.map((symbol) => symbol.node)));
  for (const symbolNode of symbolNodes) {
    graph.addNode(symbolNode);
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
