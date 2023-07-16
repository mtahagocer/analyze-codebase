import * as path from 'path';
import { whatCase } from '../../utils';

export const analyzeFileName = (filePath: string) => {

    // Example: Check if file name contains uppercase characters
    const fileName = path.basename(filePath);

    const fileNameWithoutExtension = fileName.split(path.extname(fileName))[0]

    return whatCase(fileNameWithoutExtension);

}