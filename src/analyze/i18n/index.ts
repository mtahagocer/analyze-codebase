import * as fs from "fs/promises";
import * as path from "path";
import chalk from "chalk";
import fg from "fast-glob";
import * as readline from "readline";
import { ProgressBar } from "../../utils/progress";
import { createSpinner } from "../../utils/spinner";
import { CancellationToken } from "../../utils/cancellation";

export interface I18nAnalysisOptions {
  directory: string;
  i18nFile: string;
  extensions?: string[];
  exclude?: string[];
  maxConcurrency?: number;
}

interface FlattenedKey {
  path: string;
  value: any;
  originalPath: string[];
}

/**
 * Flattens a nested JSON object into dot-notation paths
 */
export const flattenKeys = (
  obj: any,
  prefix: string = "",
  originalPath: string[] = []
): FlattenedKey[] => {
  const keys: FlattenedKey[] = [];

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const currentPath = prefix ? `${prefix}.${key}` : key;
      const currentOriginalPath = [...originalPath, key];
      const value = obj[key];

      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        // Recursively flatten nested objects
        keys.push(...flattenKeys(value, currentPath, currentOriginalPath));
      } else {
        // Leaf node - this is a translation key
        keys.push({
          path: currentPath,
          value,
          originalPath: currentOriginalPath,
        });
      }
    }
  }

  return keys;
};

/**
 * Checks if a key is a parent of another key
 * e.g., "a.b" is a parent of "a.b.c"
 */
const isParentKey = (parentKey: string, childKey: string): boolean => {
  if (!childKey.startsWith(parentKey)) return false;
  // Check if the next character is a dot (to ensure it's a proper parent)
  return childKey.length === parentKey.length || childKey[parentKey.length] === '.';
};

/**
 * Searches for a translation key in file content
 * Handles various i18n usage patterns:
 * - t('key')
 * - t("key")
 * - t(`key`)
 * - t(`a.b.${variable}`) - Dynamic keys with template literals
 * - t('a.b.' + variable) - Dynamic keys with string concatenation
 * - i18n.t('key')
 * - $t('key')
 * - {t('key')}
 * - translate('key')
 */
const searchKeyInContent = (
  content: string,
  key: string,
  allKeys: FlattenedKey[]
): { found: boolean; isDynamic: boolean } => {
  // Escape special regex characters in the key
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Patterns to match static i18n usage:
  // - t('key'), t("key"), t(`key`)
  // - i18n.t('key')
  // - $t('key')
  // - translate('key')
  // - ['key'], ["key"], [`key`] (for array access)
  // - .key (for object access)
  const staticPatterns = [
    // Function calls: t('key'), i18n.t('key'), $t('key'), translate('key')
    new RegExp(`(?:t|i18n\\.t|\\$t|translate)\\s*\\(\\s*['"\`]${escapedKey}['"\`]`, "g"),
    // Array access: ['key'], ["key"], [`key`]
    new RegExp(`\\[\\s*['"\`]${escapedKey}['"\`]\\s*\\]`, "g"),
    // Object access: .key (but not as part of another key)
    new RegExp(`\\.${escapedKey}(?:\\s|;|,|\\)|\\]|\\}|\\n|$)`, "g"),
    // String contains the full key path
    new RegExp(`['"\`]${escapedKey}['"\`]`, "g"),
  ];

  // Check for static matches first
  if (staticPatterns.some((pattern) => pattern.test(content))) {
    return { found: true, isDynamic: false };
  }

  // Check for dynamic patterns (template literals with interpolation)
  // Pattern: t(`a.b.${variable}`) or t(`a.b.${var1}.${var2}`)
  // We need to check if the key is a parent of any dynamically constructed key
  const keyParts = key.split('.');
  
  // Build patterns for dynamic key construction
  // Match: t(`prefix.${variable}`) where prefix matches our key or is a parent
  for (let i = 0; i < keyParts.length; i++) {
    const partialKey = keyParts.slice(0, i + 1).join('.');
    const escapedPartialKey = partialKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    
    // Pattern for template literals: t(`a.b.${...}`)
    // Escape backticks properly in regex
    const templateLiteralPattern = new RegExp(
      "(?:t|i18n\\.t|\\$t|translate)\\s*\\(\\s*`[^`]*" + escapedPartialKey + "[^`]*\\$\\{[^}]+\\}[^`]*`",
      "g"
    );
    
    // Pattern for string concatenation: t('a.b.' + variable) or t("a.b." + variable)
    const concatPattern1 = new RegExp(
      `(?:t|i18n\\.t|\\$t|translate)\\s*\\(\\s*['"\`]${escapedPartialKey}\\.?['"\`]\\s*\\+`,
      "g"
    );
    
    // Pattern for reverse concatenation: t(variable + '.a.b')
    const concatPattern2 = new RegExp(
      `(?:t|i18n\\.t|\\$t|translate)\\s*\\([^)]*\\+\\s*['"\`]\\.?${escapedPartialKey}['"\`]`,
      "g"
    );
    
    if (
      templateLiteralPattern.test(content) ||
      concatPattern1.test(content) ||
      concatPattern2.test(content)
    ) {
      // If we found a dynamic pattern that matches this key or its parent,
      // mark this key and all its children as potentially used
      return { found: true, isDynamic: true };
    }
  }

  // Check if this key is a child of any dynamically used parent key
  // This handles cases where we have t(`a.b.${var}`) and need to mark a.b.c, a.b.d, etc. as used
  // Check all possible parent keys of the current key
  const currentKeyParts = key.split('.');
  for (let i = 1; i < currentKeyParts.length; i++) {
    const parentKey = currentKeyParts.slice(0, i).join('.');
    const escapedParentKey = parentKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    
    // Check if parent key is used in dynamic patterns
    const dynamicPattern = new RegExp(
      "(?:t|i18n\\.t|\\$t|translate)\\s*\\(\\s*`[^`]*" + escapedParentKey + "[^`]*\\$\\{[^}]+\\}",
      "g"
    );
    
    const concatPattern = new RegExp(
      "(?:t|i18n\\.t|\\$t|translate)\\s*\\(\\s*['\"`]" + escapedParentKey + "\\.?['\"`]\\s*\\+",
      "g"
    );
    
    if (dynamicPattern.test(content) || concatPattern.test(content)) {
      return { found: true, isDynamic: true };
    }
  }

  return { found: false, isDynamic: false };
};

/**
 * Collects all files to analyze
 */
const collectFiles = async (
  directory: string,
  extensions?: string[],
  exclude?: string[]
): Promise<string[]> => {
  const patterns: string[] = [];
  const ignorePatterns: string[] = [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/coverage/**",
    "**/.git/**",
    "**/.next/**",
    "**/public/**",
    "**/test/**",
    "**/tests/**",
    "**/mocks/**",
  ];

  if (exclude) {
    ignorePatterns.push(...exclude.map((ex) => `**/${ex}/**`));
  }

  const fileExtensions = extensions || [".ts", ".tsx", ".js", ".jsx", ".vue"];
  patterns.push(...fileExtensions.map((ext) => `**/*${ext}`));

  const files = await fg(patterns, {
    cwd: directory,
    ignore: ignorePatterns,
    absolute: true,
    onlyFiles: true,
    dot: false,
  });

  return files;
};

/**
 * Searches the codebase for usage of translation keys
 */
export const findUnusedKeys = async (
  options: I18nAnalysisOptions
): Promise<FlattenedKey[]> => {
  const { directory, i18nFile, extensions, exclude, maxConcurrency: providedConcurrency } = options;
  const cancellationToken = new CancellationToken();

  // Read and parse the i18n file
  const i18nFilePath = path.isAbsolute(i18nFile)
    ? i18nFile
    : path.join(directory, i18nFile);

  const spinner = createSpinner("📖 Loading translation file...");
  
  // Cleanup on cancellation
  cancellationToken.onCancel(() => {
    spinner.stop();
  });

  let i18nContent: any;
  try {
    const fileContent = await fs.readFile(i18nFilePath, "utf-8");
    i18nContent = JSON.parse(fileContent);
    spinner.succeed("✅ Translation file loaded");
  } catch (error) {
    spinner.fail(`❌ Failed to read translation file`);
    throw new Error(
      `Failed to read or parse i18n file: ${i18nFilePath}. ${error}`
    );
  }

  // Flatten all keys
  const allKeys = flattenKeys(i18nContent);
  
  // Show key count with animation
  const keySpinner = createSpinner(
    `🔍 Found ${chalk.cyan(allKeys.length)} translation keys to check...`
  );
  await new Promise((resolve) => setTimeout(resolve, 500)); // Brief animation
  keySpinner.succeed(
    `✅ Found ${chalk.cyan(allKeys.length)} translation keys to check`
  );

  // Collect files
  const fileSpinner = createSpinner("📁 Discovering files...");
  const files = await collectFiles(directory, extensions, exclude);
  fileSpinner.succeed(`✅ Found ${chalk.cyan(files.length)} files to analyze`);

  // Track which keys are used
  const usedKeys = new Set<string>();
  const dynamicKeys = new Set<string>(); // Keys that are used dynamically
  const keyUsageMap = new Map<string, string[]>(); // key -> array of file paths where it's used

  // Progress bar for file processing (primary indicator)
  const fileProgressBar = new ProgressBar({
    total: files.length,
    format: `${chalk.blue("{bar}")} | ${chalk.yellow("{percentage}%")} | ${chalk.white("Processing files: {value}/{total}")}`,
  });

  // Cleanup progress bar on cancellation
  cancellationToken.onCancel(() => {
    fileProgressBar.stop();
    console.log(chalk.yellow("\n\n⚠️  Cancellation requested. Cleaning up...\n"));
  });

  // Track progress
  let processedFiles = 0;
  let totalKeyChecks = 0;
  const keysCheckedPerFile = new Map<string, number>();

  // Process files in parallel batches with optimized concurrency
  // For file I/O operations, optimal concurrency is lower to avoid I/O contention
  // Too high concurrency can actually slow things down due to disk I/O bottlenecks
  const fileCount = files.length;
  // Optimal concurrency for file I/O: 20-30 is usually the sweet spot
  // Higher concurrency doesn't help much with disk I/O and can cause contention
  const defaultConcurrency = fileCount > 500 ? 30 : fileCount > 100 ? 25 : 20;
  const maxConcurrency = providedConcurrency || defaultConcurrency;
  
  // Show key checking progress as we process files
  console.log(
    chalk.cyan(
      `\n🔍 Checking ${chalk.bold(allKeys.length)} translation keys across ${chalk.bold(files.length)} files...\n` +
      chalk.gray(`   Using ${maxConcurrency} concurrent file readers (optimal for I/O performance)\n`)
    )
  );

  // Pre-compile regex patterns for all keys to avoid recompiling
  const keyPatterns = new Map<string, RegExp[]>();
  const dynamicPatterns = new Map<string, RegExp[]>();
  
  for (const keyData of allKeys) {
    const escapedKey = keyData.path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const keyParts = keyData.path.split('.');
    
    // Static patterns
    const staticPatterns = [
      new RegExp(`(?:t|i18n\\.t|\\$t|translate)\\s*\\(\\s*['"\`]${escapedKey}['"\`]`, "g"),
      new RegExp(`\\[\\s*['"\`]${escapedKey}['"\`]\\s*\\]`, "g"),
      new RegExp(`\\.${escapedKey}(?:\\s|;|,|\\)|\\]|\\}|\\n|$)`, "g"),
      new RegExp(`['"\`]${escapedKey}['"\`]`, "g"),
    ];
    keyPatterns.set(keyData.path, staticPatterns);
    
    // Dynamic patterns for parent keys
    const dynPatterns: RegExp[] = [];
    for (let i = 0; i < keyParts.length; i++) {
      const partialKey = keyParts.slice(0, i + 1).join('.');
      const escapedPartialKey = partialKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      
      dynPatterns.push(
        new RegExp(
          "(?:t|i18n\\.t|\\$t|translate)\\s*\\(\\s*`[^`]*" + escapedPartialKey + "[^`]*\\$\\{[^}]+\\}[^`]*`",
          "g"
        ),
        new RegExp(
          "(?:t|i18n\\.t|\\$t|translate)\\s*\\(\\s*['\"`]" + escapedPartialKey + "\\.?['\"`]\\s*\\+",
          "g"
        ),
        new RegExp(
          "(?:t|i18n\\.t|\\$t|translate)\\s*\\([^)]*\\+\\s*['\"`]\\.?" + escapedPartialKey + "['\"`]",
          "g"
        )
      );
    }
    dynamicPatterns.set(keyData.path, dynPatterns);
  }

  // Optimized: Process files in large batches with optimal concurrency
  const processFile = async (filePath: string): Promise<void> => {
    // Check cancellation before processing
    if (cancellationToken.isCancelled()) {
      throw new Error("Operation cancelled by user");
    }
    
    try {
      const content = await fs.readFile(filePath, "utf-8");
      
      // Optimized: Check all unused keys in a single pass
      // Only check keys that haven't been marked as used yet
      const keysToCheck = allKeys.filter((key) => !usedKeys.has(key.path));
      
      // Check cancellation periodically
      if (cancellationToken.isCancelled()) {
        throw new Error("Operation cancelled by user");
      }
      
      // Process keys in smaller batches to allow cancellation checks
      const keyBatchSize = 100; // Check 100 keys at a time
      for (let i = 0; i < keysToCheck.length; i += keyBatchSize) {
        if (cancellationToken.isCancelled()) {
          throw new Error("Operation cancelled by user");
        }
        
        const keyBatch = keysToCheck.slice(i, i + keyBatchSize);
        
        for (const keyData of keyBatch) {
          totalKeyChecks++;
          
          // Check static patterns first (faster)
          const staticPats = keyPatterns.get(keyData.path)!;
          if (staticPats.some((pattern) => pattern.test(content))) {
            usedKeys.add(keyData.path);
            if (!keyUsageMap.has(keyData.path)) {
              keyUsageMap.set(keyData.path, []);
            }
            keyUsageMap.get(keyData.path)!.push(filePath);
            continue;
          }
          
          // Check dynamic patterns
          const dynPats = dynamicPatterns.get(keyData.path)!;
          if (dynPats.some((pattern) => pattern.test(content))) {
            usedKeys.add(keyData.path);
            dynamicKeys.add(keyData.path);
            
            // If this is a parent key used dynamically, mark all children as potentially used
            for (const otherKey of allKeys) {
              if (isParentKey(keyData.path, otherKey.path)) {
                usedKeys.add(otherKey.path);
                dynamicKeys.add(otherKey.path);
              }
            }
            
            if (!keyUsageMap.has(keyData.path)) {
              keyUsageMap.set(keyData.path, []);
            }
            keyUsageMap.get(keyData.path)!.push(filePath);
          }
        }
      }
    } catch (error: any) {
      // Re-throw cancellation errors
      if (error?.message === "Operation cancelled by user") {
        throw error;
      }
      // Skip files that can't be read
      // Silently skip to avoid cluttering output
    }
    
    if (!cancellationToken.isCancelled()) {
      processedFiles++;
      fileProgressBar.update(1);
    }
  };

  // Process files in parallel batches
  const batches: string[][] = [];
  for (let i = 0; i < files.length; i += maxConcurrency) {
    batches.push(files.slice(i, i + maxConcurrency));
  }

  // Process all batches with cancellation support
  try {
    for (const batch of batches) {
      // Check cancellation before each batch
      if (cancellationToken.isCancelled()) {
        fileProgressBar.stop();
        throw new Error("Operation cancelled by user");
      }
      
      // Use Promise.allSettled to handle cancellation better
      const results = await Promise.allSettled(
        batch.map(async (filePath) => {
          if (cancellationToken.isCancelled()) {
            throw new Error("Operation cancelled by user");
          }
          return processFile(filePath);
        })
      );
      
      // Check if any promise was cancelled
      const cancelled = results.some(
        (result) =>
          result.status === "rejected" &&
          result.reason?.message === "Operation cancelled by user"
      );
      
      if (cancelled || cancellationToken.isCancelled()) {
        fileProgressBar.stop();
        throw new Error("Operation cancelled by user");
      }
    }
  } catch (error: any) {
    fileProgressBar.stop();
    if (error?.message === "Operation cancelled by user" || cancellationToken.isCancelled()) {
      throw new Error("Operation cancelled by user");
    }
    throw error;
  }
  
  cancellationToken.throwIfCancelled();

  fileProgressBar.complete();

  // Show summary with dynamic key information
  if (dynamicKeys.size > 0) {
    console.log(
      chalk.yellow(
        `\n⚠️  Note: Found ${chalk.bold(dynamicKeys.size)} keys used dynamically (e.g., t(\`a.b.\${var}\`))\n` +
        chalk.gray(`   These keys and their children are marked as used to prevent false positives.\n`)
      )
    );
  }

  console.log(
    chalk.green(
      `\n✅ Completed: Checked ${chalk.cyan(allKeys.length)} translation keys across ${chalk.cyan(processedFiles)} files\n`
    )
  );

  // Find unused keys
  const unusedKeys = allKeys.filter((key) => !usedKeys.has(key.path));

  return unusedKeys;
};

/**
 * Removes a key from a nested object using the original path
 */
const removeKeyFromObject = (obj: any, path: string[]): void => {
  if (path.length === 0) return;

  const [currentKey, ...remainingPath] = path;

  if (remainingPath.length === 0) {
    // This is the final key, delete it
    delete obj[currentKey];
  } else {
    // Navigate deeper
    if (obj[currentKey] && typeof obj[currentKey] === "object") {
      removeKeyFromObject(obj[currentKey], remainingPath);
      // Clean up empty objects
      if (Object.keys(obj[currentKey]).length === 0) {
        delete obj[currentKey];
      }
    }
  }
};

/**
 * Prompts user for confirmation
 */
const askConfirmation = (question: string): Promise<boolean> => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes");
    });
  });
};

/**
 * Analyzes and removes unused i18n keys
 */
export const analyzeAndRemoveUnusedKeys = async (
  options: I18nAnalysisOptions
): Promise<void> => {
  const { directory, i18nFile } = options;

  const i18nFilePath = path.isAbsolute(i18nFile)
    ? i18nFile
    : path.join(directory, i18nFile);

  console.log(
    chalk.bold(
      `\nAnalyzing unused translation keys in ${chalk.cyan(i18nFilePath)}\n`
    )
  );

  try {
    // Find unused keys
    const unusedKeys = await findUnusedKeys(options);
    
    // Check if cancelled
    if (unusedKeys.length === 0 && !options.maxConcurrency) {
      // This might be a cancellation, but we'll let it through for now
    }

    if (unusedKeys.length === 0) {
      console.log(chalk.green("\n✓ No unused translation keys found!\n"));
      return;
    }

    // Display unused keys
    console.log(
      chalk.yellow(
        `\nFound ${chalk.bold(unusedKeys.length)} unused translation key(s):\n`
      )
    );

    unusedKeys.forEach((key, index) => {
      console.log(
        chalk.gray(`${index + 1}. `) + chalk.white(key.path) + chalk.gray(` (${JSON.stringify(key.value)})`)
      );
    });

    // Ask for confirmation
    const confirmed = await askConfirmation(
      chalk.yellow(
        `\nDo you want to remove these ${unusedKeys.length} unused key(s)? (y/n): `
      )
    );

    if (!confirmed) {
      console.log(chalk.gray("\nOperation cancelled.\n"));
      return;
    }

    // Read the original file
    const fileContent = await fs.readFile(i18nFilePath, "utf-8");
    const i18nContent = JSON.parse(fileContent);

    // Remove unused keys
    for (const key of unusedKeys) {
      removeKeyFromObject(i18nContent, key.originalPath);
    }

    // Write back to file
    await fs.writeFile(
      i18nFilePath,
      JSON.stringify(i18nContent, null, 2) + "\n",
      "utf-8"
    );

    console.log(
      chalk.green(
        `\n✓ Successfully removed ${unusedKeys.length} unused translation key(s) from ${i18nFilePath}\n`
      )
    );
  } catch (error: any) {
    if (error?.message === "Operation cancelled by user") {
      console.log(chalk.yellow("\n\n✅ Analysis cancelled by user\n"));
      process.exit(130); // Standard exit code for SIGINT
    }
    console.error(chalk.red(`\nError: ${error}\n`));
    process.exit(1);
  }
};
