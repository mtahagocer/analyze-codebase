import Table from "cli-table3";
import chalk from "chalk";
import { IAnalysisOptions, IAnalyzeResult, ICodeContentType } from "../types";
import { writeAnalyzeResult } from "./file";

interface IParams {
  fileCount: number;
  output: ICodeContentType;
  fileNameCases: Record<string, number>;
  options: IAnalysisOptions;
}

export const logOutput = async ({
  fileCount,
  output,
  fileNameCases,
  options,
}: IParams) => {
  const resultObject: IAnalyzeResult = {
    date: new Date().toISOString(),
    fileCount,
    fileNameCases,
    options,
    output,
  };

  // Log the JSON output to the console
  console.log(chalk.bold("------------- Result -------------\n"));

  if (fileCount === 0) {
    console.log(
      chalk.red(
        `No files found in ${chalk.cyan(
          options.directory
        )} with extensions ${chalk.cyan(options.extensions)}\n`
      )
    );
  } else {
    if (options.checkFileNames) {
      console.log(chalk.bold("File Name Summary:\n"));

      const fileNameTable = new Table({
        head: [
          chalk.bold("File Name Case"),
          chalk.bold("Count"),
          chalk.bold("Percentage"),
        ],
        colWidths: [30, 10, 15],
      });

      Object.entries(fileNameCases).forEach(([key, value]) => {
        const percentage = ((value / fileCount) * 100).toFixed(2);
        fileNameTable.push([key, value.toString(), `${percentage}%`]);
      });

      console.log(fileNameTable.toString());

      console.log("\n");
    }

    if (options.checkFileContent) {
      console.log(chalk.bold("Content Type Summary:\n"));
      const contentTypeTable = new Table({
        head: [
          chalk.bold("Content Type"),
          chalk.bold("Count"),
          chalk.bold("Percentage"),
        ],
        colWidths: [30, 10, 15],
      });

      Object.entries(output).forEach(([key, value]) => {
        const percentage = ((value / output.Physical) * 100).toFixed(2);
        contentTypeTable.push([key, value.toString(), `${percentage}%`]);
      });

      console.log(contentTypeTable.toString());
    }
  }

  // Write the JSON output to a file (optional)
  if (options.writeJsonOutput) {
    const writePath = await writeAnalyzeResult(options.directory, resultObject);

    console.log(
      chalk.bold(`\nJSON output written to: ${chalk.cyan(writePath)}\n`)
    );
  }

  console.log(chalk.bold("\n----------------------------"));
  console.log(
    chalk.bold(`\nNumber of files read: ${chalk.yellow(fileCount)}\n`)
  );
};
