import * as fs from "fs/promises";
import * as path from "path";
import chalk from "chalk";
import boxen from "boxen";

export interface IConfigFile {
  framework?: string;
  extensions?: string[];
  exclude?: string[];
  checkFileNames?: boolean;
  checkFileContent?: boolean;
  writeJsonOutput?: boolean;
  outputFormat?: "table" | "json" | "csv" | "html";
  outputPath?: string;
  showProgress?: boolean;
  parallel?: boolean;
  maxConcurrency?: number;
}

const CONFIG_FILE_NAME = ".analyze-codebase.json";

export const findConfigFile = async (
  directory: string
): Promise<string | null> => {
  let currentDir = path.resolve(directory);

  while (currentDir !== path.dirname(currentDir)) {
    const configPath = path.join(currentDir, CONFIG_FILE_NAME);
    try {
      await fs.access(configPath);
      return configPath;
    } catch {
      // Config file doesn't exist, continue searching
    }
    currentDir = path.dirname(currentDir);
  }

  return null;
};

export const loadConfig = async (
  directory: string
): Promise<IConfigFile | null> => {
  const configPath = await findConfigFile(directory);

  if (!configPath) {
    return null;
  }

  try {
    const configContent = await fs.readFile(configPath, "utf-8");
    const config: IConfigFile = JSON.parse(configContent);
    return config;
  } catch (error) {
    console.error(
      chalk.red(`\nError reading config file: ${configPath}\n${error}\n`)
    );
    return null;
  }
};

export const createConfigFile = async (
  directory: string,
  config: IConfigFile
): Promise<string> => {
  const configPath = path.join(directory, CONFIG_FILE_NAME);
  await fs.writeFile(
    configPath,
    JSON.stringify(config, null, 2) + "\n",
    "utf-8"
  );
  return configPath;
};

export const displayConfigInfo = (configPath: string | null): void => {
  if (configPath) {
    const message = boxen(
      chalk.cyan(`📋 Using config: ${configPath}`),
      {
        padding: 1,
        borderColor: "cyan",
        borderStyle: "round",
      }
    );
    console.log(message);
  }
};
