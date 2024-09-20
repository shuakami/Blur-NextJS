import React from 'react';

export const InlineCode: React.FC = (props) => <code className="inline-code" {...props} />;
export const CodeBlock: React.FC = (props) => (
    <pre className="code-block">
    <code {...props} />
  </pre>
);
