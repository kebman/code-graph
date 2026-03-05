/**
 * Canonical graph core types for v1.
 * References:
 * - docs/architecture/graph-model.md
 * - docs/architecture/graph-node-kinds.md
 * - docs/architecture/graph-edge-kinds.md
 * - docs/architecture/graph-storage-model.md
 */

export const NODE_KINDS = ["File", "Symbol", "Type", "Runtime", "Sink"] as const;

export type NodeKind = (typeof NODE_KINDS)[number];

export const EDGE_KINDS = [
  "IMPORTS",
  "CONTAINS",
  "REFERENCES",
  "CALLS",
  "INSTANTIATES",
  "ACCEPTS_TYPE",
  "RETURNS_TYPE",
  "WRITES_DB",
  "RESPONDS_WITH",
  "VALUE_FLOW",
  "BUILDS",
  "RUNS",
  "DEPENDS_ON",
  "MOUNTS",
] as const;

export type EdgeKind = (typeof EDGE_KINDS)[number];

type Brand<T, TBrand extends string> = T & { readonly __brand: TBrand };

/** Stable node identifier string. See docs/architecture/id-and-normalization.md */
export type NodeId = Brand<string, "NodeId">;

/** Stable edge identifier string. See docs/architecture/id-and-normalization.md */
export type EdgeId = Brand<string, "EdgeId">;

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export type JsonObject = { readonly [key: string]: JsonValue };
export type JsonArray = readonly JsonValue[];

/**
 * Storage-neutral node record (nodes table logical shape).
 * See docs/architecture/graph-model.md#2-core-entity-types-nodes
 */
export interface Node {
  readonly id: NodeId;
  readonly kind: NodeKind;
  readonly metadata: JsonObject;
  readonly created_at?: string;
  readonly updated_at?: string;
}

/**
 * Storage-neutral edge record (edges table logical shape).
 * See docs/architecture/graph-model.md#3-edge-model
 */
export interface Edge {
  readonly id: EdgeId;
  readonly from_id: NodeId;
  readonly to_id: NodeId;
  readonly kind: EdgeKind;
  readonly metadata: JsonObject;
  readonly weight?: number;
  readonly created_at?: string;
  readonly updated_at?: string;
}

/** Deterministic graph summary used by higher layers. */
export interface GraphStats {
  readonly nodeCount: number;
  readonly edgeCount: number;
  readonly nodeKinds: Readonly<Record<NodeKind, number>>;
  readonly edgeKinds: Readonly<Record<EdgeKind, number>>;
}

/**
 * Lightweight issue type for future validation phase integration.
 * See docs/architecture/graph-validation.md
 */
export interface ValidationIssue {
  readonly code: string;
  readonly message: string;
  readonly entity: "graph" | "node" | "edge";
  readonly id?: string;
}
