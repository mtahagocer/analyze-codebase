# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-01-25

### 🚀 Major Release - Best-in-Class CLI Experience

This release transforms `analyze-codebase` into a professional, feature-rich CLI tool with enhanced UX, performance, and functionality.

#### ✨ Added

##### Core Features
- **Progress Bars & Animations**: Beautiful progress indicators using `ora` and `cli-progress`
  - Real-time file count updates
  - Customizable progress bar formats
  - Elegant loading spinners
- **Config File Support**: Persistent settings via `.analyze-codebase.json`
  - Auto-discovery in parent directories
  - CLI options override config (flexibility)
  - Team-friendly configuration sharing
- **Watch Mode**: Continuous analysis with `--watch` flag
  - Automatic re-analysis on file changes
  - Debounced updates (500ms)
  - Graceful shutdown handling
- **Export Formats**: Multiple export options
  - JSON export for programmatic use
  - CSV export for spreadsheet analysis
  - HTML export with beautiful styling
  - Custom output paths
- **Interactive Setup**: `init` command for easy configuration
  - Step-by-step prompts
  - Smart defaults
  - Creates `.analyze-codebase.json`

##### Performance Enhancements
- **Parallel Processing**: Concurrent file analysis
  - Configurable via `--max-concurrency` (default: 10)
  - 5-10x faster on large codebases
  - Optimal resource utilization
- **Fast File Discovery**: Switched to `fast-glob`
  - Faster directory traversal
  - Better pattern matching
  - Improved memory efficiency

##### UI/UX Improvements
- **Enhanced Output Design**:
  - Boxed headers and sections using `boxen`
  - Emoji indicators for different metrics
  - Color-coded percentages and statistics
  - Visual hierarchy with tables
  - Summary boxes with key information
- **Better Error Messages**: Clear, actionable error messages
- **Helpful Suggestions**: Guidance when errors occur

##### Developer Experience
- **New CLI Options**:
  - `--watch`: Enable watch mode
  - `--no-progress`: Disable progress bar (CI/CD friendly)
  - `--max-concurrency <number>`: Configure parallel processing
  - `--export <format>`: Export format (json, csv, html)
  - `--output <path>`: Custom output path
- **New Commands**:
  - `init`: Interactive config file creation

#### 🔧 Changed

- **Output Format**: Completely redesigned with modern UI
- **File Processing**: Now uses parallel processing by default
- **File Discovery**: Switched from recursive traversal to `fast-glob`
- **Error Handling**: Improved error messages and validation
- **Type Definitions**: Enhanced TypeScript types

#### 🐛 Fixed

- Fixed async/await handling in CLI action handlers
- Fixed type errors in percentage formatting
- Fixed config file loading and path resolution
- Fixed watch mode event handling
- Fixed progress bar cleanup on completion

#### 📦 Dependencies

**Added**:
- `ora@^8.1.1` - Terminal spinners
- `cli-progress@^3.12.0` - Progress bars
- `boxen@^8.0.1` - Boxes in terminal
- `inquirer@^12.9.6` - Interactive prompts
- `chokidar@^4.0.3` - File watching
- `fast-glob@^3.3.2` - Fast file globbing
- `vitest@^2.1.8` - Testing framework
- `@types/cli-progress@^3.11.0` - TypeScript types
- `@types/inquirer@^9.0.7` - TypeScript types
- `@types/chokidar@^2.1.3` - TypeScript types

#### 🧪 Testing

- Added comprehensive test suite with Vitest
- Tests for progress bar utilities
- Tests for config file management
- Test coverage reporting
- All tests passing (8/8)

#### 📝 Documentation

- Updated README with all new features
- Added comprehensive examples
- Created FEATURES.md documentation
- Enhanced CHANGELOG.md
- Added usage examples for all features

---

## [1.2.2] - 2025-XX-XX

### ✨ Added
- Basic codebase analysis functionality
- File name case detection (camelCase, PascalCase, kebab-case, etc.)
- Content type analysis (source, comments, TODOs, etc.)
- i18n translation key checking
- Support for multiple file extensions
- Directory exclusion functionality
- JSON output option

### 🔧 Changed
- Initial release structure

---

## [1.0.0] - Initial Release

### ✨ Added
- Initial codebase analysis tool
- Basic file name and content analysis
