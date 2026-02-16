/**
 * Cancellation token for graceful shutdown
 * Uses a singleton pattern to ensure only one signal handler is registered
 */
let globalCancelled = false;
let signalHandlerRegistered = false;
const listeners: (() => void)[] = [];

const handleSignal = (signal: string) => {
  if (!globalCancelled) {
    globalCancelled = true;
    // Immediately stop progress bars and spinners
    listeners.forEach((listener) => {
      try {
        listener();
      } catch (error) {
        // Ignore errors in cleanup
      }
    });
    // Force immediate exit for SIGINT
    if (signal === "SIGINT") {
      console.log("\n"); // New line after ^C
      process.exit(130);
    }
  }
};

export class CancellationToken {
  private listeners: (() => void)[] = [];

  constructor() {
    // Register signal handlers only once
    if (!signalHandlerRegistered) {
      // Handle SIGINT (Ctrl+C) - immediate exit
      process.on("SIGINT", () => {
        handleSignal("SIGINT");
        // Exit immediately - no delay
        process.exit(130); // Standard exit code for SIGINT
      });

      // Handle SIGTERM
      process.on("SIGTERM", () => {
        handleSignal("SIGTERM");
        setTimeout(() => {
          process.exit(143); // Standard exit code for SIGTERM
        }, 1000);
      });

      signalHandlerRegistered = true;
    }
  }

  isCancelled(): boolean {
    return globalCancelled;
  }

  cancel(): void {
    handleSignal("manual");
  }

  onCancel(callback: () => void): void {
    this.listeners.push(callback);
    listeners.push(callback);
  }

  throwIfCancelled(): void {
    if (globalCancelled) {
      throw new Error("Operation cancelled by user");
    }
  }
}

/**
 * Reset cancellation state (useful for testing)
 */
export const resetCancellation = (): void => {
  globalCancelled = false;
  listeners.length = 0;
};
