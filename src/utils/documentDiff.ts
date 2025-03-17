import { DocumentBlock, DocumentContent, Operation, OperationType } from '@/types/book';

// 计算两个文档块是否相同
const areBlocksEqual = (block1: DocumentBlock, block2: DocumentBlock): boolean => {
    if (block1.id !== block2.id || block1.type !== block2.type) {
        return false;
    }
    
    return JSON.stringify(block1.content) === JSON.stringify(block2.content) &&
           JSON.stringify(block1.attributes) === JSON.stringify(block2.attributes);
};

// 查找块的移动
const findMovedBlocks = (
    oldBlocks: DocumentBlock[],
    newBlocks: DocumentBlock[],
    oldIndex: number,
    newIndex: number
): Operation | null => {
    const oldBlock = oldBlocks[oldIndex];
    
    // 在新文档中查找相同ID的块
    const movedIndex = newBlocks.findIndex((block, i) => {
        return i !== newIndex && block.id === oldBlock.id;
    });
    
    if (movedIndex !== -1) {
        return {
            type: 'move',
            path: [oldIndex.toString()],
            position: movedIndex
        };
    }
    
    return null;
};

// 生成块的路径
const getBlockPath = (index: number): string[] => {
    return [index.toString()];
};

// 计算文档差异
export const calculateDocumentDiff = (oldContent: DocumentContent, newContent: DocumentContent): Operation[] => {
    const operations: Operation[] = [];
    const oldBlocks = oldContent.blocks;
    const newBlocks = newContent.blocks;
    const maxLen = Math.max(oldBlocks.length, newBlocks.length);
    
    // 使用动态规划计算最长公共子序列(LCS)
    const lcs: number[][] = Array(oldBlocks.length + 1).fill(0)
        .map(() => Array(newBlocks.length + 1).fill(0));
    
    for (let i = 1; i <= oldBlocks.length; i++) {
        for (let j = 1; j <= newBlocks.length; j++) {
            if (areBlocksEqual(oldBlocks[i - 1], newBlocks[j - 1])) {
                lcs[i][j] = lcs[i - 1][j - 1] + 1;
            } else {
                lcs[i][j] = Math.max(lcs[i - 1][j], lcs[i][j - 1]);
            }
        }
    }
    
    // 根据LCS生成操作序列
    let i = oldBlocks.length;
    let j = newBlocks.length;
    
    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && areBlocksEqual(oldBlocks[i - 1], newBlocks[j - 1])) {
            // 块相同，不需要操作
            i--;
            j--;
        } else if (j > 0 && (i === 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
            // 插入操作
            operations.unshift({
                type: 'insert',
                path: getBlockPath(j - 1),
                content: newBlocks[j - 1]
            });
            j--;
        } else if (i > 0 && (j === 0 || lcs[i][j - 1] < lcs[i - 1][j])) {
            // 检查是否是移动操作
            const moveOp = findMovedBlocks(oldBlocks, newBlocks, i - 1, j - 1);
            if (moveOp) {
                operations.unshift(moveOp);
            } else {
                // 删除操作
                operations.unshift({
                    type: 'delete',
                    path: getBlockPath(i - 1)
                });
            }
            i--;
        }
    }
    
    // 检查更新操作
    for (let k = 0; k < maxLen; k++) {
        if (k < oldBlocks.length && k < newBlocks.length) {
            const oldBlock = oldBlocks[k];
            const newBlock = newBlocks[k];
            
            if (oldBlock.id === newBlock.id && !areBlocksEqual(oldBlock, newBlock)) {
                operations.push({
                    type: 'update',
                    path: getBlockPath(k),
                    content: newBlock
                });
            }
        }
    }
    
    return operations;
}; 