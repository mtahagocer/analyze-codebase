
export interface IAnalysisOptions {
    directory: string;
    framework?: string;
    extensions?: string[];
    exclude?: string[];
    // Add conventions property to represent the naming conventions to analyze
    conventions?: string[];

    checkFileNames?: boolean;
    checkFileContent?: boolean;
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