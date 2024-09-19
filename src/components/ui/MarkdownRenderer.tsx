import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // 支持 GitHub 风格的 Markdown

// 定义 MarkdownRenderer 组件
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
        return (
            <div className="markdown-body">
                    <ReactMarkdown
                        children={content}
                        remarkPlugins={[remarkGfm]}
                        components={{
                                h1: ({ node, ...props }) => <h1 className="text-heading1" {...props} />,
                                h2: ({ node, ...props }) => <h2 className="text-heading2" {...props} />,
                                h3: ({ node, ...props }) => <h3 className="text-heading3" {...props} />,
                                h4: ({ node, ...props }) => <h4 className="text-heading4" {...props} />,
                                h5: ({ node, ...props }) => <h5 className="text-heading5" {...props} />,
                                h6: ({ node, ...props }) => <h6 className="text-heading6" {...props} />,
                                p: ({ node, ...props }) => <p className="text-body" {...props} />,
                                strong: ({ node, ...props }) => <strong className="text-bold" {...props} />,
                                em: ({ node, ...props }) => <em className="text-italic" {...props} />,
                                ul: ({ node, ...props }) => <ul className="list-disc ml-8 text-body" {...props} />,
                                ol: ({ node, ...props }) => <ol className="list-decimal ml-8 text-body" {...props} />,
                                li: ({ node, ...props }) => <li className="mb-3" {...props} />,
                                a: ({ node, ...props }) => <a className="text-link" {...props} />,
                                img: ({ node, ...props }) => <img className="inline-image" {...props} />,
                                code: ({ node, inline, ...props }) =>
                                    inline ? <code className="inline-code" {...props} /> : <pre className="code-block"><code {...props} /></pre>,
                                blockquote: ({ node, ...props }) => <blockquote className="blockquote" {...props} />,
                                hr: () => <hr className="divider" />,
                                del: ({ node, ...props }) => <del className="text-strikethrough" {...props} />,
                                input: ({ node, ...props }) => <input type="checkbox" className="task-list-item" disabled {...props} />,
                                table: ({ node, ...props }) => <table className="markdown-table" {...props} />,
                                th: ({ node, ...props }) => <th className="table-header" {...props} />,
                                td: ({ node, ...props }) => <td className="table-cell" {...props} />,
                        }}
                    />
            </div>
        );
};

// Markdown 样式
const markdownStyles = `
.markdown-body {
  color: #333;
}

/* 标题样式 */
.text-heading1 {
  font-size: 2.25rem;
  line-height: 1.3;
  margin-top: 2.5rem;
  margin-bottom: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
}

.text-heading2 {
  font-size: 1.75rem;
  line-height: 1.4;
  margin-top: 2rem;
  margin-bottom: 1.25rem;
  font-weight: 600;
  color: #34495e;
}

.text-heading3 {
  font-size: 1.5rem;
  line-height: 1.35;
  margin-top: 1.75rem;
  margin-bottom: 1rem;
  font-weight: 600;
  color: #2c3e50;
}

/* 正文样式 */
.text-body {
  font-size: 1rem;
  line-height: 1.7;
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
  color: #333;
}

/* 加粗和斜体 */
.text-bold {
  font-weight: 700;
  color: #2c3e50;
}

.text-italic {
  font-style: italic;
  color: #2c3e50;
}

/* 链接样式 */
.text-link {
  color: #1a73e8;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.text-link:hover {
  color: #1558c5;
}

.text-link:active {
  color: #0d47a1;
}

/* 行内代码 */
.inline-code {
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 0.2rem 0.4rem;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.95rem;
}

/* 代码块 */
.code-block {
  background-color: #f5f5f5;
  border-radius: 6px;
  padding: 1rem;
  overflow-x: auto;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

/* 引用样式 */
.blockquote {
  border-left: 4px solid #dfe2e5;
  background-color: #f9f9f9;
  padding: 0.75rem 1rem;
  margin: 1.5rem 0;
  color: #6a737d;
}

/* 分割线 */
.divider {
  border: none;
  height: 1px;
  background-color: #e0e0e0;
  margin: 1.5rem 0;
}

/* 图片样式 */
.inline-image {
  max-width: 80%;
  height: auto;
  display: block;
  margin: 1rem auto;
  border-radius: 0.5rem;
}

/* 任务列表 */
.task-list-item {
  margin-right: 0.5rem;
  vertical-align: middle;
}

/* 删除线 */
.text-strikethrough {
  text-decoration: line-through;
  color: #6a737d;
}

/* 表格 */
.markdown-table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
}

.table-header {
  background-color: #f6f8fa;
  font-weight: 600;
  text-align: center;
  padding: 0.75rem;
  border: 1px solid #dfe2e5;
}

.table-cell {
  text-align: left;
  padding: 0.75rem;
  border: 1px solid #dfe2e5;
}
`;

// 将样式插入到页面中
const Style = () => <style>{markdownStyles}</style>;

// 导出组件
export { MarkdownRenderer, Style };
