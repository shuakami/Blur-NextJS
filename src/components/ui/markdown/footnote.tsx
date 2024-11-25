import React from 'react';

export const FootnoteRef: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement>> = ({ 
    children,
    href,
    ...props 
}) => (
    <a href={href} className="footnote-ref" {...props}>
        {children}
    </a>
);

export const FootnoteBackref: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement>> = ({ 
    href,
    ...props 
}) => (
    <a 
        href={href} 
        className="footnote-backref" 
        aria-label="返回原文" 
        {...props}
    >
        <svg 
            viewBox="0 0 24 24" 
            width="12" 
            height="12" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            strokeLinecap="round" 
            strokeLinejoin="round"
        >
            <path d="M7 13L12 8l5 5" />
        </svg>
    </a>
);