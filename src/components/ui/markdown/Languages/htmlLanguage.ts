/**
 * @file htmlLanguage.ts
 * @description 定义 HTML 语言的高亮规则，支持标签、属性、注释、脚本等。
 */
export default function(hljs: any) {
    const XML_IDENT_RE = '[A-Za-z0-9\\._:-]+';
    const QUOTE_STRING = {
        className: 'string',
        variants: [
            { begin: /"/, end: /"/ },
            { begin: /'/, end: /'/ }
        ]
    };

    return {
        name: 'HTML',
        aliases: ['html', 'xhtml', 'htm'],
        case_insensitive: true,
        contains: [
            // DOCTYPE
            {
                className: 'meta',
                begin: /<!DOCTYPE/,
                end: />/,
                relevance: 10,
                contains: [
                    { begin: /\[/, end: /\]/ }
                ]
            },
            // 注释
            {
                className: 'comment',
                begin: /<!--/,
                end: /-->/,
                contains: [
                    {
                        begin: /[^\-]/,
                        end: /(?=-)/
                    }
                ]
            },
            // <script> 标签及内容
            {
                begin: /<script\b[^>]*>/,
                end: /<\/script>/,
                subLanguage: 'javascript',
                relevance: 10,
                contains: [
                    {
                        className: 'script-tag',
                        begin: /<script\b[^>]*>/,
                        end: />/,
                        contains: [
                            {
                                className: 'name',
                                begin: /script/
                            },
                            {
                                className: 'attr',
                                begin: /type|src|async|defer/,
                                relevance: 0
                            },
                            QUOTE_STRING
                        ]
                    }
                ]
            },
            // <style> 标签及内容
            {
                begin: /<style\b[^>]*>/,
                end: /<\/style>/,
                subLanguage: 'css',
                relevance: 10,
                contains: [
                    {
                        className: 'style-tag',
                        begin: /<style[^>]*>/,
                        returnBegin: true,
                        end: />/,
                        contains: [
                            {
                                className: 'name',
                                begin: /style/
                            },
                            {
                                className: 'attr',
                                begin: /type/,
                                relevance: 0
                            }
                        ]
                    }
                ]
            },
            // 普通标签
            {
                className: 'tag',
                begin: /<(?!\/)/,
                end: />/,
                contains: [
                    {
                        className: 'name',
                        begin: /[^\/><\s]+/,
                        relevance: 0
                    },
                    {
                        className: 'attr',
                        begin: XML_IDENT_RE,
                        relevance: 0,
                        contains: [
                            {
                                className: 'attr-value',
                                begin: /=/,
                                end: /(?=\s|$)/,
                                contains: [
                                    QUOTE_STRING,
                                    {
                                        className: 'number',
                                        begin: /\d+/
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            // 结束标签
            {
                className: 'tag',
                begin: /<\//,
                end: />/,
                contains: [
                    {
                        className: 'name',
                        begin: /[^\/><\s]+/,
                        relevance: 0
                    }
                ]
            },
            // 修改 link 标签处理，防止实际加载样式表
            {
                className: 'tag',
                begin: /<link\b/,
                end: />/,
                contains: [
                    {
                        className: 'name',
                        begin: /link/
                    },
                    {
                        className: 'attr',
                        begin: /rel|href|type/,
                        relevance: 0
                    }
                ]
            }
        ]
    };
}