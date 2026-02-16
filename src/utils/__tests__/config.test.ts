import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fs from "fs/promises";
import * as path from "path";
import { findConfigFile, loadConfig, createConfigFile } from "../config";

describe("Config", () => {
  const testDir = path.join(__dirname, "../../../test-temp");
  const configPath = path.join(testDir, ".analyze-codebase.json");

  beforeEach(async () => {
    // Create test directory
    try {
      await fs.mkdir(testDir, { recursive: true });
    } catch {
      // Directory might already exist
    }
  });

  afterEach(async () => {
    // Clean up test files
    try {
      await fs.unlink(configPath);
    } catch {
      // File might not exist
    }
    try {
      await fs.rmdir(testDir);
    } catch {
      // Directory might not be empty
    }
  });

  it("should create a config file", async () => {
    const config = {
      extensions: [".ts", ".tsx"],
      exclude: ["node_modules"],
      checkFileNames: true,
      checkFileContent: true,
    };

    const createdPath = await createConfigFile(testDir, config);
    expect(createdPath).toBe(configPath);

    const exists = await fs.access(configPath).then(() => true).catch(() => false);
    expect(exists).toBe(true);
  });

  it("should load a config file", async () => {
    const config = {
      extensions: [".ts", ".tsx"],
      exclude: ["node_modules"],
      checkFileNames: true,
      checkFileContent: true,
    };

    await createConfigFile(testDir, config);
    const loaded = await loadConfig(testDir);

    expect(loaded).toBeTruthy();
    expect(loaded?.extensions).toEqual(config.extensions);
    expect(loaded?.exclude).toEqual(config.exclude);
  });

  it("should find config file in directory", async () => {
    const config = {
      extensions: [".ts"],
    };

    await createConfigFile(testDir, config);
    const found = await findConfigFile(testDir);

    expect(found).toBe(configPath);
  });

  it("should return null if config file doesn't exist", async () => {
    const found = await findConfigFile(testDir);
    expect(found).toBeNull();
  });
});
