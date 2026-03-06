import * as fs from "node:fs";
import * as path from "node:path";
import * as ts from "typescript";

export interface ParseDiagnostic {
  readonly code: "FILE_READ_ERROR" | "PARSE_ERROR";
  readonly message: string;
  readonly filePath: string;
  readonly line?: number;
  readonly column?: number;
}

export interface ParseFileResult {
  readonly sourceFile: ts.SourceFile | null;
  readonly diagnostics: readonly ParseDiagnostic[];
}

/**
 * Parse a TypeScript file into a SourceFile without constructing a full Program.
 */
export function parseFile(filePath: string): ts.SourceFile {
  const result = parseFileWithDiagnostics(filePath);
  if (result.sourceFile) {
    return result.sourceFile;
  }

  const firstDiagnostic = result.diagnostics[0];
  if (firstDiagnostic) {
    throw new Error(firstDiagnostic.message);
  }

  throw new Error(`Failed to parse '${filePath}'.`);
}

/**
 * Parse a TypeScript file and return deterministic diagnostics on failure.
 */
export function parseFileWithDiagnostics(
  filePath: string,
  options: { readonly sourceFilePath?: string } = {},
): ParseFileResult {
  if (filePath.trim().length === 0) {
    return {
      sourceFile: null,
      diagnostics: [
        {
          code: "PARSE_ERROR",
          message: "File path cannot be empty.",
          filePath,
        },
      ],
    };
  }

  const absolutePath = path.resolve(filePath);
  const sourceFilePath = options.sourceFilePath ?? filePath;
  const diagnostics: ParseDiagnostic[] = [];
  let sourceText = "";

  try {
    sourceText = fs.readFileSync(absolutePath, "utf8");
  } catch (error) {
    diagnostics.push({
      code: "FILE_READ_ERROR",
      message: `Unable to read '${sourceFilePath}': ${toErrorMessage(error)}`,
      filePath: sourceFilePath,
    });

    return {
      sourceFile: null,
      diagnostics,
    };
  }

  const scriptKind = tryScriptKind(sourceFilePath);
  if (!scriptKind) {
    return {
      sourceFile: null,
      diagnostics: [
        {
          code: "PARSE_ERROR",
          message: `Unsupported TypeScript file extension for '${sourceFilePath}'.`,
          filePath: sourceFilePath,
        },
      ],
    };
  }

  const sourceFile = ts.createSourceFile(
    sourceFilePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    scriptKind,
  );

  const parseDiagnostics =
    (sourceFile as { readonly parseDiagnostics?: readonly ts.DiagnosticWithLocation[] })
      .parseDiagnostics ?? [];

  for (const diagnostic of parseDiagnostics) {
    const start = diagnostic.start ?? 0;
    const position = sourceFile.getLineAndCharacterOfPosition(start);
    diagnostics.push({
      code: "PARSE_ERROR",
      message: `Parse error in '${sourceFilePath}': ${ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        "\n",
      )}`,
      filePath: sourceFilePath,
      line: position.line + 1,
      column: position.character + 1,
    });
  }

  if (diagnostics.length > 0) {
    diagnostics.sort(compareDiagnostics);
    return {
      sourceFile: null,
      diagnostics,
    };
  }

  return {
    sourceFile,
    diagnostics: [],
  };
}

/**
 * Parse multiple files in deterministic path order.
 */
export function parseFiles(filePaths: readonly string[]): ts.SourceFile[] {
  const sortedPaths = [...filePaths].sort(comparePathStrings);
  return sortedPaths.map((filePath) => parseFile(filePath));
}

function tryScriptKind(filePath: string): ts.ScriptKind | null {
  if (filePath.endsWith(".tsx")) {
    return ts.ScriptKind.TSX;
  }

  if (filePath.endsWith(".ts")) {
    return ts.ScriptKind.TS;
  }

  return null;
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

function compareDiagnostics(left: ParseDiagnostic, right: ParseDiagnostic): number {
  return (
    comparePathStrings(left.filePath, right.filePath)
    || compareNumber(left.line ?? 0, right.line ?? 0)
    || compareNumber(left.column ?? 0, right.column ?? 0)
    || comparePathStrings(left.code, right.code)
    || comparePathStrings(left.message, right.message)
  );
}

function compareNumber(left: number, right: number): number {
  return left - right;
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  return "Unknown file read error.";
}
