import * as fs from "fs";
import Table from "cli-table3";
import chalk from "chalk";
import { IAnalysisOptions, ICodeContentType } from "../types";

interface IParams {
  fileCount: number;
  output: ICodeContentType;
  fileNameCases: Record<string, number>;
  options: IAnalysisOptions;
}

export const logOutput = ({
  fileCount,
  output,
  fileNameCases,
  options,
}: IParams) => {
  // Create an object to store the result information
  const resultObject = {
    date: new Date().toISOString(),
    fileCount,
    fileNameCases,
    options,
    output,
    // ... other result information ...
  };

  // Convert the object to a JSON string
  const resultJson = JSON.stringify(resultObject, null, 2); // The third parameter (2) adds indentation for better readability

  // Log the JSON output to the console
  console.log(chalk.bold("------------- Result -------------\n"));
  // console.log(resultJson);

  if (options.writeJsonOutput) {
    // Create the directory if it doesn't exist
    const directoryPath = `${options.directory}/.analyze-codebase`;

    if (!fs.existsSync(directoryPath))
      fs.mkdirSync(directoryPath, { recursive: true });
  }

  // Write the JSON output to a file (optional)

  // Continue with your existing console logs (if needed)
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

  if (options.writeJsonOutput) {
    const writePath = `${options.directory}/.analyze-codebase/${resultObject.date}.json`;

    fs.writeFileSync(writePath, resultJson, {
      flag: "w",
    });

    console.log(
      chalk.bold(`\nJSON output written to: ${chalk.cyan(writePath)}\n`)
    );
  }

  console.log(chalk.bold("\n----------------------------"));
  console.log(
    chalk.bold(`\nNumber of files read: ${chalk.yellow(fileCount)}\n`)
  );
};
