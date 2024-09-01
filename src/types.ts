export interface IAnalysisOptions {
  directory: string;
  framework?: string;
  extensions?: string[];
  exclude?: string[];
  // Add conventions property to represent the naming conventions to analyze
  conventions?: string[];

  checkFileNames?: boolean;
  checkFileContent?: boolean;

  writeJsonOutput?: boolean;
}

export interface IViolation {
  filePath: string;
  message: string;
  type: string; // Add a type property to represent the violation type
}

export interface Identifier {
  name: string;
  line: number;
}

export interface ICodeContentType {
  Physical: number;
  Source: number;
  Comment: number;
  SingleLineComment: number;
  BlockComment: number;
  Mixed: number;
  EmptyBlockComment: number;
  Empty: number;
  ToDo: number;
}
export interface IAnalyzeResult {
  // Add sameAsBefore property to represent the number of files with the same content as before
  sameAsBefore?: number;
  date: string;
  fileCount: number;
  fileNameCases: Record<string, number>;
  options: IAnalysisOptions;
  output: ICodeContentType;
}

export type IAnalyzeDataOutput = {
  totalAnalyzeCount: number;
  firstAnalyzeDate: string;
  lastAnalyzeDate: string;
  results: IAnalyzeResult[];
};
