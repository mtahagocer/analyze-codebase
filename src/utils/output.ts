import Table from "cli-table3";
import chalk from "chalk";
import boxen from "boxen";
import { IAnalysisOptions, IAnalyzeResult, ICodeContentType } from "../types";
import { writeAnalyzeResult } from "./file";
import { exportResults, ExportFormat } from "./export";

interface IParams {
  fileCount: number;
  output: ICodeContentType;
  fileNameCases: Record<string, number>;
  options: IAnalysisOptions;
  duration?: number;
  exportFormat?: ExportFormat;
  exportPath?: string;
}

const getEmoji = (key: string): string => {
  const emojiMap: Record<string, string> = {
    Physical: "📄",
    Source: "💻",
    Comment: "💬",
    SingleLineComment: "//",
    BlockComment: "/* */",
    Mixed: "🔀",
    EmptyBlockComment: "⚪",
    Empty: "⬜",
    ToDo: "✅",
  };
  return emojiMap[key] || "📊";
};

const formatPercentage = (value: number, total: number): string => {
  const percentage = ((value / total) * 100).toFixed(2);
  const percentageNum = parseFloat(percentage);
  const color =
    percentageNum > 50
      ? chalk.green
      : percentageNum > 25
      ? chalk.yellow
      : chalk.gray;
  return color(`${percentage}%`);
};

export const logOutput = async ({
  fileCount,
  output,
  fileNameCases,
  options,
  duration,
  exportFormat,
  exportPath,
}: IParams) => {
  const resultObject: IAnalyzeResult = {
    date: new Date().toISOString(),
    fileCount,
    fileNameCases,
    options,
    output,
  };

  // Enhanced header with box
  const header = boxen(
    chalk.bold.cyan("📊 Codebase Analysis Results"),
    {
      padding: 1,
      borderColor: "cyan",
      borderStyle: "round",
      margin: { top: 1, bottom: 1, left: 0, right: 0 },
    }
  );
  console.log(header);

  if (fileCount === 0) {
    const errorBox = boxen(
      chalk.red(
        `❌ No files found in ${chalk.cyan(
          options.directory
        )}\n\nExtensions: ${chalk.cyan(
          options.extensions?.join(", ") || "all"
        )}`
      ),
      {
        padding: 1,
        borderColor: "red",
        borderStyle: "round",
      }
    );
    console.log(errorBox);
    return;
  }

  // File count summary
  const summaryBox = boxen(
    chalk.bold(`📁 Files Analyzed: ${chalk.yellow(fileCount)}`) +
      (duration
        ? chalk.gray(`\n⏱️  Duration: ${chalk.yellow(duration.toFixed(2))}s`)
        : ""),
    {
      padding: 1,
      borderColor: "blue",
      borderStyle: "round",
      margin: { top: 0, bottom: 1, left: 0, right: 0 },
    }
  );
  console.log(summaryBox);

  if (options.checkFileNames) {
    console.log(chalk.bold.cyan("\n📝 File Name Case Analysis\n"));

    const fileNameTable = new Table({
      head: [
        chalk.bold.white("📋 Case Type"),
        chalk.bold.white("Count"),
        chalk.bold.white("Percentage"),
      ],
      colWidths: [30, 15, 20],
      style: {
        head: ["cyan"],
        border: ["gray"],
      },
    });

    // Sort by count descending
    const sortedCases = Object.entries(fileNameCases).sort(
      ([, a], [, b]) => b - a
    );

    sortedCases.forEach(([key, value]) => {
      const percentage = ((value / fileCount) * 100).toFixed(2);
      fileNameTable.push([
        chalk.cyan(key),
        chalk.yellow(value.toString()),
        formatPercentage(value, fileCount),
      ]);
    });

    console.log(fileNameTable.toString());
    console.log();
  }

  if (options.checkFileContent) {
    console.log(chalk.bold.cyan("\n📊 Content Type Analysis\n"));

    const contentTypeTable = new Table({
      head: [
        chalk.bold.white("Type"),
        chalk.bold.white("Count"),
        chalk.bold.white("Percentage"),
      ],
      colWidths: [30, 15, 20],
      style: {
        head: ["cyan"],
        border: ["gray"],
      },
    });

    Object.entries(output).forEach(([key, value]) => {
      const emoji = getEmoji(key);
      const percentage = ((value / output.Physical) * 100).toFixed(2);
      contentTypeTable.push([
        `${emoji} ${chalk.cyan(key)}`,
        chalk.yellow(value.toString()),
        formatPercentage(value, output.Physical),
      ]);
    });

    console.log(contentTypeTable.toString());
    console.log();
  }

  // Write the JSON output to a file (optional)
  if (options.writeJsonOutput) {
    const writePath = await writeAnalyzeResult(options.directory, resultObject);

    const successBox = boxen(
      chalk.green(`✅ JSON output written to:\n${chalk.cyan(writePath)}`),
      {
        padding: 1,
        borderColor: "green",
        borderStyle: "round",
        margin: { top: 1, bottom: 0, left: 0, right: 0 },
      }
    );
    console.log(successBox);
  }

  // Export in specified format
  if (exportFormat && exportPath) {
    try {
      const exportedPath = await exportResults(
        resultObject,
        exportPath,
        exportFormat
      );
      const exportBox = boxen(
        chalk.green(
          `📤 Exported ${exportFormat.toUpperCase()} report to:\n${chalk.cyan(exportedPath)}`
        ),
        {
          padding: 1,
          borderColor: "green",
          borderStyle: "round",
          margin: { top: 1, bottom: 0, left: 0, right: 0 },
        }
      );
      console.log(exportBox);
    } catch (error) {
      console.error(
        chalk.red(`\n❌ Error exporting ${exportFormat}: ${error}\n`)
      );
    }
  }

  // Footer
  const footer = boxen(
    chalk.gray(`Analysis completed at ${new Date().toLocaleTimeString()}`),
    {
      padding: { top: 0, right: 1, bottom: 0, left: 1 },
      borderColor: "gray",
      borderStyle: "round",
      margin: { top: 1, bottom: 0, left: 0, right: 0 },
    }
  );
  console.log(footer);
};
