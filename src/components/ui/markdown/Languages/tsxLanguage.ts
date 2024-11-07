/**
 * @file tsxLanguage.ts
 * @description 定义 TSX 语言的高亮规则，结合 TypeScript 和 XML 的语法规则。
 * @param {HLJSApi} hljs - Highlight.js API
 * @returns {Object} - TSX 语言的高亮配置
 */
import { HLJSApi } from 'highlight.js';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';

/**
 * TSX 语言高亮配置
 * @param {HLJSApi} hljs - Highlight.js API
 * @returns {Object} - TSX 语言的高亮规则
 */
const tsxLanguage = (hljs: HLJSApi) => {
    const tsConfig = typescript(hljs);
    const xmlConfig = xml(hljs);

    return {
        name: 'TSX',
        contains: [
            ...tsConfig.contains, // TypeScript 的语法规则
            ...xmlConfig.contains // JSX (XML) 的语法规则
        ]
    };
};

export default tsxLanguage;
