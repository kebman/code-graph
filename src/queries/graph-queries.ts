import { normalizePath } from "../graph/normalize";
import type { Graph } from "../graph/graph";
import type { Node, NodeId } from "../graph/types";

/**
 * Return File nodes that import the provided file path.
 */
export function findImporters(graph: Graph, filePath: string): Node[] {
  const fileNode = findFileNodeByPath(graph, filePath);
  if (!fileNode) {
    return [];
  }

  const importers: Node[] = [];
  for (const edge of graph.inEdges(fileNode.id)) {
    if (edge.kind !== "IMPORTS") {
      continue;
    }

    const source = graph.getNode(edge.from_id);
    if (source?.kind === "File") {
      importers.push(source);
    }
  }

  return dedupeAndSortById(importers);
}

/**
 * Return Symbol nodes contained by the provided file path.
 */
export function findContainedSymbols(graph: Graph, filePath: string): Node[] {
  const fileNode = findFileNodeByPath(graph, filePath);
  if (!fileNode) {
    return [];
  }

  const symbols: Node[] = [];
  for (const edge of graph.outEdges(fileNode.id)) {
    if (edge.kind !== "CONTAINS") {
      continue;
    }

    const target = graph.getNode(edge.to_id);
    if (target?.kind === "Symbol") {
      symbols.push(target);
    }
  }

  return dedupeAndSortById(symbols);
}

/**
 * Return Symbol nodes that call any Symbol matching `symbolName`.
 */
export function findCallers(graph: Graph, symbolName: string): Node[] {
  const normalizedName = symbolName.trim();
  if (normalizedName.length === 0) {
    return [];
  }

  const targetSymbols = graph
    .nodes()
    .filter((node) => node.kind === "Symbol" && node.metadata.name === normalizedName);

  if (targetSymbols.length === 0) {
    return [];
  }

  const callers: Node[] = [];
  for (const target of targetSymbols) {
    for (const edge of graph.inEdges(target.id)) {
      if (edge.kind !== "CALLS") {
        continue;
      }

      const source = graph.getNode(edge.from_id);
      if (source?.kind === "Symbol") {
        callers.push(source);
      }
    }
  }

  return dedupeAndSortById(callers);
}

/**
 * Return File nodes that the provided file path depends on via IMPORTS edges.
 */
export function findDependencies(graph: Graph, filePath: string): Node[] {
  const fileNode = findFileNodeByPath(graph, filePath);
  if (!fileNode) {
    return [];
  }

  const dependencies: Node[] = [];
  for (const edge of graph.outEdges(fileNode.id)) {
    if (edge.kind !== "IMPORTS") {
      continue;
    }

    const target = graph.getNode(edge.to_id);
    if (target?.kind === "File") {
      dependencies.push(target);
    }
  }

  return dedupeAndSortById(dependencies);
}

function findFileNodeByPath(graph: Graph, filePath: string): Node | undefined {
  const normalized = normalizePath(filePath);

  for (const node of graph.nodes()) {
    if (node.kind !== "File") {
      continue;
    }

    if (node.metadata.path === normalized) {
      return node;
    }
  }

  return undefined;
}

function dedupeAndSortById(nodes: readonly Node[]): Node[] {
  const byId = new Map<NodeId, Node>();
  for (const node of nodes) {
    byId.set(node.id, node);
  }

  return [...byId.values()].sort((left, right) => compareText(left.id, right.id));
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
