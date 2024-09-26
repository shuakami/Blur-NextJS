// components/ScrollToBottom.tsx
import {useEffect, useRef} from 'react';

const ScrollToBottom: React.FC = () => {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({behavior: 'smooth'});
    });

    return <div ref={bottomRef}/>;
};

export default ScrollToBottom;