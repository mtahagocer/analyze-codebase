import chalk from "chalk";
import fg from "fast-glob";
import * as path from "path";
import { analyzeFile } from "../analyze/file";
import { IAnalysisOptions, ICodeContentType } from "../types";
import { NamingCase } from "../utils";
import { logOutput } from "../utils/output";
import { ProgressBar } from "../utils/progress";
import { createSpinner } from "../utils/spinner";
import { ExportFormat } from "../utils/export";
import { CancellationToken } from "../utils/cancellation";

const collectFiles = async (
  directory: string,
  extensions?: string[],
  exclude?: string[]
): Promise<string[]> => {
  const patterns: string[] = [];
  const ignorePatterns: string[] = [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/coverage/**",
    "**/.git/**",
    "**/.next/**",
    "**/public/**",
    "**/test/**",
    "**/tests/**",
    "**/mocks/**",
  ];

  if (exclude) {
    ignorePatterns.push(...exclude.map((ex) => `**/${ex}/**`));
  }

  if (extensions && extensions.length > 0) {
    patterns.push(
      ...extensions.map((ext) => `**/*${ext}`),
      "**/*" // Also include files without extensions
    );
  } else {
    patterns.push("**/*");
  }

  const files = await fg(patterns, {
    cwd: directory,
    ignore: ignorePatterns,
    absolute: true,
    onlyFiles: true,
    dot: false,
  });

  // Filter by extension if specified
  if (extensions && extensions.length > 0) {
    return files.filter((file) => {
      const ext = path.extname(file);
      return extensions.includes(ext);
    });
  }

  return files;
};

const processFile = (
  filePath: string,
  output: ICodeContentType,
  fileNameCases: Partial<Record<NamingCase, number>>
): void => {
  const { fileNameCase } = analyzeFile(filePath, output);

  if (fileNameCases[fileNameCase] !== undefined)
    fileNameCases[fileNameCase]! += 1;
  else fileNameCases[fileNameCase] = 1;
};

export const analyzeCodebase = async (
  options: IAnalysisOptions & { exportFormat?: ExportFormat; exportPath?: string }
): Promise<void> => {
  const start = Date.now();
  const cancellationToken = new CancellationToken();
  const spinner = createSpinner("🔍 Discovering files...");

  // Cleanup on cancellation
  cancellationToken.onCancel(() => {
    spinner.stop();
    console.log(chalk.yellow("\n\n⚠️  Cancellation requested. Cleaning up...\n"));
  });

  const fileNameCases: Partial<Record<NamingCase, number>> = {};

  const output: ICodeContentType = {
    Physical: 0,
    Source: 0,
    Comment: 0,
    SingleLineComment: 0,
    BlockComment: 0,
    Mixed: 0,
    EmptyBlockComment: 0,
    Empty: 0,
    ToDo: 0,
  };

  let progressBar: ProgressBar | null = null;

  try {
    // Collect all files first
    spinner.update("🔍 Scanning directory structure...");
    const files = await collectFiles(
      options.directory,
      options.extensions,
      options.exclude
    );

    spinner.succeed(`✅ Found ${files.length} files to analyze`);

    if (files.length === 0) {
      await logOutput({
        fileCount: 0,
        fileNameCases: {},
        options,
        output,
        duration: (Date.now() - start) / 1000,
      });
      return;
    }

    // Create progress bar
    const showProgress = (options as any).showProgress !== false;
    progressBar = showProgress
      ? new ProgressBar({ total: files.length })
      : null;

    // Cleanup progress bar on cancellation
    cancellationToken.onCancel(() => {
      progressBar?.stop();
    });

    // Process files with optimized concurrency
    // For file I/O operations, optimal concurrency is 20-30 to avoid I/O contention
    // Too high concurrency can actually slow things down due to disk I/O bottlenecks
    const fileCount = files.length;
    // Optimal concurrency for file I/O: 20-30 is usually the sweet spot
    const defaultConcurrency = fileCount > 500 ? 30 : fileCount > 100 ? 25 : 20;
    const maxConcurrency = (options as any).maxConcurrency || defaultConcurrency;

    if (maxConcurrency > 1) {
      // Parallel processing
      const chunks: string[][] = [];
      for (let i = 0; i < files.length; i += maxConcurrency) {
        chunks.push(files.slice(i, i + maxConcurrency));
      }

      for (const chunk of chunks) {
        // Check for cancellation before processing each chunk
        if (cancellationToken.isCancelled()) {
          progressBar?.stop();
          throw new Error("Operation cancelled by user");
        }

        // Use Promise.allSettled to handle cancellation better
        const results = await Promise.allSettled(
          chunk.map(async (filePath) => {
            if (cancellationToken.isCancelled()) {
              throw new Error("Operation cancelled by user");
            }
            if (options.checkFileNames || options.checkFileContent) {
              processFile(filePath, output, fileNameCases);
            }
            progressBar?.update(1);
          })
        );
        
        // Check if any promise was cancelled
        const cancelled = results.some(
          (result) =>
            result.status === "rejected" &&
            result.reason?.message === "Operation cancelled by user"
        );
        
        if (cancelled || cancellationToken.isCancelled()) {
          progressBar?.stop();
          throw new Error("Operation cancelled by user");
        }
      }
    } else {
      // Sequential processing
      for (const filePath of files) {
        if (cancellationToken.isCancelled()) {
          progressBar?.stop();
          throw new Error("Operation cancelled by user");
        }
        if (options.checkFileNames || options.checkFileContent) {
          processFile(filePath, output, fileNameCases);
        }
        progressBar?.update(1);
      }
    }

    if (cancellationToken.isCancelled()) {
      progressBar?.stop();
      throw new Error("Operation cancelled by user");
    }
    progressBar?.complete();

    const duration = (Date.now() - start) / 1000;

    await logOutput({
      fileCount,
      fileNameCases,
      options,
      output,
      duration,
      exportFormat: options.exportFormat,
      exportPath: options.exportPath,
    });
  } catch (error: any) {
    spinner.stop();
    progressBar?.stop();
    
    if (error?.message === "Operation cancelled by user" || cancellationToken.isCancelled()) {
      console.log(chalk.yellow("\n\n✅ Analysis cancelled by user\n"));
      process.exit(130); // Standard exit code for SIGINT
    }
    
    spinner.fail(`❌ Error during analysis: ${error}`);
    throw error;
  }
};
