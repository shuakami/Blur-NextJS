/**
 * @file languageAliases.ts
 * @description 语言映射表，用于将常见的文件扩展名映射到相应的编程语言名称。
 * @type {Record<string, string>}
 */

/**
 * 语言映射表，用于将常见的文件扩展名映射到相应的编程语言名称。
 * @type {Record<string, string>}
 * @constant
 */
const LANGUAGE_ALIASES: Record<string, string> = {
    // 脚本语言
    'js': 'javascript',
    'ts': 'typescript',
    'py': 'python',
    'rb': 'ruby',
    'php': 'php',
    'pl': 'perl',
    'tsx': 'tsx',
    'jsx': 'jsx',
    
    // Shell 相关
    'sh': 'bash',
    'bash': 'bash',
    'zsh': 'bash',
    'shell': 'bash',
    'bat': 'batch',
    'cmd': 'batch',
    'powershell': 'powershell',
    'ps1': 'powershell',
    'psm1': 'powershell',
    'batch': 'batch',

    // 配置文件
    'yml': 'yaml',
    'yaml': 'yaml',
    'json': 'json',
    'xml': 'xml',
    'toml': 'toml',
    'ini': 'ini',
    'conf': 'nginx',

    // 标记语言
    'md': 'markdown',
    'html': 'html',
    'htm': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'scss',
    'less': 'less',

    // 数据库
    'sql': 'sql',
    'mysql': 'sql',
    'pgsql': 'pgsql',
    'psql': 'pgsql',

    // 常用编程语言
    'java': 'java',
    'kt': 'kotlin',
    'kotlin': 'kotlin',
    'swift': 'swift',
    'go': 'go',
    'golang': 'go',
    'rs': 'rust',
    'rust': 'rust',
    'cpp': 'cpp',
    'c++': 'cpp',
    'c': 'c',
    'cs': 'csharp',
    'csharp': 'csharp',
    
    // 其他常用格式
    'dockerfile': 'dockerfile',
    'docker': 'dockerfile',
    'makefile': 'makefile',
    'make': 'makefile',
    'gradle': 'gradle',
    'tex': 'latex',
    'latex': 'latex',
    
    // 特殊处理
    'plaintext': 'plaintext',
    'text': 'plaintext',
    'txt': 'plaintext'
};

export default LANGUAGE_ALIASES;