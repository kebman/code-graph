import * as fs from "node:fs";
import * as path from "node:path";
import * as ts from "typescript";

/**
 * Parse a TypeScript file into a SourceFile without constructing a full Program.
 */
export function parseFile(filePath: string): ts.SourceFile {
  if (filePath.trim().length === 0) {
    throw new Error("File path cannot be empty.");
  }

  const absolutePath = path.resolve(filePath);
  const sourceText = fs.readFileSync(absolutePath, "utf8");

  return ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    scriptKindFromPath(filePath),
  );
}

/**
 * Parse multiple files in deterministic path order.
 */
export function parseFiles(filePaths: readonly string[]): ts.SourceFile[] {
  const sortedPaths = [...filePaths].sort(comparePathStrings);
  return sortedPaths.map((filePath) => parseFile(filePath));
}

function scriptKindFromPath(filePath: string): ts.ScriptKind {
  if (filePath.endsWith(".tsx")) {
    return ts.ScriptKind.TSX;
  }

  if (filePath.endsWith(".ts")) {
    return ts.ScriptKind.TS;
  }

  throw new Error(`Unsupported TypeScript file extension for '${filePath}'.`);
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
