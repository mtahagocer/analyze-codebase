import ora, { Ora } from "ora";
import chalk from "chalk";

export class Spinner {
  private spinner: Ora | null = null;

  start(message: string): void {
    this.spinner = ora({
      text: message,
      spinner: "dots",
      color: "cyan",
    }).start();
  }

  update(message: string): void {
    if (this.spinner) {
      this.spinner.text = message;
    }
  }

  succeed(message?: string): void {
    if (this.spinner) {
      this.spinner.succeed(message);
      this.spinner = null;
    }
  }

  fail(message?: string): void {
    if (this.spinner) {
      this.spinner.fail(message);
      this.spinner = null;
    }
  }

  warn(message?: string): void {
    if (this.spinner) {
      this.spinner.warn(message);
      this.spinner = null;
    }
  }

  info(message?: string): void {
    if (this.spinner) {
      this.spinner.info(message);
      this.spinner = null;
    }
  }

  stop(): void {
    if (this.spinner) {
      this.spinner.stop();
      this.spinner = null;
    }
  }
}

export const createSpinner = (message: string): Spinner => {
  const spinner = new Spinner();
  spinner.start(message);
  return spinner;
};
