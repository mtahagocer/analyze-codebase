import { Dirent } from 'fs';
import * as fs from 'fs/promises';
import * as path from 'path';


export interface ITraverseDirectoryProps {
    directory: string;

    exclude?: string[];

    extensions?: string[];

    checkFileNames?: boolean;

    onFile: (filePath: string) => void;

    onDirectory?: (dirPath: string) => void;

}


export const traverseDirectory = async ({
    directory,
    onFile,
    onDirectory,
    exclude,
    extensions,
    checkFileNames = true,
}: ITraverseDirectoryProps) => {
    const files = await fs.readdir(directory, { withFileTypes: true });

    const tasks = files.map(async (file: Dirent) => {

        const filePath = path.join(directory, file.name);

        if (exclude?.includes?.(file.name)) return;

        if (file.isDirectory()) {

            onDirectory?.(filePath);

            await traverseDirectory({
                directory: filePath,
                onFile,
                exclude,
                extensions,
                onDirectory,
                checkFileNames,
            });

        } else if (checkFileNames) {

            const ext = path.extname(file.name);

            if (extensions?.length) {

                if (extensions.includes(ext)) onFile(filePath);

            } else onFile(filePath);

        }
    });

    await Promise.all(tasks);
};