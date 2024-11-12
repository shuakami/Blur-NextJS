import React, { memo } from 'react';

interface DetailsProps extends React.HTMLAttributes<HTMLDetailsElement> {
  children: React.ReactNode;
}

interface SummaryProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export const Details = memo<DetailsProps>(({ children, ...props }) => {
  return (
    <details className="markdown-details" {...props}>
      {children}
    </details>
  );
});

export const Summary = memo<SummaryProps>(({ children, ...props }) => {
  return (
    <summary className="markdown-summary" {...props}>
      {children}
    </summary>
  );
});

Details.displayName = 'Details';
Summary.displayName = 'Summary';