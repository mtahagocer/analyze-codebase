# Features

## 🎯 Core Features

### Codebase Analysis
- **Recursive Directory Analysis**: Analyzes entire codebase structures recursively
- **File Name Case Detection**: Identifies naming conventions (camelCase, PascalCase, kebab-case, etc.)
- **Content Type Analysis**: Categorizes code into physical lines, source code, comments, TODOs, etc.
- **Framework Support**: Optional framework specification for framework-specific insights
- **Extension Filtering**: Filter analysis by file extensions (`.ts`, `.tsx`, `.js`, etc.)
- **Directory Exclusion**: Exclude specific directories from analysis (node_modules, dist, etc.)

### i18n Translation Key Analysis
- **Unused Key Detection**: Find translation keys that are defined but never used
- **Nested Key Support**: Handles deeply nested JSON translation structures
- **Multiple Pattern Matching**: Detects various i18n usage patterns:
  - `t('key')`, `t("key")`, `t(\`key\`)`
  - `i18n.t('key')`
  - `$t('key')`
  - `translate('key')`
  - Array access: `['key']`, `["key"]`
  - Object access: `.key`
- **Safe Deletion**: Interactive confirmation before removing unused keys
- **Automatic Cleanup**: Removes empty objects after key deletion

## 🆕 Version 1.3.0 Features

### 🎨 Enhanced User Experience

#### Progress Indicators
- **Real-time Progress Bars**: Visual progress indicators during analysis
- **Loading Spinners**: Elegant spinners for long-running operations
- **File Count Updates**: Real-time file count during analysis
- **Customizable Formats**: Configurable progress bar appearance

#### Beautiful Output
- **Boxed Headers**: Professional boxed sections using `boxen`
- **Emoji Indicators**: Visual emojis for different content types and metrics
- **Color-coded Statistics**: Color-coded percentages and values
- **Visual Hierarchy**: Clear visual organization of information
- **Summary Boxes**: Highlighted summary information

#### Interactive Mode
- **Config File Initialization**: `init` command for easy setup
- **Interactive Prompts**: Step-by-step configuration creation
- **Smart Defaults**: Sensible defaults for all options

### ⚙️ Configuration

#### Config File Support
- **Persistent Settings**: Save settings in `.analyze-codebase.json`
- **Auto-discovery**: Automatically finds config files in parent directories
- **CLI Override**: Command-line options take precedence over config
- **Team Sharing**: Share configuration across team members
- **CI/CD Ready**: Perfect for automated workflows

#### Flexible Options
- **Framework Specification**: Specify project framework
- **Extension Filtering**: Include/exclude specific file types
- **Directory Exclusion**: Exclude build artifacts and dependencies
- **Analysis Toggles**: Enable/disable specific analysis types
- **Performance Tuning**: Configure concurrency levels

### 📤 Export & Reporting

#### Multiple Export Formats
- **JSON Export**: Structured data for programmatic use
- **CSV Export**: Spreadsheet-friendly format for data analysis
- **HTML Export**: Beautiful, shareable HTML reports with styling
- **Custom Output Paths**: Specify where to save exports

#### Report Features
- **Comprehensive Statistics**: All analysis metrics included
- **Visual Charts**: HTML reports with styled tables
- **Metadata**: Analysis date, directory, options included
- **Shareable**: Easy to share with team members

### ⚡ Performance

#### Parallel Processing
- **Concurrent File Analysis**: Process multiple files simultaneously
- **Configurable Concurrency**: Adjust based on system resources
- **Optimal Defaults**: Smart defaults for most use cases
- **Performance Metrics**: Track analysis duration

#### Optimized Algorithms
- **Fast File Discovery**: Uses `fast-glob` for efficient file finding
- **Efficient File Reading**: Optimized file I/O operations
- **Memory Efficient**: Handles large codebases without issues
- **Debounced Watch Mode**: Prevents excessive re-analysis

### 👀 Watch Mode

#### Real-time Analysis
- **File Watching**: Automatically detects file changes
- **Debounced Updates**: Smart debouncing to prevent excessive analysis
- **Graceful Shutdown**: Clean exit on Ctrl+C
- **Change Detection**: Monitors adds, changes, and deletions

#### Development Workflow
- **Continuous Monitoring**: Keep analysis up-to-date during development
- **Instant Feedback**: See results immediately after changes
- **Resource Efficient**: Only re-analyzes when needed

### 🧪 Quality & Reliability

#### Testing
- **Comprehensive Test Suite**: Tests for all major utilities
- **Vitest Framework**: Modern, fast testing framework
- **Test Coverage**: Key functionality covered by tests
- **CI/CD Ready**: Easy to integrate into CI pipelines

#### Error Handling
- **Helpful Error Messages**: Clear, actionable error messages
- **Graceful Failures**: Handles errors without crashing
- **Validation**: Input validation with helpful suggestions
- **Type Safety**: Full TypeScript support

## 📊 Analysis Metrics

### File Name Analysis
- **Case Detection**: Identifies naming conventions
- **Statistics**: Count and percentage for each case type
- **Consistency Checking**: Highlights inconsistent naming

### Content Analysis
- **Physical Lines**: Total lines in files
- **Source Code**: Actual code lines
- **Comments**: Single-line, block, and mixed comments
- **Empty Lines**: Blank lines in code
- **TODOs**: TODO comments found
- **Percentages**: Breakdown of content types

### i18n Analysis
- **Key Discovery**: Finds all translation keys
- **Usage Detection**: Identifies where keys are used
- **Unused Keys**: Lists keys that are never referenced
- **Safe Removal**: Interactive deletion with confirmation

## 🎯 Use Cases

### Development
- **Code Quality**: Understand codebase structure
- **Naming Consistency**: Ensure consistent naming conventions
- **Code Metrics**: Track code statistics over time
- **Translation Management**: Keep i18n files clean

### Code Reviews
- **Pre-commit Analysis**: Analyze before committing
- **Pull Request Reports**: Generate reports for PRs
- **Team Standards**: Enforce team coding standards
- **Documentation**: Generate codebase documentation

### CI/CD Integration
- **Automated Analysis**: Run in CI pipelines
- **Quality Gates**: Set thresholds for code quality
- **Trend Analysis**: Track metrics over time
- **Reporting**: Generate reports for stakeholders

### Project Management
- **Codebase Health**: Monitor overall codebase health
- **Technical Debt**: Identify areas needing attention
- **Resource Planning**: Understand codebase size and complexity
- **Onboarding**: Help new team members understand codebase

## 🔧 Technical Details

### Supported File Types
- TypeScript (`.ts`, `.tsx`)
- JavaScript (`.js`, `.jsx`)
- Any text-based source files
- Configurable via extensions option

### Supported Frameworks
- React
- Vue
- Angular
- Node.js
- Any framework (customizable)

### Performance Characteristics
- **Small Codebases** (< 100 files): < 1 second
- **Medium Codebases** (100-1000 files): 1-5 seconds
- **Large Codebases** (1000+ files): 5-30 seconds (with parallel processing)
- **Watch Mode**: Near-instant updates on file changes

### System Requirements
- Node.js 14+ (ES2018+)
- Minimal dependencies
- Works on Windows, macOS, and Linux
- No external services required

## 🚀 Getting Started

### Quick Start
```bash
npm install -g analyze-codebase
analyze-codebase init
analyze-codebase .
```

### Common Workflows
```bash
# Basic analysis
analyze-codebase ./src

# With watch mode
analyze-codebase ./src --watch

# Export HTML report
analyze-codebase ./src --export html --output report.html

# Check i18n keys
analyze-codebase ./src --i18n-file messages/en.json
```

## 📈 Future Features

Planned enhancements:
- Code complexity analysis
- Dependency analysis
- Git integration
- Plugin system
- Web dashboard
- More export formats
