// components/ui/markdown/text.tsx
import React, { PropsWithChildren, memo } from 'react';

export const Paragraph: React.FC<PropsWithChildren> = memo(({ children, ...props }) => {
  return (
    <p className="text-body" {...props}>
      {children}
    </p>
  );
});
Paragraph.displayName = 'Paragraph';

export const Strong: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const isTextNode = typeof children === 'string' || typeof children === 'number';

    return <strong className="text-bold">{isTextNode ? children : ''}</strong>;
};

export const Emphasis: React.FC<PropsWithChildren> = ({ children, ...props }) => (
    <em className="text-italic" {...props}>{children}</em>
);
