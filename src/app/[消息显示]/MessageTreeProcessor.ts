import { Message, APIMessage } from '@/types/stream';

/**
 * 修改历史接口
 */
interface ModificationHistory {
    originalMessage: MessageNode;  // 原始消息
    modifiedVersions: MessageNode[];  // 修改版本
    latestVersion: MessageNode;  // 最新版本
}

/**
 * 消息树节点接口
 */
interface MessageNode {
    message: APIMessage;
    children: MessageNode[];
    parent?: MessageNode;
    depth: number;
    modificationHistory?: ModificationHistory;  // 修改历史
    isOriginalRoot?: boolean;  // 是否为原始根节点
}

/**
 * 消息树统计信息
 */
interface MessageTreeStats {
    total: number;
    active: number;
    inactive: number;
    modified: number;
    user: number;
    assistant: number;
    system: number;
}

/**
 * 分页配置接口
 */
interface PaginationConfig {
    pageSize: number;
    currentPage: number;
}

/**
 * 分页结果接口
 */
interface PaginationResult {
    messages: APIMessage[];
    totalPages: number;
    currentPage: number;
    hasMore: boolean;
}

/**
 * 对话线索接口
 */
interface ConversationThread {
    rootMessage: MessageNode;
    messages: MessageNode[];
}

/**
 * 分页信息接口
 */
interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    pageMessages: {
        messageId: string;
        preview: string;
        timestamp: number;
        role: string;
    }[];
}

/**
 * 消息树处理器类
 */
export class MessageTreeProcessor {
    private messageMap: Map<string, MessageNode> = new Map();
    private rootNodes: MessageNode[] = [];
    
    /**
     * 将Message转换为APIMessage
     */
    private convertToAPIMessage(msg: Message): APIMessage {
        return {
            message_id: msg.message_id,
            content: msg.content,
            timestamp: msg.timestamp,
            status: msg.status,
            role: msg.type === 'user' ? 'user' :
                  msg.type === 'bot' ? 'assistant' :
                  msg.type === 'system' ? 'system' : 'user',
            parent_id: msg.parent_id,
            children_ids: msg.children_ids,
            version: msg.version,
            modified_count: msg.modified_count,
            files: msg.files,
            plugin_id: msg.plugin_id,
            plugin_name: msg.plugin_name,
            call_index: msg.call_index,
            plugin_status: msg.plugin_status,
            plugin_response: msg.plugin_response
        };
    }

    /**
     * 构建消息树
     */
    buildTree(messages: Message[]) {
        console.log("\n========== 开始构建消息树 ==========");
        
        // 重置状态
        this.messageMap.clear();
        this.rootNodes = [];

        // 转换消息并创建节点映射
        const apiMessages = messages.map(msg => this.convertToAPIMessage(msg));
        
        // 第一遍：创建所有节点
        apiMessages.forEach(msg => {
            this.messageMap.set(msg.message_id, {
                message: msg,
                children: [],
                depth: 0,
                isOriginalRoot: !msg.parent_id && msg.version === 1
            });
        });

        // 第二遍：建立父子关系，忽略version字段，基于parent_id来建立树结构
        apiMessages.forEach(msg => {
            const node = this.messageMap.get(msg.message_id)!;
            
            if (msg.parent_id) {
                const parentNode = this.messageMap.get(msg.parent_id);
                if (parentNode) {
                    node.parent = parentNode;
                    parentNode.children.push(node);
                    node.depth = parentNode.depth + 1;
                }
            } else {
                this.rootNodes.push(node);
            }
        });

        // 第三遍：处理修改历史
        apiMessages.forEach(msg => {
            const node = this.messageMap.get(msg.message_id)!;
            
            // 如果是修改版本
            if ((msg.modified_count || 0) > 0) {
                // 查找原始消息
                let currentNode = node;
                const modifiedVersions: MessageNode[] = [];
                
                while (currentNode.parent) {
                    modifiedVersions.unshift(currentNode);
                    currentNode = currentNode.parent;
                    
                    // 找到原始消息
                    if ((currentNode.message.modified_count || 0) === 0) {
                        const history: ModificationHistory = {
                            originalMessage: currentNode,
                            modifiedVersions: modifiedVersions,
                            latestVersion: modifiedVersions[modifiedVersions.length - 1]
                        };
                        
                        // 为所有相关节点设置修改历史
                        currentNode.modificationHistory = history;
                        modifiedVersions.forEach(v => v.modificationHistory = history);
                        
                        console.log(`构建修改历史: ${currentNode.message.message_id} -> ${node.message.message_id}`);
                        break;
                    }
                }
            }
        });

        console.log("消息树构建完成");
        console.log(`根节点数量: ${this.rootNodes.length}`);
        console.log(`总节点数量: ${this.messageMap.size}`);
        console.log("========== 消息树构建完成 ==========\n");

        return this;
    }

    /**
     * 获取消息的所有子消息
     */
    getChildren(messageId: string): APIMessage[] {
        const node = this.messageMap.get(messageId);
        if (!node) return [];
        return node.children.map(child => child.message);
    }

    /**
     * 获取消息的所有父消息链
     */
    getParentChain(messageId: string): APIMessage[] {
        const chain: APIMessage[] = [];
        let node = this.messageMap.get(messageId);
        
        while (node?.parent) {
            chain.push(node.parent.message);
            node = node.parent;
        }

        return chain;
    }

    /**
     * 获取消息的兄弟消息
     */
    getSiblings(messageId: string): APIMessage[] {
        const node = this.messageMap.get(messageId);
        if (!node?.parent) return [];
        
        return node.parent.children
            .filter(child => child.message.message_id !== messageId)
            .map(child => child.message);
    }

    /**
     * 获取消息树的统计信息
     */
    getStats(): MessageTreeStats {
        const stats: MessageTreeStats = {
            total: 0,
            active: 0,
            inactive: 0,
            modified: 0,
            user: 0,
            assistant: 0,
            system: 0
        };

        this.messageMap.forEach(node => {
            const msg = node.message;
            stats.total++;
            
            if (msg.status === 'active') stats.active++;
            else stats.inactive++;
            
            if (msg.modified_count && msg.modified_count > 0) stats.modified++;
            
            if (msg.role === 'user') stats.user++;
            else if (msg.role === 'assistant') stats.assistant++;
            else if (msg.role === 'system') stats.system++;
        });

        return stats;
    }

    /**
     * 生成树形结构的可视化字符串
     */
    generateTreeString(): string {
        let result = '消息树结构:\n';
        result += '==========================================\n';

        const printNode = (node: MessageNode, prefix: string = '', isLast: boolean = true) => {
            const msg = node.message;
            const statusMark = msg.status === 'active' ? '✓' : '✗';
            const roleMark = msg.role === 'user' ? '👤' : msg.role === 'assistant' ? '🤖' : '⚙️';
            const time = new Date(msg.timestamp * 1000).toLocaleString();
            const version = msg.version ? `v${msg.version}` : '';
            const modifiedMark = (msg.modified_count || 0) > 0 ? `(修改${msg.modified_count}次)` : '';

            result += `${prefix}${isLast ? '└── ' : '├── '}[${msg.message_id.slice(0, 8)}] ${roleMark} ${statusMark} ${time} ${version} ${modifiedMark}\n`;
            result += `${prefix}${isLast ? '    ' : '│   '}内容: ${msg.content.slice(0, 50)}${msg.content.length > 50 ? '...' : ''}\n`;

            node.children.forEach((child, index) => {
                printNode(child, prefix + (isLast ? '    ' : '│   '), index === node.children.length - 1);
            });
        };

        this.rootNodes.forEach((root, index) => {
            printNode(root, '', index === this.rootNodes.length - 1);
            if (index < this.rootNodes.length - 1) {
                result += '------------------------------------------\n';
            }
        });

        result += '==========================================\n';
        return result;
    }

    /**
     * 获取对话线索列表
     * 每个线索包含从根消息到最后一条消息的完整对话
     */
    private getConversationThreads(): ConversationThread[] {
        console.log("获取对话线索...");
        const threads: ConversationThread[] = [];
        
        // 按时间戳排序根节点
        const sortedRoots = [...this.rootNodes]
            .sort((a, b) => a.message.timestamp - b.message.timestamp);
        
        sortedRoots.forEach(root => {
            const thread: ConversationThread = {
                rootMessage: root,
                messages: []
            };
            
            // 收集线索中的所有消息,按时间戳排序
            const collectMessages = (node: MessageNode) => {
                thread.messages.push(node);
                // 按时间戳排序子消息
                const sortedChildren = [...node.children]
                    .sort((a, b) => a.message.timestamp - b.message.timestamp);
                sortedChildren.forEach(collectMessages);
            };
            
            collectMessages(root);
            threads.push(thread);
            console.log(`线索 ${root.message.message_id} (${root.message.content}) 包含 ${thread.messages.length} 条消息`);
        });

        console.log(`共找到 ${threads.length} 个对话线索`);
        return threads;
    }

    /**
     * 判断是否需要在该消息下显示翻页器
     */
    shouldShowPagination(messageId: string): boolean {
        console.log(`\n检查是否显示翻页器...`);
        
        const node = this.messageMap.get(messageId);
        if (!node) {
            console.log(`未找到消息节点: ${messageId}`);
            return false;
        }

        const msg = node.message;
        console.log(`消息信息: [${msg.message_id}]`);
        console.log(`- 类型: ${msg.role}`);
        console.log(`- 内容: ${msg.content.slice(0, 50)}${msg.content.length > 50 ? '...' : ''}`);
        console.log(`- 版本: ${msg.version || 1}`);
        console.log(`- 修改次数: ${msg.modified_count || 0}`);

        // 首先检查是否是用户消息
        if (msg.role !== 'user') {
            console.log("不是用户消息，不显示翻页器");
            return false;
        }

        // 找到当前页的根节点
        let rootNode = node;
        while (rootNode.parent) {
            rootNode = rootNode.parent;
        }

        // 检查是否是当前页的第一条用户消息
        const isFirstUserMessage = rootNode.message.message_id === msg.message_id;
        if (isFirstUserMessage) {
            console.log("是当前页的第一条用户消息，显示翻页器");
            return true;
        }

        console.log("不是当前页的第一条用户消息，不显示翻页器");
        return false;
    }

    /**
     * 获取消息预览
     * 返回消息的简短预览，用于分页导航
     */
    private getMessagePreview(message: APIMessage): string {
        const maxLength = 50;
        const content = message.content.trim();
        if (content.length <= maxLength) {
            return content;
        }
        return content.substring(0, maxLength) + '...';
    }

    /**
     * 获取分页消息
     * 直接按消息树结构分页，每页显示一个完整的对话分支
     */
    getPagedMessages(config?: Partial<PaginationConfig>): PaginationResult {
        console.log("\n========== 开始获取分页消息 ==========");
        
        // 按时间戳排序根节点
        const sortedRoots = [...this.rootNodes]
            .sort((a, b) => a.message.timestamp - b.message.timestamp);
        
        const currentPage = config?.currentPage || 1;
        const totalPages = sortedRoots.length;
        
        console.log(`总页数: ${totalPages} (每个根节点一页)`);
        
        // 获取当前页的根节点
        const rootNode = sortedRoots[currentPage - 1];
        if (!rootNode) {
            console.log("未找到当前页的根节点");
            return {
                messages: [],
                totalPages,
                currentPage,
                hasMore: currentPage < totalPages
            };
        }
        
        // 收集当前分支的所有消息
        const pageMessages: APIMessage[] = [];
        const collectMessages = (node: MessageNode) => {
            const msg = node.message;
            console.log(`添加消息: [${msg.message_id}] ${msg.role}`);
            console.log(`- 内容: ${msg.content.slice(0, 50)}${msg.content.length > 50 ? '...' : ''}`);
            pageMessages.push(msg);
            // 按时间戳排序子消息
            const sortedChildren = [...node.children]
                .sort((a, b) => a.message.timestamp - b.message.timestamp);
            sortedChildren.forEach(collectMessages);
        };
        
        console.log(`\n当前页(${currentPage})消息:`);
        collectMessages(rootNode);
        
        console.log(`共收集到 ${pageMessages.length} 条消息`);
        console.log("========== 分页消息获取完成 ==========\n");
        
        return {
            messages: pageMessages,
            totalPages,
            currentPage,
            hasMore: currentPage < totalPages
        };
    }

    /**
     * 获取消息所在页码
     * 根据消息所属的根节点确定页码
     */
    getMessagePageNumber(messageId: string): number {
        console.log(`查找消息 ${messageId} 所在页码...`);
        
        // 获取消息节点
        const node = this.messageMap.get(messageId);
        if (!node) {
            console.log("未找到消息节点");
            return 1;
        }
        
        // 找到所属的根节点
        let rootNode = node;
        while (rootNode.parent) {
            rootNode = rootNode.parent;
        }
        
        // 按时间戳排序所有根节点
        const sortedRoots = [...this.rootNodes]
            .sort((a, b) => a.message.timestamp - b.message.timestamp);
        
        // 在排序后的根节点列表中查找位置
        const pageNumber = sortedRoots.findIndex(root => 
            root.message.message_id === rootNode.message.message_id
        ) + 1;
        
        console.log(`消息在第 ${pageNumber} 页，根节点: ${rootNode.message.message_id} (${rootNode.message.content})`);
        return pageNumber || 1;
    }

    /**
     * 获取消息的上下文
     * 返回消息的父消息、兄弟消息和子消息
     */
    getMessageContext(messageId: string): {
        parent: APIMessage | null;
        siblings: APIMessage[];
        children: APIMessage[];
    } {
        console.log(`获取消息 ${messageId} 的上下文...`);
        
        const node = this.messageMap.get(messageId);
        if (!node) {
            console.log("未找到消息节点");
            return { parent: null, siblings: [], children: [] };
        }

        const parent = node.parent?.message || null;
        const siblings = this.getSiblings(messageId);
        const children = this.getChildren(messageId);

        console.log(`上下文: 父消息=${parent?.message_id}, 兄弟消息=${siblings.length}个, 子消息=${children.length}个`);

        return {
            parent,
            siblings,
            children
        };
    }

    /**
     * 获取分页信息
     * 返回完整的分页信息，包括每页的消息预览
     */
    getPaginationInfo(currentPage: number): PaginationInfo {
        console.log("\n========== 获取分页信息 ==========");
        console.log(`当前页码: ${currentPage}`);

        // 按时间戳排序根节点
        const sortedRoots = [...this.rootNodes]
            .sort((a, b) => a.message.timestamp - b.message.timestamp);
        
        const totalPages = sortedRoots.length;
        console.log(`总页数: ${totalPages}`);

        // 获取所有页的根消息预览
        const pageMessages = sortedRoots.map(node => {
            const msg = node.message;
            console.log(`页面消息: [${msg.message_id}] ${msg.role}`);
            console.log(`- 内容: ${msg.content.slice(0, 50)}${msg.content.length > 50 ? '...' : ''}`);
            return {
                messageId: msg.message_id,
                preview: this.getMessagePreview(msg),
                timestamp: msg.timestamp,
                role: msg.role
            };
        });

        const info: PaginationInfo = {
            currentPage,
            totalPages,
            hasNextPage: currentPage < totalPages,
            hasPrevPage: currentPage > 1,
            pageMessages
        };

        console.log(`分页信息: 当前页=${currentPage}, 总页数=${totalPages}`);
        console.log(`是否有上一页: ${info.hasPrevPage}, 是否有下一页: ${info.hasNextPage}`);
        console.log("========== 分页信息获取完成 ==========\n");

        return info;
    }
}

// 导出一个默认实例
export const messageTreeProcessor = new MessageTreeProcessor();
export default messageTreeProcessor;
