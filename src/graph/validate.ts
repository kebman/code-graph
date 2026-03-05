import { assertCanonicalEdgeId, assertCanonicalNodeIdForKind, makeFileNodeId } from "./ids";
import { normalizePath } from "./normalize";
import { compareEdges, compareNodes } from "./order";
import {
  EDGE_KINDS,
  NODE_KINDS,
  type Edge,
  type GraphStats,
  type JsonObject,
  type Node,
  type NodeId,
  type ValidationIssue,
  type ValidationResult,
} from "./types";

interface ReadonlyGraph {
  nodes(): Node[];
  edges(): Edge[];
  stats?(): GraphStats;
}

const NODE_KIND_SET = new Set<string>(NODE_KINDS);
const EDGE_KIND_SET = new Set<string>(EDGE_KINDS);

const EDGE_KIND_RELATION_RULES: Readonly<Record<string, readonly [readonly string[], readonly string[]]>> = {
  IMPORTS: [["File"], ["File"]],
  CONTAINS: [["File"], ["Symbol"]],
  REFERENCES: [["Symbol"], ["Symbol"]],
  CALLS: [["Symbol"], ["Symbol"]],
  INSTANTIATES: [["Symbol"], ["Symbol"]],
  ACCEPTS_TYPE: [["Symbol"], ["Type", "Symbol"]],
  RETURNS_TYPE: [["Symbol"], ["Type", "Symbol"]],
  WRITES_DB: [["Symbol"], ["Sink"]],
  RESPONDS_WITH: [["Symbol"], ["Sink"]],
  VALUE_FLOW: [["Symbol"], ["Symbol"]],
  BUILDS: [["Runtime"], ["Runtime"]],
  RUNS: [["Runtime"], ["Runtime"]],
  DEPENDS_ON: [["Runtime"], ["Runtime"]],
  MOUNTS: [["Runtime"], ["File"]],
};

/**
 * Deterministic graph validation pipeline.
 * References:
 * - docs/architecture/graph-validation.md
 * - docs/architecture/invariants.md
 * - docs/architecture/graph-model.md
 */
export function validateGraph(graph: ReadonlyGraph): ValidationResult {
  const nodes = graph.nodes();
  const edges = graph.edges();
  const issues: ValidationIssue[] = [];

  const nodeById = validateNodes(nodes, issues);
  validateEdges(edges, nodeById, issues);
  validateRelationships(edges, nodeById, issues);
  validateInvariants(nodes, edges, nodeById, issues);

  const sortedIssues = sortIssues(issues);
  return {
    ok: sortedIssues.length === 0,
    issues: sortedIssues,
    stats: graph.stats ? graph.stats() : buildStats(nodes, edges),
  };
}

function validateNodes(nodes: readonly Node[], issues: ValidationIssue[]): Map<NodeId, Node> {
  const nodeById = new Map<NodeId, Node>();

  for (const node of nodes) {
    if (nodeById.has(node.id)) {
      issues.push(issue("DUPLICATE_NODE_ID", "node", "node", `Duplicate node id '${node.id}'.`, node.id));
      continue;
    }
    nodeById.set(node.id, node);

    if (!NODE_KIND_SET.has(node.kind)) {
      issues.push(
        issue(
          "INVALID_NODE_KIND",
          "node",
          "node",
          `Invalid node kind '${String(node.kind)}' for node '${node.id}'.`,
          node.id,
        ),
      );
    }

    if (!isObject(node.metadata)) {
      issues.push(issue("INVALID_NODE_METADATA", "node", "node", `Node '${node.id}' metadata must be an object.`, node.id));
      continue;
    }

    validateNodeRequiredFields(node, issues);
  }

  return nodeById;
}

function validateNodeRequiredFields(node: Node, issues: ValidationIssue[]): void {
  if (node.kind === "File") {
    assertMetadataString(node, "path", issues);
    assertMetadataString(node, "extension", issues);
    assertMetadataBoolean(node, "is_external", issues);

    const path = node.metadata.path;
    if (typeof path === "string") {
      try {
        const normalized = normalizePath(path);
        if (normalized !== path) {
          issues.push(
            issue(
              "FILE_PATH_NOT_NORMALIZED",
              "node",
              "node",
              `File node '${node.id}' metadata.path must be normalized.`,
              node.id,
            ),
          );
        }

        const expectedId = makeFileNodeId(path);
        if (expectedId !== node.id) {
          issues.push(
            issue(
              "FILE_ID_MISMATCH",
              "node",
              "node",
              `File node '${node.id}' does not match canonical id '${expectedId}'.`,
              node.id,
            ),
          );
        }
      } catch (error) {
        issues.push(issue("INVALID_FILE_PATH", "node", "node", toErrorMessage(error), node.id));
      }
    }
    return;
  }

  if (node.kind === "Symbol") {
    assertMetadataString(node, "name", issues);
    assertMetadataString(node, "file_id", issues);
    assertMetadataString(node, "symbol_kind", issues);
    assertMetadataBoolean(node, "is_default_export", issues);
    assertMetadataBoolean(node, "is_reexport", issues);
    return;
  }

  if (node.kind === "Type") {
    assertMetadataString(node, "name", issues);
    assertMetadataString(node, "file_id", issues);
    return;
  }

  if (node.kind === "Runtime") {
    assertMetadataString(node, "name", issues);
    assertMetadataString(node, "type", issues);
    return;
  }

  if (node.kind === "Sink") {
    assertMetadataString(node, "category", issues);
    assertMetadataString(node, "file_id", issues);
    const line = node.metadata.line;
    if (typeof line !== "number" || !Number.isInteger(line) || line < 1) {
      issues.push(
        issue(
          "MISSING_REQUIRED_FIELD",
          "node",
          "node",
          `Sink node '${node.id}' metadata.line must be a positive integer.`,
          node.id,
        ),
      );
    }
  }

  // NOTE: Current v1 node kinds are exhaustive. This fallback avoids silent acceptance
  // when malformed data is cast into Node at runtime.
  if (!NODE_KIND_SET.has(node.kind)) {
    return;
  }

}

function validateEdges(
  edges: readonly Edge[],
  nodeById: ReadonlyMap<NodeId, Node>,
  issues: ValidationIssue[],
): void {
  const edgeById = new Map<string, Edge>();
  const duplicateKeys = new Set<string>();

  for (const edge of edges) {
    if (edgeById.has(edge.id)) {
      issues.push(issue("DUPLICATE_EDGE_ID", "edge", "edge", `Duplicate edge id '${edge.id}'.`, edge.id));
    } else {
      edgeById.set(edge.id, edge);
    }

    if (!EDGE_KIND_SET.has(edge.kind)) {
      issues.push(
        issue(
          "INVALID_EDGE_KIND",
          "edge",
          "edge",
          `Invalid edge kind '${String(edge.kind)}' for edge '${edge.id}'.`,
          edge.id,
        ),
      );
    }

    if (!isObject(edge.metadata)) {
      issues.push(issue("INVALID_EDGE_METADATA", "edge", "edge", `Edge '${edge.id}' metadata must be an object.`, edge.id));
    }

    if (edge.weight !== undefined && !Number.isFinite(edge.weight)) {
      issues.push(issue("INVALID_EDGE_WEIGHT", "edge", "edge", `Edge '${edge.id}' has non-finite weight.`, edge.id));
    }

    if (!nodeById.has(edge.from_id)) {
      issues.push(
        issue(
          "MISSING_SOURCE_NODE",
          "edge",
          "edge",
          `Edge '${edge.id}' references missing source node '${edge.from_id}'.`,
          edge.id,
        ),
      );
    }

    if (!nodeById.has(edge.to_id)) {
      issues.push(
        issue(
          "MISSING_TARGET_NODE",
          "edge",
          "edge",
          `Edge '${edge.id}' references missing target node '${edge.to_id}'.`,
          edge.id,
        ),
      );
    }

    const pairKey = `${edge.from_id}|${edge.kind}|${edge.to_id}`;
    if (duplicateKeys.has(pairKey)) {
      issues.push(
        issue(
          "DUPLICATE_EDGE_RELATION",
          "edge",
          "edge",
          `Duplicate relation '${edge.kind}' from '${edge.from_id}' to '${edge.to_id}'.`,
          edge.id,
        ),
      );
    } else {
      duplicateKeys.add(pairKey);
    }
  }
}

function validateRelationships(
  edges: readonly Edge[],
  nodeById: ReadonlyMap<NodeId, Node>,
  issues: ValidationIssue[],
): void {
  for (const edge of edges) {
    const source = nodeById.get(edge.from_id);
    const target = nodeById.get(edge.to_id);
    if (!source || !target) {
      continue;
    }

    const rules = EDGE_KIND_RELATION_RULES[edge.kind];
    if (!rules) {
      continue;
    }

    const [allowedSourceKinds, allowedTargetKinds] = rules;
    if (!allowedSourceKinds.includes(source.kind) || !allowedTargetKinds.includes(target.kind)) {
      issues.push(
        issue(
          "INVALID_EDGE_RELATIONSHIP",
          "relationship",
          "edge",
          `Edge '${edge.id}' kind '${edge.kind}' disallows '${source.kind}' -> '${target.kind}'.`,
          edge.id,
        ),
      );
    }

    validateRuntimeSubtypeRelationships(edge, source, target, issues);
  }
}

function validateRuntimeSubtypeRelationships(
  edge: Edge,
  source: Node,
  target: Node,
  issues: ValidationIssue[],
): void {
  if (source.kind !== "Runtime") {
    return;
  }

  const sourceType = typeof source.metadata.type === "string" ? source.metadata.type : null;
  const targetType = typeof target.metadata.type === "string" ? target.metadata.type : null;

  if (edge.kind === "BUILDS") {
    if (sourceType !== "compose" || target.kind !== "Runtime" || targetType !== "dockerfile") {
      issues.push(
        issue(
          "INVALID_RUNTIME_RELATIONSHIP",
          "relationship",
          "edge",
          `BUILDS requires Runtime(compose) -> Runtime(dockerfile). Edge '${edge.id}' is '${sourceType}' -> '${targetType ?? target.kind}'.`,
          edge.id,
        ),
      );
    }
  }

  if (edge.kind === "RUNS") {
    if (sourceType !== "compose" || target.kind !== "Runtime" || targetType !== "service") {
      issues.push(
        issue(
          "INVALID_RUNTIME_RELATIONSHIP",
          "relationship",
          "edge",
          `RUNS requires Runtime(compose) -> Runtime(service). Edge '${edge.id}' is '${sourceType}' -> '${targetType ?? target.kind}'.`,
          edge.id,
        ),
      );
    }
  }

  if (edge.kind === "DEPENDS_ON") {
    if (sourceType !== "service" || target.kind !== "Runtime" || targetType !== "service") {
      issues.push(
        issue(
          "INVALID_RUNTIME_RELATIONSHIP",
          "relationship",
          "edge",
          `DEPENDS_ON requires Runtime(service) -> Runtime(service). Edge '${edge.id}' is '${sourceType}' -> '${targetType ?? target.kind}'.`,
          edge.id,
        ),
      );
    }
  }

  if (edge.kind === "MOUNTS") {
    if (sourceType !== "service" || target.kind !== "File") {
      issues.push(
        issue(
          "INVALID_RUNTIME_RELATIONSHIP",
          "relationship",
          "edge",
          `MOUNTS requires Runtime(service) -> File. Edge '${edge.id}' is '${sourceType}' -> '${target.kind}'.`,
          edge.id,
        ),
      );
    }
  }
}

function validateInvariants(
  nodes: readonly Node[],
  edges: readonly Edge[],
  nodeById: ReadonlyMap<NodeId, Node>,
  issues: ValidationIssue[],
): void {
  if (!isSorted(nodes, compareNodes)) {
    issues.push(
      issue(
        "NON_DETERMINISTIC_NODE_ORDER",
        "invariant",
        "graph",
        "Node iteration order is not deterministic (expected sorted by kind then id).",
      ),
    );
  }

  if (!isSorted(edges, compareEdges)) {
    issues.push(
      issue(
        "NON_DETERMINISTIC_EDGE_ORDER",
        "invariant",
        "graph",
        "Edge iteration order is not deterministic (expected sorted by kind, from_id, to_id, id).",
      ),
    );
  }

  for (const node of nodes) {
    try {
      assertCanonicalNodeIdForKind(node);
    } catch (error) {
      issues.push(issue("INVALID_NODE_ID", "invariant", "node", toErrorMessage(error), node.id));
    }

    if (node.kind === "Symbol" || node.kind === "Type" || node.kind === "Sink") {
      const fileId = node.metadata.file_id;
      if (typeof fileId !== "string") {
        continue;
      }

      const resolved = nodeById.get(fileId as NodeId);
      if (!resolved) {
        issues.push(
          issue(
            "MISSING_CONTAINING_FILE",
            "invariant",
            "node",
            `Node '${node.id}' references missing file_id '${fileId}'.`,
            node.id,
          ),
        );
      } else if (resolved.kind !== "File") {
        issues.push(
          issue(
            "INVALID_CONTAINING_FILE_KIND",
            "invariant",
            "node",
            `Node '${node.id}' file_id '${fileId}' must reference kind 'File', got '${resolved.kind}'.`,
            node.id,
          ),
        );
      }
    }
  }

  for (const edge of edges) {
    try {
      assertCanonicalEdgeId(edge);
    } catch (error) {
      issues.push(issue("INVALID_EDGE_ID", "invariant", "edge", toErrorMessage(error), edge.id));
    }
  }

  // TODO(needs decision): aggregation evidence minimums are architecture-defined,
  // but evidence tuple schema is not yet finalized for runtime validation.
}

function buildStats(nodes: readonly Node[], edges: readonly Edge[]): GraphStats {
  const nodeKinds = Object.fromEntries(NODE_KINDS.map((kind) => [kind, 0])) as Record<
    (typeof NODE_KINDS)[number],
    number
  >;
  const edgeKinds = Object.fromEntries(EDGE_KINDS.map((kind) => [kind, 0])) as Record<
    (typeof EDGE_KINDS)[number],
    number
  >;

  for (const node of nodes) {
    if (NODE_KIND_SET.has(node.kind)) {
      nodeKinds[node.kind] += 1;
    }
  }

  for (const edge of edges) {
    if (EDGE_KIND_SET.has(edge.kind)) {
      edgeKinds[edge.kind] += 1;
    }
  }

  return {
    nodeCount: nodes.length,
    edgeCount: edges.length,
    nodeKinds,
    edgeKinds,
  };
}

function assertMetadataString(node: Node, field: string, issues: ValidationIssue[]): void {
  const value = node.metadata[field];
  if (typeof value !== "string" || value.trim().length === 0) {
    issues.push(
      issue(
        "MISSING_REQUIRED_FIELD",
        "node",
        "node",
        `Node '${node.id}' metadata.${field} must be a non-empty string.`,
        node.id,
      ),
    );
  }
}

function assertMetadataBoolean(node: Node, field: string, issues: ValidationIssue[]): void {
  const value = node.metadata[field];
  if (typeof value !== "boolean") {
    issues.push(
      issue("MISSING_REQUIRED_FIELD", "node", "node", `Node '${node.id}' metadata.${field} must be boolean.`, node.id),
    );
  }
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSorted<T>(values: readonly T[], compare: (a: T, b: T) => number): boolean {
  for (let index = 1; index < values.length; index += 1) {
    if (compare(values[index - 1], values[index]) > 0) {
      return false;
    }
  }
  return true;
}

function issue(
  code: string,
  stage: ValidationIssue["stage"],
  entity: ValidationIssue["entity"],
  message: string,
  id?: string,
): ValidationIssue {
  return {
    code,
    stage,
    entity,
    message,
    id,
    severity: "error",
  };
}

function sortIssues(issues: readonly ValidationIssue[]): ValidationIssue[] {
  return [...issues].sort((left, right) => {
    return compareText(left.stage, right.stage)
      || compareText(left.entity, right.entity)
      || compareText(left.id ?? "", right.id ?? "")
      || compareText(left.code, right.code)
      || compareText(left.message, right.message);
  });
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

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  return "Unknown validation error.";
}
