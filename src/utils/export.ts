import * as fs from "fs/promises";
import * as path from "path";
import chalk from "chalk";
import { IAnalyzeResult } from "../types";

export type ExportFormat = "json" | "csv" | "html";

export const exportResults = async (
  result: IAnalyzeResult,
  outputPath: string,
  format: ExportFormat = "json"
): Promise<string> => {
  const fullPath = path.resolve(outputPath);

  switch (format) {
    case "json":
      return await exportJSON(result, fullPath);
    case "csv":
      return await exportCSV(result, fullPath);
    case "html":
      return await exportHTML(result, fullPath);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};

const exportJSON = async (
  result: IAnalyzeResult,
  outputPath: string
): Promise<string> => {
  const jsonContent = JSON.stringify(result, null, 2);
  await fs.writeFile(outputPath, jsonContent, "utf-8");
  return outputPath;
};

const exportCSV = async (
  result: IAnalyzeResult,
  outputPath: string
): Promise<string> => {
  const lines: string[] = [];

  // Header
  lines.push("Type,Count,Percentage");

  // File name cases
  if (result.fileNameCases) {
    Object.entries(result.fileNameCases).forEach(([key, value]) => {
      const percentage = ((value / result.fileCount) * 100).toFixed(2);
      lines.push(`File Name: ${key},${value},${percentage}%`);
    });
  }

  // Content types
  Object.entries(result.output).forEach(([key, value]) => {
    const percentage = ((value / result.output.Physical) * 100).toFixed(2);
    lines.push(`Content: ${key},${value},${percentage}%`);
  });

  await fs.writeFile(outputPath, lines.join("\n"), "utf-8");
  return outputPath;
};

const exportHTML = async (
  result: IAnalyzeResult,
  outputPath: string
): Promise<string> => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Codebase Analysis Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
        }
        .header .meta {
            margin-top: 10px;
            opacity: 0.9;
        }
        .section {
            background: white;
            padding: 25px;
            border-radius: 10px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .section h2 {
            margin-top: 0;
            color: #333;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background: #f8f9fa;
            font-weight: 600;
            color: #495057;
        }
        tr:hover {
            background: #f8f9fa;
        }
        .stat {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            margin: 5px;
            font-weight: 600;
        }
        .percentage {
            color: #28a745;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 Codebase Analysis Report</h1>
        <div class="meta">
            <p><strong>Date:</strong> ${new Date(result.date).toLocaleString()}</p>
            <p><strong>Files Analyzed:</strong> ${result.fileCount}</p>
            <p><strong>Directory:</strong> ${result.options.directory}</p>
        </div>
    </div>

    <div class="section">
        <h2>📝 File Name Case Analysis</h2>
        <table>
            <thead>
                <tr>
                    <th>Case Type</th>
                    <th>Count</th>
                    <th>Percentage</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(result.fileNameCases)
                  .sort(([, a], [, b]) => b - a)
                  .map(
                    ([key, value]) => `
                <tr>
                    <td>${key}</td>
                    <td>${value}</td>
                    <td class="percentage">${(
                      (value / result.fileCount) *
                      100
                    ).toFixed(2)}%</td>
                </tr>
                `
                  )
                  .join("")}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>📊 Content Type Analysis</h2>
        <table>
            <thead>
                <tr>
                    <th>Type</th>
                    <th>Count</th>
                    <th>Percentage</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(result.output)
                  .map(
                    ([key, value]) => `
                <tr>
                    <td>${key}</td>
                    <td>${value}</td>
                    <td class="percentage">${(
                      (value / result.output.Physical) *
                      100
                    ).toFixed(2)}%</td>
                </tr>
                `
                  )
                  .join("")}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>⚙️ Analysis Options</h2>
        <p><strong>Framework:</strong> ${result.options.framework || "N/A"}</p>
        <p><strong>Extensions:</strong> ${result.options.extensions?.join(", ") || "All"}</p>
        <p><strong>Exclude:</strong> ${result.options.exclude?.join(", ") || "None"}</p>
    </div>
</body>
</html>
  `.trim();

  await fs.writeFile(outputPath, html, "utf-8");
  return outputPath;
};
