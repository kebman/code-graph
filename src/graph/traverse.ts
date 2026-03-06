import { InvalidTraversalOptionsError } from "./errors";
import { compareEdges } from "./order";
import type { Edge, EdgeId, EdgeKind, NodeId } from "./types";

export type TraversalDirection = "out" | "in";
export type TraversalStrategy = "bfs" | "dfs";

export interface TraversalPath {
  readonly nodeIds: readonly NodeId[];
  readonly edgeIds: readonly EdgeId[];
  readonly depth: number;
  readonly endedBy: "leaf" | "cycle" | "depth_limit" | "path_limit";
}

export interface TraversalTruncation {
  readonly depthLimitReached: boolean;
  readonly nodeLimitReached: boolean;
  readonly edgeLimitReached: boolean;
  readonly pathLimitReached: boolean;
}

export interface TraversalResult {
  readonly startId: NodeId;
  readonly direction: TraversalDirection;
  readonly strategy: TraversalStrategy;
  readonly maxDepth: number;
  readonly visitedNodeIds: readonly NodeId[];
  readonly visitedEdgeIds: readonly EdgeId[];
  readonly paths: readonly TraversalPath[];
  readonly cycleNodeIds: readonly NodeId[];
  readonly cycleEdgeIds: readonly EdgeId[];
  readonly truncation: TraversalTruncation;
}

export interface TraversalOptions {
  /** Inclusive traversal depth bound (0 means start node only). */
  readonly maxDepth: number;
  /** Deterministic expansion strategy; defaults to bfs. */
  readonly strategy?: TraversalStrategy;
  /** Maximum distinct nodes visited before truncation; defaults to 10_000. */
  readonly maxNodes?: number;
  /** Maximum distinct edges visited before truncation; defaults to 20_000. */
  readonly maxEdges?: number;
  /** When > 0, capture bounded path evidence in deterministic order. */
  readonly maxPaths?: number;
}

interface TraversableGraph {
  outEdges(sourceId: NodeId): Edge[];
  inEdges(targetId: NodeId): Edge[];
}

interface FrontierState {
  readonly nodeId: NodeId;
  readonly depth: number;
  readonly pathNodeIds: readonly NodeId[];
  readonly pathEdgeIds: readonly EdgeId[];
}

const DEFAULT_MAX_NODES = 10_000;
const DEFAULT_MAX_EDGES = 20_000;
const DEFAULT_MAX_PATHS = 0;

/**
 * Deterministic forward traversal primitive.
 * References:
 * - docs/architecture/graph-traversal-rules.md
 * - docs/architecture/invariants.md
 */
export function traverseOut(
  graph: TraversableGraph,
  startId: NodeId,
  edgeKinds: readonly EdgeKind[],
  opts: TraversalOptions,
): TraversalResult {
  return traverse(graph, "out", startId, edgeKinds, opts);
}

/**
 * Deterministic reverse traversal primitive.
 * References:
 * - docs/architecture/graph-traversal-rules.md
 * - docs/architecture/invariants.md
 */
export function traverseIn(
  graph: TraversableGraph,
  startId: NodeId,
  edgeKinds: readonly EdgeKind[],
  opts: TraversalOptions,
): TraversalResult {
  return traverse(graph, "in", startId, edgeKinds, opts);
}

function traverse(
  graph: TraversableGraph,
  direction: TraversalDirection,
  startId: NodeId,
  edgeKinds: readonly EdgeKind[],
  opts: TraversalOptions,
): TraversalResult {
  const maxDepth = assertBoundedInteger(opts.maxDepth, "maxDepth", 0);
  const strategy = opts.strategy ?? "bfs";
  const maxNodes = assertBoundedInteger(opts.maxNodes ?? DEFAULT_MAX_NODES, "maxNodes", 1);
  const maxEdges = assertBoundedInteger(opts.maxEdges ?? DEFAULT_MAX_EDGES, "maxEdges", 1);
  const maxPaths = assertBoundedInteger(opts.maxPaths ?? DEFAULT_MAX_PATHS, "maxPaths", 0);

  const acceptedKinds = new Set(edgeKinds);

  const visitedNodeSet = new Set<NodeId>();
  const visitedEdgeSet = new Set<EdgeId>();
  const cycleNodeSet = new Set<NodeId>();
  const cycleEdgeSet = new Set<EdgeId>();

  const paths: TraversalPath[] = [];
  const seenPathSignatures = new Set<string>();

  let depthLimitReached = false;
  let nodeLimitReached = false;
  let edgeLimitReached = false;
  let pathLimitReached = false;

  const frontier: FrontierState[] = [
    {
      nodeId: startId,
      depth: 0,
      pathNodeIds: [startId],
      pathEdgeIds: [],
    },
  ];

  while (frontier.length > 0) {
    const state = strategy === "dfs" ? frontier.pop() : frontier.shift();
    if (!state) {
      break;
    }

    if (!visitedNodeSet.has(state.nodeId)) {
      if (visitedNodeSet.size >= maxNodes) {
        nodeLimitReached = true;
        break;
      }
      visitedNodeSet.add(state.nodeId);
    }

    if (state.depth === maxDepth) {
      const edgesAtDepth = filteredEdges(graph, direction, state.nodeId, acceptedKinds);
      if (edgesAtDepth.length > 0) {
        depthLimitReached = true;
      }
      maybeCapturePath(paths, seenPathSignatures, state, "depth_limit", maxPaths, () => {
        pathLimitReached = true;
      });
      continue;
    }

    const nextEdges = filteredEdges(graph, direction, state.nodeId, acceptedKinds);
    if (nextEdges.length === 0) {
      maybeCapturePath(paths, seenPathSignatures, state, "leaf", maxPaths, () => {
        pathLimitReached = true;
      });
      continue;
    }

    const nextStates: FrontierState[] = [];
    for (const edge of nextEdges) {
      if (!visitedEdgeSet.has(edge.id)) {
        if (visitedEdgeSet.size >= maxEdges) {
          edgeLimitReached = true;
          break;
        }
        visitedEdgeSet.add(edge.id);
      }

      const nextNodeId = direction === "out" ? edge.to_id : edge.from_id;

      if (state.pathNodeIds.includes(nextNodeId)) {
        cycleNodeSet.add(nextNodeId);
        cycleEdgeSet.add(edge.id);
        maybeCapturePath(
          paths,
          seenPathSignatures,
          {
            nodeId: nextNodeId,
            depth: state.depth + 1,
            pathNodeIds: [...state.pathNodeIds, nextNodeId],
            pathEdgeIds: [...state.pathEdgeIds, edge.id],
          },
          "cycle",
          maxPaths,
          () => {
            pathLimitReached = true;
          },
        );
        continue;
      }

      nextStates.push({
        nodeId: nextNodeId,
        depth: state.depth + 1,
        pathNodeIds: [...state.pathNodeIds, nextNodeId],
        pathEdgeIds: [...state.pathEdgeIds, edge.id],
      });
    }

    if (strategy === "dfs") {
      // Push in reverse so stack pop visits the lowest-sorted edge first.
      for (let index = nextStates.length - 1; index >= 0; index -= 1) {
        frontier.push(nextStates[index]);
      }
    } else {
      for (const nextState of nextStates) {
        frontier.push(nextState);
      }
    }

    if (edgeLimitReached) {
      break;
    }
  }

  const visitedNodeIds = [...visitedNodeSet].sort(compareText);
  const visitedEdgeIds = [...visitedEdgeSet].sort(compareText);
  const cycleNodeIds = [...cycleNodeSet].sort(compareText);
  const cycleEdgeIds = [...cycleEdgeSet].sort(compareText);

  const sortedPaths = [...paths].sort(comparePaths);

  return {
    startId,
    direction,
    strategy,
    maxDepth,
    visitedNodeIds,
    visitedEdgeIds,
    paths: sortedPaths,
    cycleNodeIds,
    cycleEdgeIds,
    truncation: {
      depthLimitReached,
      nodeLimitReached,
      edgeLimitReached,
      pathLimitReached,
    },
  };
}

function filteredEdges(
  graph: TraversableGraph,
  direction: TraversalDirection,
  nodeId: NodeId,
  acceptedKinds: ReadonlySet<EdgeKind>,
): Edge[] {
  const edges = direction === "out" ? graph.outEdges(nodeId) : graph.inEdges(nodeId);
  return edges.filter((edge) => acceptedKinds.has(edge.kind)).sort(compareEdges);
}

function maybeCapturePath(
  paths: TraversalPath[],
  seenSignatures: Set<string>,
  state: FrontierState,
  endedBy: TraversalPath["endedBy"],
  maxPaths: number,
  onLimit: () => void,
): void {
  if (maxPaths === 0) {
    return;
  }

  const signature = `${state.pathNodeIds.join("->")}|${state.pathEdgeIds.join("->")}|${endedBy}`;
  if (seenSignatures.has(signature)) {
    return;
  }

  if (paths.length >= maxPaths) {
    onLimit();
    return;
  }

  seenSignatures.add(signature);
  paths.push({
    nodeIds: [...state.pathNodeIds],
    edgeIds: [...state.pathEdgeIds],
    depth: state.depth,
    endedBy,
  });
}

function comparePaths(left: TraversalPath, right: TraversalPath): number {
  return compareText(left.nodeIds.join("|"), right.nodeIds.join("|"))
    || compareText(left.edgeIds.join("|"), right.edgeIds.join("|"))
    || compareText(left.endedBy, right.endedBy)
    || left.depth - right.depth;
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

function assertBoundedInteger(value: number, name: string, min: number): number {
  if (!Number.isInteger(value) || value < min) {
    throw new InvalidTraversalOptionsError(`${name} must be an integer >= ${min}.`);
  }
  return value;
}
