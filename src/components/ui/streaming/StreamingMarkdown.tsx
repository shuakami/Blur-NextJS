import React, { useEffect, useRef } from 'react';
import { MarkdownRenderer } from '../markdown/MarkdownRenderer';
import './streaming.css';

interface StreamingMarkdownProps {
  content: string;
  isStreaming?: boolean;
  className?: string;
}

export const StreamingMarkdown: React.FC<StreamingMarkdownProps> = ({
  content,
  isStreaming = false,
  className
}) => {
  const prevContentRef = useRef(content);
  const renderCountRef = useRef(0);

  useEffect(() => {
    renderCountRef.current += 1;
    const contentChanged = prevContentRef.current !== content;
    prevContentRef.current = content;

    console.log('[StreamingMarkdown] Render:', {
      renderCount: renderCountRef.current,
      contentLength: content.length,
      contentPreview: content.slice(0, 50),
      isStreaming,
      contentChanged,
      className
    });
  });

  return (
    <MarkdownRenderer 
      content={content}
      isStreaming={isStreaming}
    />
  );
}; 