import * as fs from "node:fs";
import * as path from "node:path";
import { normalizePath } from "../graph/normalize";

const DEFAULT_EXCLUDED_DIRECTORIES = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
]);

export interface ScanTypeScriptFilesOptions {
  readonly rootDir?: string;
  readonly excludedDirectories?: readonly string[];
}

/**
 * Recursively discover repository TypeScript files in deterministic order.
 *
 * Returned paths are normalized repository-relative paths suitable for
 * downstream graph-core ID generation.
 */
export function scanTypeScriptFiles(options: ScanTypeScriptFilesOptions = {}): string[] {
  const rootDir = path.resolve(options.rootDir ?? process.cwd());
  const excludedDirectories = new Set(
    options.excludedDirectories ?? [...DEFAULT_EXCLUDED_DIRECTORIES],
  );

  const discovered: string[] = [];
  walkDirectory(rootDir, rootDir, excludedDirectories, discovered);

  discovered.sort(comparePathStrings);
  return discovered;
}

function walkDirectory(
  rootDir: string,
  currentDir: string,
  excludedDirectories: ReadonlySet<string>,
  discovered: string[],
): void {
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });
  entries.sort((left, right) => comparePathStrings(left.name, right.name));

  for (const entry of entries) {
    const absoluteEntryPath = path.join(currentDir, entry.name);

    if (entry.isDirectory()) {
      if (excludedDirectories.has(entry.name)) {
        continue;
      }

      walkDirectory(rootDir, absoluteEntryPath, excludedDirectories, discovered);
      continue;
    }

    if (!entry.isFile() || !isTypeScriptFile(entry.name)) {
      continue;
    }

    const relativePath = path.relative(rootDir, absoluteEntryPath);
    discovered.push(normalizePath(relativePath));
  }
}

function isTypeScriptFile(fileName: string): boolean {
  return (
    (fileName.endsWith(".ts") || fileName.endsWith(".tsx")) && !fileName.endsWith(".d.ts")
  );
}

function comparePathStrings(left: string, right: string): number {
  if (left < right) {
    return -1;
  }
  if (left > right) {
    return 1;
  }
  return 0;
}
