import * as fs from 'fs';
import { ICodeContentType } from '../../types';

/**
 * Analyze the line count of the specified file
 */
export const analyzeLineCount = (filePath: string) => {

    const fileContent = fs.readFileSync(filePath, 'utf8');

    return fileContent.split('\n').length;
}

export const isSingleLineComment = (line = "") => line.startsWith('//');

export const isBlockComment = (line = "") =>
    line.startsWith('/*') && line.endsWith('*/');

export const isMixedComment = (line = "") =>
    (line.startsWith('/*') && !line.endsWith('*/')) || line.startsWith('*');

export const isEmptyBlockComment = (line = "") =>
    line.startsWith('/*') && !line.endsWith('*/');

export const isComment = (line = "") => {
    return isSingleLineComment(line) || isBlockComment(line) || isMixedComment(line) || isEmptyBlockComment(line);
}

export const isToDo = (line = "") => {
    return (line.includes('TODO'))
};

export const analyzeLineCountByCategory = (
    filePath: string,
    output: ICodeContentType
) => {

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.split('\n') || "";

    let lineIndex = 0;

    while (lineIndex < lines.length) {
        const line = lines[lineIndex].trim();

        output.Physical++;

        if (line === '') output.Empty++;
        else if (isSingleLineComment(line)) {

            output.SingleLineComment++;

            output.Comment++;

        } else if (isBlockComment(line)) {

            output.BlockComment++;

            output.Comment++;

        } else if (isMixedComment(line)) {

            output.Mixed++;

            output.Comment++;

            let blockCommentLines = 0;

            while (lineIndex < lines.length && !lines[lineIndex]?.endsWith('*/')) {

                blockCommentLines++;

                lineIndex++;
            }

            if (isEmptyBlockComment(line)) output.EmptyBlockComment += blockCommentLines;
            else output.BlockComment += blockCommentLines;

        }

        if (isToDo(line)) output.ToDo++;

        lineIndex++;
    }

    output.Source = output.Physical - output.Comment - output.Empty - output.ToDo;

    return output;
};
