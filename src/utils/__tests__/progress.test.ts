import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ProgressBar } from "../progress";

describe("ProgressBar", () => {
  let progressBar: ProgressBar;

  beforeEach(() => {
    // Suppress console output during tests
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    if (progressBar) {
      progressBar.stop();
    }
    vi.restoreAllMocks();
  });

  it("should create a progress bar with total", () => {
    progressBar = new ProgressBar({ total: 100 });
    expect(progressBar).toBeInstanceOf(ProgressBar);
    progressBar.stop();
  });

  it("should update progress", () => {
    progressBar = new ProgressBar({ total: 100 });
    progressBar.update(10);
    progressBar.update(20);
    progressBar.stop();
  });

  it("should set total", () => {
    progressBar = new ProgressBar({ total: 50 });
    progressBar.setTotal(100);
    progressBar.stop();
  });

  it("should complete progress bar", () => {
    progressBar = new ProgressBar({ total: 100 });
    progressBar.complete();
  });
});
