import * as path from 'path';
import { analyzeFileName } from '../../analyze/file/fileName';
import { analyzeLineCountByCategory } from '../../analyze/sourceCode/lineCount';
import { ICodeContentType } from '../../types';


export const analyzeFile = (filePath: string, output: ICodeContentType) => {

    const fileName = path.basename(filePath);

    const fileNameCase = analyzeFileName(fileName);

    analyzeLineCountByCategory(filePath, output);


    return { fileNameCase };
}
