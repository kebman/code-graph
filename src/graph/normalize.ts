import { InvalidPathError } from "./errors";

/**
 * Normalize a path to canonical repository-style form.
 * References:
 * - docs/architecture/id-and-normalization.md
 *
 * Rules implemented:
 * - NFC unicode normalization
 * - convert backslashes to '/'
 * - strip Windows drive prefix
 * - collapse repeated separators
 * - remove '.' segments
 * - resolve '..' segments without allowing root escape
 * - no trailing slash
 */
export function normalizePath(inputPath: string): string {
  if (typeof inputPath !== "string") {
    throw new InvalidPathError("Path must be a string.");
  }

  const trimmed = inputPath.trim();
  if (trimmed.length === 0) {
    throw new InvalidPathError("Path cannot be empty.");
  }

  if (trimmed.includes("\0")) {
    throw new InvalidPathError("Path contains null byte.");
  }

  // TODO(needs decision): Repo-root relativization cannot be done here without a root input.
  // Callers should pass repository-relative paths when possible.
  const nfc = trimmed.normalize("NFC");
  const slashNormalized = nfc.replace(/\\/g, "/");
  const withoutDrive = slashNormalized.replace(/^[A-Za-z]:/, "");
  const collapsed = withoutDrive.replace(/\/+/g, "/");

  const parts = splitPathRaw(collapsed);
  const stack: string[] = [];

  for (const part of parts) {
    if (part === ".") {
      continue;
    }

    if (part === "..") {
      if (stack.length === 0) {
        throw new InvalidPathError(`Path escapes root: '${inputPath}'.`);
      }
      stack.pop();
      continue;
    }

    stack.push(part);
  }

  const normalized = stack.join("/");
  if (normalized.length === 0) {
    throw new InvalidPathError(`Path resolves to empty: '${inputPath}'.`);
  }

  return normalized;
}

/** Split path into normalized segments (no empty segments in output). */
export function splitPath(inputPath: string): string[] {
  return normalizePath(inputPath).split("/");
}

/** Join path segments and normalize the result. */
export function joinPath(...segments: readonly string[]): string {
  if (segments.length === 0) {
    throw new InvalidPathError("At least one path segment is required.");
  }
  return normalizePath(segments.join("/"));
}

function splitPathRaw(path: string): string[] {
  return path
    .split("/")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);
}
