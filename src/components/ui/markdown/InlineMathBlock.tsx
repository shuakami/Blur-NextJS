import { memo } from 'react';
import { InlineMath } from '@/components/ui/markdown/MathRenderer';

const InlineMathBlock = memo(({ children }: { children: React.ReactNode }) => {
    const value = String(children).trim();
    return <InlineMath>{value}</InlineMath>;
});

InlineMathBlock.displayName = 'InlineMathBlock';
export default InlineMathBlock;