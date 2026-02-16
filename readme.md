<p align="center">
  <h1 align="center">analyze-codebase</h1>
  <p align="center">
    <strong>Know your codebase. Fix what's broken. Ship with confidence.</strong>
  </p>
  <p align="center">
    <a href="https://www.npmjs.com/package/analyze-codebase"><img src="https://img.shields.io/npm/v/analyze-codebase.svg?style=flat-square&color=blue" alt="npm version"></a>
    <a href="https://www.npmjs.com/package/analyze-codebase"><img src="https://img.shields.io/npm/dm/analyze-codebase.svg?style=flat-square&color=green" alt="npm downloads"></a>
    <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" alt="License: MIT"></a>
    <a href="https://github.com/mtahagocer/analyze-codebase"><img src="https://img.shields.io/github/stars/mtahagocer/analyze-codebase?style=flat-square" alt="GitHub stars"></a>
  </p>
</p>

---

A zero-config CLI that scans your entire project in seconds and gives you a clear picture of what's inside: **file structure**, **naming conventions**, **code-vs-comment ratios**, and most uniquely, **unused i18n translation keys** that bloat your bundles.

```bash
npx analyze-codebase ./src
```

That's it. No config needed.

## Why analyze-codebase?

| Problem | Solution |
|---------|----------|
| "How consistent are our naming conventions?" | Detects 13+ naming cases (camelCase, PascalCase, kebab-case, snake_case...) |
| "How much of our code is actually comments?" | Breaks down physical lines, source code, comments, TODOs, empty lines |
| "We have hundreds of translation keys. Which ones are unused?" | Scans your entire codebase for unused i18n keys and safely removes them |
| "I need a report for my team" | Export as **HTML**, **CSV**, or **JSON** with one flag |
| "I want this running in my workflow" | Watch mode, CI/CD friendly, config file support |

## Quick Start

```bash
# Install globally
npm install -g analyze-codebase

# Or run instantly with npx
npx analyze-codebase .
```

### Setup a config file (optional)

```bash
analyze-codebase init
```

This creates `.analyze-codebase.json` in your project root with your preferred settings. After that, just run `analyze-codebase` - it auto-discovers your config.

## Features

### 1. Codebase Structure Analysis

Recursively scans your project and provides a breakdown of:

- **File naming conventions** - Are your files consistently named? camelCase? PascalCase? kebab-case? You'll see the exact distribution.
- **Code content metrics** - Physical lines, source code lines, comments, block comments, single-line comments, TODOs, empty lines.
- **Smart defaults** - Automatically excludes `node_modules`, `dist`, `build`, `coverage`, `.git`, `.next`, `public`, `test`, `tests`, `mocks`.

```bash
# Analyze TypeScript files in your src directory
analyze-codebase ./src --extensions ts tsx

# Analyze with a specific framework tag
analyze-codebase ./src -f react --extensions ts tsx js jsx
```

> **Tip:** Extensions work with or without the dot prefix - both `ts` and `.ts` are accepted.

### 2. Unused i18n Translation Key Detection

This is the feature that sets `analyze-codebase` apart. If you work with internationalization, you know the pain: translation files grow over time, keys get orphaned, and nobody knows which ones are still in use.

```bash
analyze-codebase ./src --i18n-file locales/en.json
```

**What it does:**

1. Parses your translation JSON (supports deeply nested structures)
2. Flattens all keys to dot-notation paths (e.g., `common.buttons.submit`)
3. Scans every source file in your project for usage
4. Shows you exactly which keys are unused
5. Asks for confirmation, then safely removes them

**Supported patterns** - it understands how real apps use translations:

```js
// All of these are detected:
t('key')                    // react-i18next, i18next
t("key")                    // double quotes
t(`key`)                    // template literals
i18n.t('key')               // direct i18n object access
$t('key')                   // Vue i18n
translate('key')            // custom translate functions

// Even dynamic keys:
t(`namespace.${variable}`)  // template literal interpolation
t('namespace.' + variable)  // string concatenation
```

When dynamic keys are detected, all child keys under that namespace are automatically marked as used - preventing false positives.

### 3. Export Reports

Generate shareable reports in three formats:

```bash
# Beautiful styled HTML report
analyze-codebase ./src --export html --output report.html

# Spreadsheet-friendly CSV
analyze-codebase ./src --export csv --output data.csv

# Structured JSON for programmatic use
analyze-codebase ./src --export json --output results.json
```

The HTML report includes styled tables, gradient headers, and is ready to share with your team or stakeholders.

### 4. Watch Mode

Automatically re-runs analysis whenever files change. Perfect for development:

```bash
analyze-codebase ./src --watch
```

- 500ms debounce to prevent excessive runs
- Graceful Ctrl+C shutdown
- Works with all analysis options

### 5. Parallel Processing

Files are processed in parallel with auto-optimized concurrency:

| Project Size | Default Concurrency |
|-------------|-------------------|
| < 100 files | 20 concurrent ops |
| 100-500 files | 25 concurrent ops |
| 500+ files | 30 concurrent ops |

```bash
# Override if needed
analyze-codebase ./src --max-concurrency 50
```

## All CLI Options

```
Usage: analyze-codebase [directory] [options]

Options:
  -f, --framework <name>          Tag the framework (react, vue, angular...)
  -e, --extensions <ext...>       File extensions to include (ts tsx js jsx)
  -exc, --exclude <dirs...>       Additional directories to exclude
  --checkFileNames [bool]         Analyze file naming conventions (default: true)
  --checkFileContent [bool]       Analyze code content metrics (default: true)
  -w, --writeJsonOutput [bool]    Write JSON output to track changes over time
  --i18n-file <path>              Path to i18n JSON file for unused key detection
  --watch                         Re-analyze automatically on file changes
  --no-progress                   Disable progress bar (useful for CI/CD)
  --max-concurrency <number>      Max parallel file operations (default: auto)
  --export <format>               Export as json, csv, or html
  --output <path>                 Output file path for export

Commands:
  init                            Create .analyze-codebase.json interactively
```

## Config File

Create `.analyze-codebase.json` in your project root (or run `analyze-codebase init`):

```json
{
  "extensions": [".ts", ".tsx", ".js", ".jsx"],
  "exclude": ["node_modules", "dist", "build"],
  "checkFileNames": true,
  "checkFileContent": true,
  "framework": "react",
  "showProgress": true,
  "parallel": true
}
```

The config is auto-discovered by searching up the directory tree. CLI flags always take precedence over config values.

## Real-World Examples

### Code Review Preparation

```bash
# Get a full picture before a code review
analyze-codebase ./src --extensions ts tsx --export html --output review.html
```

### CI/CD Pipeline

```bash
# Silent mode for CI - just export the data
analyze-codebase ./src --no-progress --export json --output analysis.json
```

### Translation Cleanup Sprint

```bash
# Find and remove all unused translation keys
analyze-codebase ./src --i18n-file public/locales/en.json --extensions ts tsx
```

### Monorepo Analysis

```bash
# Analyze specific packages
analyze-codebase ./packages/web --extensions ts tsx -f react
analyze-codebase ./packages/api --extensions ts -f express
```

## Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create your branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test them: `npm test`
4. Commit: `git commit -m "feat: add amazing feature"`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request

## License

MIT - see [LICENSE](./LICENSE) for details.

---

<p align="center">
  <sub>Built by <a href="https://github.com/mtahagocer">Taha Gocer</a></sub>
</p>
