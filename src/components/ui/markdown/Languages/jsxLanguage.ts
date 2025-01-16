/**
 * @file jsxLanguage.ts
 * @description 定义 JSX 语言的高亮规则，结合 JavaScript 和 XML 的语法规则。
 */
import { loadLanguageWithRetry } from './languageLoader';

export default function(hljs: any) {
    return {
        name: 'JSX',
        aliases: ['jsx', 'javascript-react'],
        async: true,
        process: async function() {
            await Promise.all([
                loadLanguageWithRetry('javascript'),
                loadLanguageWithRetry('xml')
            ]);

            const javascript = hljs.getLanguage('javascript');
            const xml = hljs.getLanguage('xml');

            if (!javascript || !xml) {
                throw new Error('Failed to load JSX dependencies');
            }

            // 定义 JSX 关键字
            const jsxKeywords = [
                // JavaScript 关键字
                'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger',
                'default', 'delete', 'do', 'else', 'export', 'extends', 'finally',
                'for', 'function', 'if', 'import', 'in', 'instanceof', 'new', 'null',
                'return', 'super', 'switch', 'this', 'throw', 'try', 'typeof', 'var',
                'void', 'while', 'with', 'yield', 'async', 'await', 'of',
                // JSX 特定关键字
                'jsx'
            ];

            // 定义内置类型和 React 相关类型
            const builtInTypes = [
                // JavaScript 内置类型
                'Array', 'Boolean', 'Date', 'Error', 'Function', 'JSON',
                'Math', 'Number', 'Object', 'RegExp', 'String', 'Promise',
                'Proxy', 'Map', 'Set', 'WeakMap', 'WeakSet',
                // React 相关类型
                'React', 'ReactDOM', 'Component', 'PureComponent',
                'createElement', 'Fragment', 'PropTypes',
                // React Hooks
                'useState', 'useEffect', 'useContext', 'useReducer',
                'useCallback', 'useMemo', 'useRef', 'useImperativeHandle',
                'useLayoutEffect', 'useDebugValue'
            ];

            return {
                keywords: {
                    keyword: jsxKeywords.join(' '),
                    built_in: builtInTypes.join(' '),
                    literal: 'true false null undefined NaN Infinity'
                },
                contains: [
                    // JSX 标签
                    {
                        className: 'jsx',
                        begin: /(?=<[A-Z]\w*)/,
                        end: /(?<=\/?>)/,
                        contains: [
                            {
                                // JSX 属性
                                className: 'attr',
                                begin: /\s[A-Za-z0-9_.-]*=/,
                                end: /(?=\s|\/?>)/,
                                contains: [
                                    {
                                        // JSX 属性值
                                        className: 'string',
                                        begin: /"/,
                                        end: /"/,
                                        contains: [
                                            {
                                                // JSX 表达式
                                                begin: /{\s*/,
                                                end: /\s*}/,
                                                className: 'expression',
                                                contains: ['self']
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                // JSX 组件名
                                className: 'name',
                                begin: /[A-Z][A-Za-z0-9]*/,
                                relevance: 0
                            }
                        ]
                    },
                    // 字符串
                    {
                        className: 'string',
                        variants: [
                            {
                                begin: '"',
                                end: '"',
                                contains: [{begin: '\\\\.'}]
                            },
                            {
                                begin: "'",
                                end: "'",
                                contains: [{begin: '\\\\.'}]
                            },
                            {
                                begin: '`',
                                end: '`',
                                contains: [
                                    {begin: '\\\\.'},
                                    {
                                        className: 'expression',
                                        begin: '\\${',
                                        end: '}',
                                        contains: ['self']
                                    }
                                ]
                            }
                        ]
                    },
                    // 注释
                    hljs.C_LINE_COMMENT_MODE,
                    hljs.C_BLOCK_COMMENT_MODE,
                    // 数字
                    {
                        className: 'number',
                        variants: [
                            {begin: '\\b(0[bB][01]+)'},
                            {begin: '\\b(0[oO][0-7]+)'},
                            {begin: '\\b(0[xX][0-9a-fA-F]+)'},
                            {begin: '\\b([1-9][0-9]*(\\.[0-9]*)?|\\.[0-9]+)([eE][+-]?[0-9]+)?'}
                        ],
                        relevance: 0
                    }
                ]
            };
        }
    };
} 