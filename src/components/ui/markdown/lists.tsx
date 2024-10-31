import React from 'react';

export const UnorderedList: React.FC<React.PropsWithChildren> = ({ children }) => (
    <ul className="list-disc">{children}</ul>
);

export const OrderedList: React.FC<React.PropsWithChildren> = ({ children }) => (
    <ol className="list-decimal">{children}</ol>
);

export const ListItem: React.FC<React.PropsWithChildren> = ({ children }) => (
    <li className="list-item">{children}</li>
);
