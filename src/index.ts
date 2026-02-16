#!/usr/bin/env node

import chalk from "chalk";
import { program } from "commander";
import runner from "./runner";
import { analyzeAndRemoveUnusedKeys } from "./analyze/i18n";
import {
  loadConfig,
  displayConfigInfo,
  IConfigFile,
} from "./utils/config";
import boxen from "boxen";
import { IAnalysisOptions } from "./types";
import { ExportFormat } from "./utils/export";

chalk.level = 3;

/**
 * Calculates optimal concurrency based on system resources and project size
 * For large projects, uses higher concurrency for better performance
 */
const calculateOptimalConcurrency = (): number => {
  // Get CPU count (default to 4 if unavailable)
  const cpuCount = require("os").cpus().length || 4;
  
  // For large projects, use more aggressive concurrency
  // Base: 2x CPU cores, but cap at reasonable limits
  // This allows 50-100+ concurrent operations on modern machines
  const baseConcurrency = Math.max(cpuCount * 2, 20);
  
  // Cap at 200 to prevent overwhelming the system
  return Math.min(baseConcurrency, 200);
};

// Merge config with CLI options (CLI options take precedence)
export const mergeOptions = (
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
    maxConcurrency: config?.maxConcurrency ?? calculateOptimalConcurrency(),
  } as IAnalysisOptions;
};

program
  .name("analyze-codebase")
  .description(
    "📊 A powerful CLI tool for analyzing codebase structure, naming conventions, and code quality"
  )
  .version("1.3.1")
  .arguments("[directory]")
  .option("-f, --framework <framework>", "Specify the framework")
  .option(
    "-e, --extensions <extensions...>",
    "Specify the extensions",
    (value, previous: string[]) => previous.concat(value),
    []
  )
  .option(
    "-exc, --exclude <exclude...>",
    "Specify the exclude",
    (value, previous: string[]) => previous.concat(value),
    []
  )
  .option("--checkFileNames [checkFileNames]", "Check file names", parseBoolean)
  .option(
    "--checkFileContent [checkFileContent]",
    "Check file content",
    parseBoolean
  )
  .option(
    "-w, --writeJsonOutput [writeJsonOutput]",
    "Write json output",
    parseBoolean
  )
  .option(
    "--i18n-file <i18nFile>",
    "Check for unused translation keys in the specified i18n JSON file (e.g., messages/en.json)"
  )
  .option("--watch", "Watch mode: automatically re-analyze on file changes")
  .option("--no-progress", "Disable progress bar")
  .option(
    "--max-concurrency <number>",
    "Max concurrent file processing (default: auto, up to 200 for large projects)",
    parseInt
  )
  .option("--export <format>", "Export format: json, csv, or html", "json")
  .option("--output <path>", "Output path for export")
  .action(async (directory = ".", options) => {
    try {
      // Load config file
      const config = await loadConfig(directory);
      if (config) {
        const configPath = await import("./utils/config").then((m) =>
          m.findConfigFile(directory)
        );
        if (configPath) {
          displayConfigInfo(configPath);
        }
      }

      // If i18n-file is specified, run i18n analysis instead
      if (options.i18nFile) {
      try {
        await analyzeAndRemoveUnusedKeys({
          directory,
          i18nFile: options.i18nFile,
          extensions: options.extensions,
          exclude: options.exclude,
          maxConcurrency: options.maxConcurrency,
        });
        return;
        } catch (error) {
          console.error(chalk.red(`\nError during i18n analysis: ${error}\n`));
          process.exit(1);
        }
      }

      // Watch mode
      if (options.watch) {
        const { startWatchMode } = await import("./utils/watch");
        await startWatchMode(directory, options, config);
        return;
      }

      const mergedOptions = mergeOptions(config, {
        ...options,
        directory,
      });

      if (
        mergedOptions.checkFileNames === false &&
        mergedOptions.checkFileContent === false
      ) {
        return console.error(
          chalk.red(
            `\nError: You must specify ${chalk.yellow(
              "true"
            )} at least one of the following options: ${chalk.yellow(
              "--checkFileNames"
            )}, ${chalk.yellow("--checkFileContent")}\n`
          )
        );
      }

      // Auto-fix extensions without dot prefix (e.g., "ts" -> ".ts")
      if (mergedOptions.extensions) {
        mergedOptions.extensions = mergedOptions.extensions.map((ext) =>
          ext.startsWith(".") ? ext : `.${ext}`
        );
      }

      // Override maxConcurrency if explicitly provided via CLI
      const finalOptions = {
        ...mergedOptions,
        exportFormat: options.export as ExportFormat | undefined,
        exportPath: options.output,
      };
      
      if (options.maxConcurrency !== undefined) {
        finalOptions.maxConcurrency = options.maxConcurrency;
      }
      
      runner(finalOptions);
    } catch (error) {
      console.error(chalk.red(`\n❌ Error: ${error}\n`));
      process.exit(1);
    }
  });

// Add init command for creating config file
program
  .command("init")
  .description("Initialize a config file (.analyze-codebase.json)")
  .action(async () => {
    const inquirer = (await import("inquirer")).default;
    const { createConfigFile } = await import("./utils/config");
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "framework",
        message: "Framework (optional):",
      },
      {
        type: "input",
        name: "extensions",
        message: "File extensions (comma-separated, e.g., .ts,.tsx):",
        default: ".ts,.tsx,.js,.jsx",
      },
      {
        type: "input",
        name: "exclude",
        message: "Exclude directories (comma-separated):",
        default: "node_modules,dist,build",
      },
      {
        type: "confirm",
        name: "checkFileNames",
        message: "Check file names?",
        default: true,
      },
      {
        type: "confirm",
        name: "checkFileContent",
        message: "Check file content?",
        default: true,
      },
      {
        type: "confirm",
        name: "writeJsonOutput",
        message: "Write JSON output by default?",
        default: false,
      },
    ]);

    const config: IConfigFile = {
      framework: answers.framework || undefined,
      extensions: answers.extensions
        .split(",")
        .map((ext: string) => ext.trim())
        .filter((ext: string) => ext),
      exclude: answers.exclude
        .split(",")
        .map((ex: string) => ex.trim())
        .filter((ex: string) => ex),
      checkFileNames: answers.checkFileNames,
      checkFileContent: answers.checkFileContent,
      writeJsonOutput: answers.writeJsonOutput,
      showProgress: true,
      parallel: true,
      // maxConcurrency will be auto-calculated based on project size
    };

    const configPath = await createConfigFile(".", config);
    console.log(
      boxen(
        chalk.green(`✅ Config file created: ${chalk.cyan(configPath)}`),
        {
          padding: 1,
          borderColor: "green",
          borderStyle: "round",
        }
      )
    );
  });

program.parse(process.argv);

function parseBoolean(value: string | undefined): boolean | undefined {
  if (typeof value === "undefined") {
    return undefined;
  }
  return value.toLowerCase() === "true";
}
