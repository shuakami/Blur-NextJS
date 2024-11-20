/**
 * @file tsxLanguage.ts
 * @description 定义 TSX 语言的高亮规则，结合 TypeScript 和 JSX 的语法规则。
 */
import { loadLanguageWithRetry } from './languageLoader';

export default function(hljs: any) {
    return {
        name: 'TSX',
        aliases: ['tsx', 'typescript-react'],
        async: true,
        process: async function() {
            await Promise.all([
                loadLanguageWithRetry('typescript'),
                loadLanguageWithRetry('xml')
            ]);

            const typescript = hljs.getLanguage('typescript');
            const xml = hljs.getLanguage('xml');

            if (!typescript || !xml) {
                throw new Error('Failed to load TSX dependencies');
            }

            // 定义 TSX 关键字
            const tsxKeywords = [
                // TypeScript 关键字
                'abstract', 'as', 'asserts', 'async', 'await', 'break', 'case', 'catch',
                'class', 'const', 'continue', 'debugger', 'declare', 'default', 'delete',
                'do', 'else', 'enum', 'export', 'extends', 'finally', 'for', 'from',
                'function', 'get', 'if', 'implements', 'import', 'in', 'infer', 'instanceof',
                'interface', 'is', 'keyof', 'let', 'module', 'namespace', 'new', 'null',
                'of', 'package', 'private', 'protected', 'public', 'readonly', 'return',
                'satisfies', 'set', 'static', 'super', 'switch', 'this', 'throw', 'try',
                'type', 'typeof', 'unique', 'var', 'void', 'while', 'with', 'yield',
                // JSX/TSX 特定关键字
                'jsx', 'tsx'
            ];

            // 定义内置类型和 React 相关类型
            const builtInTypes = [
                // TypeScript 内置类型
                'any', 'boolean', 'number', 'object', 'string', 'undefined',
                'never', 'symbol', 'unknown', 'bigint',
                // React 相关类型
                'JSX.Element', 'ReactNode', 'ReactElement',
                'FC', 'FunctionComponent', 'PropsWithChildren',
                // React Hooks
                'useState', 'useEffect', 'useContext', 'useReducer',
                'useCallback', 'useMemo', 'useRef', 'useImperativeHandle',
                'useLayoutEffect', 'useDebugValue'
            ];

            return {
                keywords: {
                    keyword: tsxKeywords.join(' '),
                    built_in: builtInTypes.join(' '),
                    literal: 'true false null undefined NaN Infinity'
                },
                contains: [
                    // JSX/TSX 标签
                    {
                        className: 'jsx',
                        begin: /(?=<[A-Z]\w*)/,
                        end: /(?<=\/?>)/,
                        contains: [
                            {
                                className: 'jsx-tag',
                                begin: /<[A-Z]\w*/,
                                end: /\/?>/,
                                contains: [
                                    {
                                        className: 'jsx-tag-name',
                                        begin: /[A-Z]\w*/
                                    },
                                    {
                                        className: 'jsx-attrs',
                                        begin: /\s+\w+=/,
                                        end: /(?=\s|\/?>)/,
                                        contains: [
                                            {
                                                className: 'jsx-attr-value',
                                                begin: /"/,
                                                end: /"/,
                                                contains: [
                                                    {
                                                        begin: /\{/,
                                                        end: /\}/,
                                                        subLanguage: 'typescript'
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    // 继承 TypeScript 的其他语法规则
                    ...(typescript.contains || []),
                    // 泛型参数
                    {
                        className: 'generic-params',
                        begin: /<[A-Za-z_$][\w$]*(?:\s*,\s*[A-Za-z_$][\w$]*)*>/,
                        contains: [
                            {
                                className: 'generic-type',
                                begin: /[A-Za-z_$][\w$]*/
                            }
                        ]
                    },
                    // 类型断言
                    {
                        className: 'type-assertion',
                        begin: /as\s+[A-Za-z_$][\w$]*/,
                        contains: [
                            {
                                className: 'type-name',
                                begin: /[A-Za-z_$][\w$]*/
                            }
                        ]
                    },
                    // React Hooks
                    {
                        className: 'react-hooks',
                        begin: /use[A-Z]\w*/
                    }
                ],
                illegal: /<(?![\w\s/>])/
            };
        }
    };
}