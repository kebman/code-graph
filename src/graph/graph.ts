import {
  DuplicateEdgeIdError,
  DuplicateNodeIdError,
  InvalidEdgeError,
  InvalidNodeError,
  MissingNodeError,
} from "./errors";
import { assertCanonicalEdgeId, assertCanonicalNodeIdForKind, makeFileNodeId } from "./ids";
import { normalizePath } from "./normalize";
import { compareEdges, sortEdges, sortNodes } from "./order";
import { validateGraph } from "./validate";
import {
  EDGE_KINDS,
  NODE_KINDS,
  type Edge,
  type EdgeId,
  type GraphStats,
  type Node,
  type NodeId,
  type ValidationResult,
} from "./types";

/**
 * Minimal in-memory graph container.
 * References:
 * - docs/architecture/graph-model.md
 * - docs/architecture/invariants.md
 * - docs/architecture/id-and-normalization.md
 */
export class Graph {
  private readonly nodeById = new Map<NodeId, Node>();
  private readonly edgeById = new Map<EdgeId, Edge>();
  private readonly outEdgeIdsByNode = new Map<NodeId, Set<EdgeId>>();
  private readonly inEdgeIdsByNode = new Map<NodeId, Set<EdgeId>>();

  public addNode(node: Node): void {
    if (this.nodeById.has(node.id)) {
      throw new DuplicateNodeIdError(node.id);
    }

    assertCanonicalNodeIdForKind(node);
    this.assertNodeInvariants(node);

    this.nodeById.set(node.id, node);
  }

  public addEdge(edge: Edge): void {
    if (this.edgeById.has(edge.id)) {
      throw new DuplicateEdgeIdError(edge.id);
    }

    if (!this.nodeById.has(edge.from_id)) {
      throw new MissingNodeError(edge.from_id, "source");
    }

    if (!this.nodeById.has(edge.to_id)) {
      throw new MissingNodeError(edge.to_id, "target");
    }

    assertCanonicalEdgeId(edge);

    if (edge.weight !== undefined && !Number.isFinite(edge.weight)) {
      throw new InvalidEdgeError(`Edge '${edge.id}' has non-finite weight.`, edge.id);
    }

    this.edgeById.set(edge.id, edge);
    this.linkOut(edge.from_id, edge.id);
    this.linkIn(edge.to_id, edge.id);
  }

  public getNode(id: NodeId): Node | undefined {
    return this.nodeById.get(id);
  }

  public getEdge(id: EdgeId): Edge | undefined {
    return this.edgeById.get(id);
  }

  /** Deterministic order: kind, then id. */
  public nodes(): Node[] {
    return sortNodes([...this.nodeById.values()]);
  }

  /** Deterministic order: kind, from_id, to_id, then id. */
  public edges(): Edge[] {
    return sortEdges([...this.edgeById.values()]);
  }

  /** Deterministic order: same as edges(). */
  public outEdges(sourceId: NodeId): Edge[] {
    const edgeIds = this.outEdgeIdsByNode.get(sourceId);
    if (!edgeIds) {
      return [];
    }

    const foundEdges: Edge[] = [];
    for (const edgeId of edgeIds) {
      const edge = this.edgeById.get(edgeId);
      if (edge) {
        foundEdges.push(edge);
      }
    }

    foundEdges.sort(compareEdges);
    return foundEdges;
  }

  /** Deterministic order: same as edges(). */
  public inEdges(targetId: NodeId): Edge[] {
    const edgeIds = this.inEdgeIdsByNode.get(targetId);
    if (!edgeIds) {
      return [];
    }

    const foundEdges: Edge[] = [];
    for (const edgeId of edgeIds) {
      const edge = this.edgeById.get(edgeId);
      if (edge) {
        foundEdges.push(edge);
      }
    }

    foundEdges.sort(compareEdges);
    return foundEdges;
  }

  public stats(): GraphStats {
    const nodeKinds = Object.fromEntries(NODE_KINDS.map((kind) => [kind, 0])) as Record<
      (typeof NODE_KINDS)[number],
      number
    >;
    const edgeKinds = Object.fromEntries(EDGE_KINDS.map((kind) => [kind, 0])) as Record<
      (typeof EDGE_KINDS)[number],
      number
    >;

    for (const node of this.nodeById.values()) {
      nodeKinds[node.kind] += 1;
    }

    for (const edge of this.edgeById.values()) {
      edgeKinds[edge.kind] += 1;
    }

    return {
      nodeCount: this.nodeById.size,
      edgeCount: this.edgeById.size,
      nodeKinds,
      edgeKinds,
    };
  }

  /** Convenience wrapper for deterministic validation stages. */
  public validate(): ValidationResult {
    return validateGraph(this);
  }

  private assertNodeInvariants(node: Node): void {
    if (node.kind === "File") {
      const path = node.metadata.path;
      if (typeof path !== "string") {
        throw new InvalidNodeError(`File node '${node.id}' is missing metadata.path string.`, node.id);
      }

      const normalized = normalizePath(path);
      if (normalized !== path) {
        throw new InvalidNodeError(
          `File node '${node.id}' metadata.path must already be normalized.`,
          node.id,
        );
      }

      const expectedId = makeFileNodeId(path);
      if (expectedId !== node.id) {
        throw new InvalidNodeError(
          `File node '${node.id}' does not match canonical id '${expectedId}'.`,
          node.id,
        );
      }
    }
  }

  private linkOut(nodeId: NodeId, edgeId: EdgeId): void {
    const edges = this.outEdgeIdsByNode.get(nodeId);
    if (edges) {
      edges.add(edgeId);
      return;
    }

    this.outEdgeIdsByNode.set(nodeId, new Set([edgeId]));
  }

  private linkIn(nodeId: NodeId, edgeId: EdgeId): void {
    const edges = this.inEdgeIdsByNode.get(nodeId);
    if (edges) {
      edges.add(edgeId);
      return;
    }

    this.inEdgeIdsByNode.set(nodeId, new Set([edgeId]));
  }
}
