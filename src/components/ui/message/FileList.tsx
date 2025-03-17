import React, { memo } from 'react';
import { FileIcon } from "lucide-react";
import { FileListProps } from './types';
import { formatFileSize, isImageFile } from './utils';

const FileList = memo(({ files }: FileListProps) => {
    const nonImageFiles = files.filter(file => !isImageFile(file));

    if (nonImageFiles.length === 0) return null;

    return (
        <div className="mt-3 space-y-2">
            {nonImageFiles.map((file, index) => {
                const name = 'filename' in file ? file.filename : (file as any).name || '未知文件';
                const size = 'size' in file ? file.size : undefined;
                
                return (
                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center">
                            <FileIcon className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                                {name}
                            </span>
                            {size && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatFileSize(size)}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
});

FileList.displayName = 'FileList';

export default FileList; 