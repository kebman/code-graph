import type { Edge, Node } from "./types";

function compareText(a: string, b: string): number {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
}

/**
 * Deterministic node comparator.
 * Ordering aligns with docs/architecture/id-and-normalization.md:
 * kind, then id.
 */
export function compareNodes(a: Node, b: Node): number {
  const byKind = compareText(a.kind, b.kind);
  if (byKind !== 0) {
    return byKind;
  }
  return compareText(a.id, b.id);
}

/**
 * Deterministic edge comparator.
 * Ordering aligns with docs/architecture/id-and-normalization.md:
 * kind, from_id, to_id, then id.
 */
export function compareEdges(a: Edge, b: Edge): number {
  const byKind = compareText(a.kind, b.kind);
  if (byKind !== 0) {
    return byKind;
  }

  const byFrom = compareText(a.from_id, b.from_id);
  if (byFrom !== 0) {
    return byFrom;
  }

  const byTo = compareText(a.to_id, b.to_id);
  if (byTo !== 0) {
    return byTo;
  }

  return compareText(a.id, b.id);
}

export function sortNodes(nodes: readonly Node[]): Node[] {
  return [...nodes].sort(compareNodes);
}

export function sortEdges(edges: readonly Edge[]): Edge[] {
  return [...edges].sort(compareEdges);
}
