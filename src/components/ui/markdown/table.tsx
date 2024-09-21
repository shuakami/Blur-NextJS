import React from 'react';

export const Table: React.FC = (props) => <table className="markdown-table" {...props} />;
export const TableHeader: React.FC = (props) => <th className="table-header" {...props} />;
export const TableCell: React.FC = (props) => <td className="table-cell" {...props} />;
