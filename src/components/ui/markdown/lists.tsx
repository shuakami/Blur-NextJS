import React from 'react';

interface ListProps extends React.PropsWithChildren {
  node?: any;
  start?: number;
}

export const UnorderedList: React.FC<ListProps> = ({ children, node }) => {
  // 检查是否跟在有序列表后
  const followsOrderedList = node?.parent?.type === 'root' && 
                           node?.prev?.type === 'list' &&
                           node?.prev?.ordered;
                               
  const className = `list-disc ${followsOrderedList ? 'follows-ordered-list' : ''}`;
                               
  return (
    <ul className={className}>
      {children}
    </ul>
  );
};

export const OrderedList: React.FC<ListProps> = ({ children, start }) => {
  return (
    <ol className="list-decimal" start={start}>
      {children}
    </ol>
  );
};

interface ListItemProps extends React.PropsWithChildren {
  node?: any;
  ordered?: boolean;
}

export const ListItem: React.FC<ListItemProps> = ({ children, node }) => {
  // 检查是否包含子列表
  const hasNestedList = node?.children?.some((child: any) => 
    child.type === 'list'
  );

  return (
    <li className={`list-item ${hasNestedList ? 'contains-nested-list' : ''}`}>
      {children}
    </li>
  );
};
