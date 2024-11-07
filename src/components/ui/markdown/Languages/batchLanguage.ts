// batchLanguage.ts
import { HLJSApi } from 'highlight.js';

/**
 * 定义 Batch 语言的高亮规则
 * @param {HLJSApi} hljs - Highlight.js API
 * @returns {Object} - Batch 语言的高亮配置
 */
const batchLanguage = (hljs: HLJSApi) => {
    return {
        name: 'Batch',
        case_insensitive: true,
        keywords: {
            keyword: 'echo set if else for in do goto exit call shift exist not errorlevel defined endlocal setlocal',
            built_in: 'cd dir cls copy del move ren md rd time date pause path title',
        },
        contains: [
            {
                // 注释支持 "rem" 和 "::" 两种格式
                className: 'comment',
                variants: [
                    { begin: '@?rem', end: '$' },
                    { begin: '^::', end: '$' }
                ]
            },
            {
                // 字符串（双引号内的内容）
                className: 'string',
                begin: '"',
                end: '"',
            },
            {
                // 变量，通常以 %var% 或 !var! 的格式出现
                className: 'variable',
                variants: [
                    { begin: /%[a-zA-Z_][a-zA-Z0-9_]*%/ }, // %var%
                    { begin: /![a-zA-Z_][a-zA-Z0-9_]*!/ }  // !var!
                ]
            },
            {
                // 逻辑符号 (AND, OR, NOT, etc.) 和运算符 (=, ==)
                className: 'built_in',
                begin: '\\b(and|or|not|equ|neq|lss|leq|gtr|geq)\\b'
            },
            {
                // 数字
                className: 'number',
                begin: '\\b\\d+\\b',
            },
            {
                // 路径，模拟路径结构如 C:\ 或 .\ 这种格式
                className: 'literal',
                begin: /([a-zA-Z]:\\|\\.\\|\\)/,
                relevance: 0
            },
            {
                // 内置命令，特殊命令会有更强的高亮区分
                className: 'built_in',
                begin: /\b(exit|pause|goto|choice|setlocal|endlocal|shift|echo|cd|cls|dir|copy|del|move|ren|md|rd|path|title)\b/,
            },
            {
                // 操作符和界定符
                className: 'operator',
                begin: /(\|\||&&|==|=|<|>)/,
            }
        ]
    };
};

export default batchLanguage;
