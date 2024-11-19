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

            return {
                keywords: {
                    keyword: [
                        ...typescript.keywords.keyword.split(' '),
                        'jsx', 'tsx', 'as', 'is', 'keyof', 'readonly', 'unique',
                        'infer', 'satisfies'
                    ].join(' '),
                    built_in: [
                        ...typescript.keywords.built_in.split(' '),
                        'JSX.Element', 'ReactNode', 'ReactElement',
                        'FC', 'FunctionComponent', 'PropsWithChildren',
                        'useState', 'useEffect', 'useContext', 'useReducer',
                        'useCallback', 'useMemo', 'useRef', 'useImperativeHandle',
                        'useLayoutEffect', 'useDebugValue'
                    ].join(' '),
                    literal: typescript.keywords.literal
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
                    // TypeScript 原有的语法规则
                    ...typescript.contains,
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