// batchLanguage.ts
export default function(hljs: any) {
    return {
        name: 'Batch',
        case_insensitive: true,
        aliases: ['bat', 'cmd'],
        keywords: {
            keyword: 'echo set if else for in do goto exit call shift exist not errorlevel defined endlocal setlocal',
            built_in: 'cd dir cls copy del move ren md rd time date pause path title',
        },
        contains: [
            {
                className: 'comment',
                variants: [
                    { begin: '@?rem', end: '$' },
                    { begin: '^::', end: '$' }
                ]
            },
            {
                className: 'string',
                begin: '"',
                end: '"',
            },
            {
                className: 'variable',
                variants: [
                    { begin: /%[a-zA-Z_][a-zA-Z0-9_]*%/ },
                    { begin: /![a-zA-Z_][a-zA-Z0-9_]*!/ }
                ]
            },
            {
                className: 'built_in',
                begin: '\\b(and|or|not|equ|neq|lss|leq|gtr|geq)\\b'
            },
            {
                className: 'number',
                begin: '\\b\\d+\\b',
            },
            {
                className: 'literal',
                begin: /([a-zA-Z]:\\|\\.\\|\\)/,
                relevance: 0
            },
            {
                className: 'built_in',
                begin: /\b(exit|pause|goto|choice|setlocal|endlocal|shift|echo|cd|cls|dir|copy|del|move|ren|md|rd|path|title)\b/,
            },
            {
                className: 'operator',
                begin: /(\|\||&&|==|=|<|>)/,
            }
        ]
    };
}
