import chalk from "chalk";
import { analyzeFile } from "../analyze/file";
import { IAnalysisOptions, ICodeContentType } from "../types";
import { NamingCase } from "../utils";
import { traverseDirectory } from "../utils/file";
import { logOutput } from "../utils/output";

export const analyzeCodebase = async (
  options: IAnalysisOptions
): Promise<void> => {
  const start = Date.now();

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

  console.log(
    chalk.bold(
      `\n\nAnalyzing codebase in ${chalk.cyan(options.directory)} ${
        options?.framework ? `framework: ${chalk.cyan(options.framework)}` : ""
      }\n`
    )
  );

  let fileCount = 0;

  await traverseDirectory({
    extensions: options.extensions,

    directory: options.directory,

    exclude: options.exclude,

    checkFileNames: options.checkFileNames,

    onFile: (filePath) => {
      fileCount++;

      const { fileNameCase } = analyzeFile(filePath, output);

      //@ts-ignore
      if (fileNameCases[fileNameCase] !== undefined)
        fileNameCases[fileNameCase]! += 1;
      else fileNameCases[fileNameCase] = 0;
    },
  });

  logOutput({
    fileCount,
    fileNameCases,
    options,
    output,
  });

  const totalSecond = ((Date.now() - start) / 1000).toFixed(2);

  console.log(chalk.bold(`Time taken: ${chalk.yellow(totalSecond)}s\n`));
};
