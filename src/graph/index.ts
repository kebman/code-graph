export { Graph } from "./graph";

export {
  asEdgeId,
  asNodeId,
  assertCanonicalEdgeId,
  assertCanonicalNodeIdForKind,
  makeEdgeId,
  makeFileNodeId,
  makeSymbolNodeId,
  makeTypeNodeId,
  nodeKindFromId,
} from "./ids";

export { joinPath, normalizePath, splitPath } from "./normalize";
export { compareEdges, compareNodes, sortEdges, sortNodes } from "./order";
export { validateGraph } from "./validate";

export {
  DuplicateEdgeIdError,
  DuplicateNodeIdError,
  GraphError,
  InvalidEdgeError,
  InvalidIdError,
  InvalidNodeError,
  InvalidPathError,
  MissingNodeError,
} from "./errors";

export {
  EDGE_KINDS,
  NODE_KINDS,
  type Edge,
  type EdgeId,
  type EdgeKind,
  type GraphStats,
  type JsonArray,
  type JsonObject,
  type JsonValue,
  type Node,
  type NodeId,
  type NodeKind,
  type ValidationIssue,
  type ValidationResult,
} from "./types";
