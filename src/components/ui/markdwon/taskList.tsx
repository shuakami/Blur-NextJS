import React from 'react';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export const TaskListItem: React.FC = ({ children, ...props }) => (
    <label className="task-list-item-container">
        <input type="checkbox" className="task-list-item-checkbox" {...props} />
        <span className="task-list-item-text">{children}</span>
    </label>
);
