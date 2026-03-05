import type { EdgeId, NodeId } from "./types";

export class GraphError extends Error {
  public readonly code: string;

  public constructor(code: string, message: string) {
    super(message);
    this.name = new.target.name;
    this.code = code;
  }
}

export class DuplicateNodeIdError extends GraphError {
  public readonly nodeId: NodeId;

  public constructor(nodeId: NodeId) {
    super("DUPLICATE_NODE_ID", `Node with id '${nodeId}' already exists.`);
    this.nodeId = nodeId;
  }
}

export class DuplicateEdgeIdError extends GraphError {
  public readonly edgeId: EdgeId;

  public constructor(edgeId: EdgeId) {
    super("DUPLICATE_EDGE_ID", `Edge with id '${edgeId}' already exists.`);
    this.edgeId = edgeId;
  }
}

export class MissingNodeError extends GraphError {
  public readonly nodeId: NodeId;

  public constructor(nodeId: NodeId, context: "source" | "target" | "lookup") {
    super("MISSING_NODE", `Missing ${context} node '${nodeId}'.`);
    this.nodeId = nodeId;
  }
}

export class InvalidPathError extends GraphError {
  public constructor(message: string) {
    super("INVALID_PATH", message);
  }
}

export class InvalidIdError extends GraphError {
  public constructor(message: string) {
    super("INVALID_ID", message);
  }
}

export class InvalidNodeError extends GraphError {
  public readonly nodeId?: NodeId;

  public constructor(message: string, nodeId?: NodeId) {
    super("INVALID_NODE", message);
    this.nodeId = nodeId;
  }
}

export class InvalidEdgeError extends GraphError {
  public readonly edgeId?: EdgeId;

  public constructor(message: string, edgeId?: EdgeId) {
    super("INVALID_EDGE", message);
    this.edgeId = edgeId;
  }
}
