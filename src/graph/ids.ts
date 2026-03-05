import { InvalidIdError } from "./errors";
import { normalizePath } from "./normalize";
import type { Edge, EdgeId, EdgeKind, Node, NodeId, NodeKind } from "./types";

const FILE_PREFIX = "file::";
const SYMBOL_PREFIX = "symbol::";
const TYPE_PREFIX = "type::";
const RUNTIME_PREFIX = "runtime::";
const SINK_PREFIX = "sink::";
const EDGE_PREFIX = "edge::";

/**
 * Canonical file node ID: file::<normalized_path>
 * Reference: docs/architecture/id-and-normalization.md
 */
export function makeFileNodeId(normalizedPath: string): NodeId {
  const canonicalPath = normalizePath(normalizedPath);
  return asNodeId(`${FILE_PREFIX}${canonicalPath}`);
}

/**
 * Canonical symbol node ID: symbol::<file_id>::<symbol_name>::<symbol_kind>
 *
 * `optionalQualifier` is required at runtime to avoid non-canonical IDs.
 * It is kept optional in the signature for compatibility with early callers.
 */
export function makeSymbolNodeId(
  fileId: NodeId,
  exportedName: string,
  optionalQualifier?: string,
): NodeId {
  const qualifier = normalizeIdPart(optionalQualifier, "symbol qualifier");
  const name = normalizeIdPart(exportedName, "exported symbol name");
  assertNodeIdPrefix(fileId, FILE_PREFIX, "fileId");
  return asNodeId(`${SYMBOL_PREFIX}${fileId}::${name}::${qualifier}`);
}

/** Canonical type node ID: type::<file_id>::<type_name> */
export function makeTypeNodeId(fileId: NodeId, typeName: string): NodeId {
  const name = normalizeIdPart(typeName, "type name");
  assertNodeIdPrefix(fileId, FILE_PREFIX, "fileId");
  return asNodeId(`${TYPE_PREFIX}${fileId}::${name}`);
}

/**
 * Canonical edge ID: edge::<kind>::<from_id>::<to_id>::none
 * Reference: docs/architecture/id-and-normalization.md
 */
export function makeEdgeId(sourceId: NodeId, edgeKind: EdgeKind, targetId: NodeId): EdgeId {
  assertNonEmpty(String(sourceId), "sourceId");
  assertNonEmpty(String(targetId), "targetId");
  return asEdgeId(`${EDGE_PREFIX}${edgeKind}::${sourceId}::${targetId}::none`);
}

/** Parse node kind from ID prefix when available. */
export function nodeKindFromId(id: NodeId): NodeKind | null {
  const raw = String(id);
  if (raw.startsWith(FILE_PREFIX)) {
    return "File";
  }
  if (raw.startsWith(SYMBOL_PREFIX)) {
    return "Symbol";
  }
  if (raw.startsWith(TYPE_PREFIX)) {
    return "Type";
  }
  if (raw.startsWith(RUNTIME_PREFIX)) {
    return "Runtime";
  }
  if (raw.startsWith(SINK_PREFIX)) {
    return "Sink";
  }
  return null;
}

/** Runtime check used by Graph.addNode for deterministic ID hygiene. */
export function assertCanonicalNodeIdForKind(node: Node): void {
  const actualKind = nodeKindFromId(node.id);
  if (actualKind !== node.kind) {
    throw new InvalidIdError(
      `Node id '${node.id}' is not canonical for kind '${node.kind}'.`,
    );
  }

  if (node.kind === "File") {
    const path = String(node.id).slice(FILE_PREFIX.length);
    const normalized = normalizePath(path);
    if (normalized !== path) {
      throw new InvalidIdError(`File node id '${node.id}' does not contain normalized path.`);
    }
  }

  if (node.kind === "Symbol") {
    // TODO(needs decision): tighten symbol-id structural checks once symbol qualifier enum is finalized.
    const parts = String(node.id).split("::");
    if (parts.length < 6) {
      throw new InvalidIdError(`Symbol node id '${node.id}' is incomplete.`);
    }
  }
}

/** Runtime check used by Graph.addEdge for deterministic ID hygiene. */
export function assertCanonicalEdgeId(edge: Edge): void {
  const expected = makeEdgeId(edge.from_id, edge.kind, edge.to_id);
  if (edge.id !== expected) {
    throw new InvalidIdError(
      `Edge id '${edge.id}' is not canonical. Expected '${expected}'.`,
    );
  }
}

export function asNodeId(value: string): NodeId {
  assertNonEmpty(value, "node id");
  return value as NodeId;
}

export function asEdgeId(value: string): EdgeId {
  assertNonEmpty(value, "edge id");
  return value as EdgeId;
}

function normalizeIdPart(value: string | undefined, label: string): string {
  if (value === undefined) {
    throw new InvalidIdError(`Missing ${label}.`);
  }

  const normalized = value.trim().normalize("NFC");
  assertNonEmpty(normalized, label);
  if (normalized.includes("::")) {
    throw new InvalidIdError(`${label} cannot contain '::'.`);
  }
  return normalized;
}

function assertNodeIdPrefix(nodeId: NodeId, prefix: string, label: string): void {
  const value = String(nodeId);
  if (!value.startsWith(prefix)) {
    throw new InvalidIdError(`${label} must start with '${prefix}'. Got '${value}'.`);
  }
}

function assertNonEmpty(value: string, label: string): void {
  if (value.trim().length === 0) {
    throw new InvalidIdError(`${label} cannot be empty.`);
  }
}
