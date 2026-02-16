import chokidar from "chokidar";
import chalk from "chalk";
import boxen from "boxen";
import runner from "../runner";
import { IAnalysisOptions } from "../types";
import { IConfigFile } from "./config";

// Merge config with CLI options (CLI options take precedence)
const mergeOptions = (
  config: IConfigFile | null,
  cliOptions: any
): IAnalysisOptions => {
  return {
    directory: cliOptions.directory || "",
    framework: cliOptions.framework || config?.framework,
    extensions: cliOptions.extensions?.length
      ? cliOptions.extensions
      : config?.extensions,
    exclude: cliOptions.exclude?.length ? cliOptions.exclude : config?.exclude,
    checkFileNames:
      cliOptions.checkFileNames !== undefined
        ? cliOptions.checkFileNames
        : config?.checkFileNames ?? true,
    checkFileContent:
      cliOptions.checkFileContent !== undefined
        ? cliOptions.checkFileContent
        : config?.checkFileContent ?? true,
    writeJsonOutput:
      cliOptions.writeJsonOutput !== undefined
        ? cliOptions.writeJsonOutput
        : config?.writeJsonOutput ?? false,
    showProgress: config?.showProgress ?? true,
    parallel: config?.parallel ?? true,
    maxConcurrency: config?.maxConcurrency ?? 50, // Lower for watch mode to avoid overwhelming system
  } as IAnalysisOptions;
};

export const startWatchMode = async (
  directory: string,
  options: any,
  config: IConfigFile | null
): Promise<void> => {
  const mergedOptions = mergeOptions(config, {
    ...options,
    directory,
    showProgress: false, // Disable progress in watch mode
  });

  console.log(
    boxen(
      chalk.cyan("👀 Watch mode enabled\n") +
        chalk.gray(`Watching: ${chalk.white(directory)}\n`) +
        chalk.gray("Press Ctrl+C to stop"),
      {
        padding: 1,
        borderColor: "cyan",
        borderStyle: "round",
        margin: { top: 0, bottom: 1, left: 0, right: 0 },
      }
    )
  );

  let isAnalyzing = false;
  let analysisTimeout: NodeJS.Timeout | null = null;

  const performAnalysis = async () => {
    if (isAnalyzing) return;
    isAnalyzing = true;

    try {
      console.log(chalk.gray("\n🔄 File change detected, re-analyzing...\n"));
      await runner(mergedOptions);
    } catch (error) {
      console.error(chalk.red(`\n❌ Error during analysis: ${error}\n`));
    } finally {
      isAnalyzing = false;
    }
  };

  const debouncedAnalysis = () => {
    if (analysisTimeout) {
      clearTimeout(analysisTimeout);
    }
    analysisTimeout = setTimeout(performAnalysis, 500); // Debounce 500ms
  };

  // Initial analysis
  await performAnalysis();

  // Watch for changes
  const watcher = chokidar.watch(directory, {
    ignored: [
      /node_modules/,
      /\.git/,
      /dist/,
      /build/,
      /coverage/,
      /\.next/,
      ...(mergedOptions.exclude || []).map((ex) => new RegExp(ex)),
    ],
    persistent: true,
    ignoreInitial: true,
  });

  // Use addListener or on method - chokidar FSWatcher extends EventEmitter
  (watcher as any).on("change", () => debouncedAnalysis());
  (watcher as any).on("add", () => debouncedAnalysis());
  (watcher as any).on("unlink", () => debouncedAnalysis());

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log(chalk.yellow("\n\n👋 Stopping watch mode...\n"));
    watcher.close();
    process.exit(0);
  });
};
