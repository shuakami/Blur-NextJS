import React from 'react';

export const UnorderedList: React.FC = (props) => (
    <ul className="list-disc" {...props} />
);

export const OrderedList: React.FC = (props) => (
    <ol className="list-decimal" {...props} />
);

export const ListItem: React.FC = (props) => (
    <li className="list-item" {...props} />
);
