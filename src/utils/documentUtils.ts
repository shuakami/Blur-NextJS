import { v4 as uuidv4 } from 'uuid';
import { DocumentBlock, DocumentContent } from '@/types/book';

// 为块生成唯一ID
export const generateBlockId = (): string => {
    return uuidv4();
};

// 创建新的文档块
export const createDocumentBlock = (type: string, content: any, attributes?: Record<string, any>): DocumentBlock => {
    return {
        id: generateBlockId(),
        type,
        content,
        attributes
    };
};

// 确保每个块都有ID
export const ensureBlockIds = (blocks: any[]): DocumentBlock[] => {
    return blocks.map(block => {
        if (!block.id) {
            return {
                ...block,
                id: generateBlockId()
            };
        }
        return block;
    });
};

// 计算光标位置的行列号
export const calculatePosition = (doc: any, pos: number): { line: number; column: number } => {
    let line = 1;
    let column = 1;
    let currentPos = 0;

    const processNode = (node: any) => {
        if (node.text) {
            for (const char of node.text) {
                if (currentPos === pos) {
                    return true;
                }
                if (char === '\n') {
                    line++;
                    column = 1;
                } else {
                    column++;
                }
                currentPos++;
            }
        } else if (node.content) {
            for (const child of node.content) {
                if (processNode(child)) {
                    return true;
                }
            }
        }
        return false;
    };

    processNode(doc);
    return { line, column };
};

// 创建新的文档内容
export const createDocumentContent = (blocks: any[] = [], version: number = 1, userId: string = ''): DocumentContent => {
    return {
        type: 'doc',
        version,
        blocks: ensureBlockIds(blocks),
        meta: {
            last_modified: new Date().toISOString(),
            modified_by: userId,
            collaborators: [userId],
            schema_version: '1.0'
        }
    };
};

// 格式化编辑器JSON为文档块
export const formatEditorContent = (json: any): DocumentBlock[] => {
    if (!json || !json.content) {
        return [];
    }

    return json.content.map((node: any) => createDocumentBlock(
        node.type,
        node.content || node.text,
        node.attrs
    ));
}; 