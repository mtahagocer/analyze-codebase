import { Dirent } from "fs";
import * as fs from "fs/promises";
import * as path from "path";
import { IAnalyzeDataOutput, IAnalyzeResult } from "../types";
import chalk from "chalk";

export interface ITraverseDirectoryProps {
  directory: string;

  exclude?: string[];

  extensions?: string[];

  checkFileNames?: boolean;

  skipHidden?: boolean;

  onFile: (filePath: string) => Promise<void> | void;

  onDirectory?: (dirPath: string) => void;
}

const blackList = [
  "node_modules",
  "dist",
  "build",
  "coverage",
  "public",
  "test",
  "tests",
  "mocks",
];

export const traverseDirectory = async ({
  directory,
  onFile,
  onDirectory,
  exclude,
  extensions,
  checkFileNames = true,
  skipHidden = true,
}: ITraverseDirectoryProps) => {
  const files = await fs.readdir(directory, { withFileTypes: true });

  const tasks = files.map(async (file: Dirent) => {
    const filePath = path.join(directory, file.name);

    if (skipHidden && file.name.startsWith(".")) return;

    if (file.isDirectory()) {
      if (blackList.includes(file.name) || exclude?.includes?.(file.name))
        return;

      onDirectory?.(filePath);

      await traverseDirectory({
        directory: filePath,
        onFile,
        exclude,
        extensions,
        onDirectory,
        checkFileNames,
      });
    } else if (checkFileNames) {
      const ext = path.extname(file.name);

      if (extensions?.length) {
        if (extensions.includes(ext)) await onFile(filePath);
      } else await onFile(filePath);
    }
  });

  await Promise.all(tasks);
};

export const checkFileExist = async (filePath: string) => {
  try {
    await fs.stat(filePath);

    return true;
  } catch {
    return false;
  }
};

export const readAnalyzeResult = async (directory: string) => {
  const filePath = `${directory}/.analyze-codebase/data.json`;

  if (await checkFileExist(filePath)) {
    return JSON.parse(
      await fs.readFile(filePath, "utf-8")
    ) as IAnalyzeDataOutput;
  }
};

export const makeMigrationFromLastFileSystem = async (directory: string) => {
  const data = await readAnalyzeResult(directory);

  if (data) return;

  console.log(
    chalk.yellow(
      "Migrating data from the last file system to the new file system...\n"
    )
  );

  let newAnalyzeOutput: IAnalyzeDataOutput;

  const oldAnalyzes: IAnalyzeResult[] = [];

  await traverseDirectory({
    directory,
    checkFileNames: true,
    extensions: [".json"],
    onFile: async (filePath) => {
      try {
        const fileContent: IAnalyzeResult = JSON.parse(
          await fs.readFile(filePath, "utf-8")
        );

        oldAnalyzes.push(fileContent);
      } catch (error) {
        console.error(chalk.red(`Error reading the file: ${filePath}.`));
      }
    },
  });

  if (oldAnalyzes.length) {
    newAnalyzeOutput = {
      totalAnalyzeCount: oldAnalyzes.length,
      firstAnalyzeDate: oldAnalyzes[0].date,
      lastAnalyzeDate: oldAnalyzes[oldAnalyzes.length - 1].date,
      results: oldAnalyzes,
    };

    await fs.writeFile(
      `${directory}/data.json`,
      JSON.stringify(newAnalyzeOutput, null, 2)
    );
  }
};

export const writeAnalyzeResult = async (
  directory: string,
  result: IAnalyzeResult
) => {
  await makeMigrationFromLastFileSystem(`${directory}/.analyze-codebase/`);

  const filePath = `${directory}/.analyze-codebase/data.json`;

  let data: IAnalyzeDataOutput;

  const existData = await readAnalyzeResult(directory);

  if (existData) {
    data = existData;
    data.totalAnalyzeCount += 1;
    data.lastAnalyzeDate = new Date().toISOString();
  } else {
    // Create the directory if it doesn't exist
    await fs.mkdir(`${directory}/.analyze-codebase`, { recursive: true });

    data = {
      totalAnalyzeCount: 1,
      firstAnalyzeDate: new Date().toISOString(),
      lastAnalyzeDate: new Date().toISOString(),
      results: [],
    };
  }

  if (data.results.length) {
    const lastResult = data.results[data.results.length - 1];

    if (
      lastResult.fileCount === result.fileCount &&
      JSON.stringify(lastResult.fileNameCases) ===
        JSON.stringify(result.fileNameCases) &&
      JSON.stringify(lastResult.output) === JSON.stringify(result.output)
    ) {
      result.sameAsBefore = (lastResult.sameAsBefore || 0) + 1;

      console.log(
        chalk.red(
          `The result is the same as the last analyze. Same as before count: ${result.sameAsBefore}\n`
        )
      );
    }
  }

  data.results.push(result);

  await fs.writeFile(filePath, JSON.stringify(data, null, 2));

  return filePath;
};
