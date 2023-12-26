#!/usr/bin/env node

import chalk from "chalk";
import { program } from "commander";
import runner from "./runner";

chalk.level = 3;

program
  .arguments("<directory>")
  .description("Analyze the specified directory")
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
    "Check directories",
    parseBoolean
  )
  .option(
    "-w --writeJsonOutput [writeJsonOutput]",
    "Write json output",
    parseBoolean
  )
  .action((directory, options) => {
    if (
      options.checkFileNames === false &&
      options.checkFileContent === false
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

    if ((options?.extensions as string[])?.find((d) => !d.includes("."))) {
      return console.error(
        chalk.red("\nError: Extensions must include a dot (.)\n")
      );
    }

    runner({
      ...options,
      directory,
      checkFileContent: options.checkFileContent ?? true,
      checkFileNames: options.checkFileNames ?? true,
    });
  });

program.parse(process.argv);

function parseBoolean(value: string | undefined): boolean | undefined {
  if (typeof value === "undefined") {
    return undefined;
  }
  return value.toLowerCase() === "true";
}
