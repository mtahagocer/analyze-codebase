import cliProgress from "cli-progress";
import chalk from "chalk";

export interface ProgressBarOptions {
  total: number;
  format?: string;
  showPercentage?: boolean;
}

export class ProgressBar {
  private bar: cliProgress.SingleBar | null = null;
  private total: number;
  private current: number = 0;

  constructor(options: ProgressBarOptions) {
    this.total = options.total;
    const format =
      options.format ||
      `${chalk.cyan("{bar}")} | {percentage}% | {value}/{total} files`;

    this.bar = new cliProgress.SingleBar(
      {
        format,
        barCompleteChar: "\u2588",
        barIncompleteChar: "\u2591",
        hideCursor: true,
        clearOnComplete: true,
      },
      cliProgress.Presets.shades_classic
    );

    this.bar.start(this.total, 0);
  }

  update(value: number = 1, payload?: Record<string, any>): void {
    this.current += value;
    if (this.bar) {
      this.bar.update(this.current, payload);
    }
  }

  setTotal(total: number): void {
    this.total = total;
    if (this.bar) {
      this.bar.setTotal(total);
    }
  }

  stop(): void {
    if (this.bar) {
      this.bar.stop();
      this.bar = null;
    }
  }

  complete(): void {
    if (this.bar) {
      this.bar.update(this.total);
      this.bar.stop();
      this.bar = null;
    }
  }
}
