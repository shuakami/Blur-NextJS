import { memo } from 'react';
import { BlockMath } from '@/components/ui/markdown/MathRenderer';

const MathBlock = memo(({ children }: { children: React.ReactNode }) => {
    const value = String(children).trim();
    return <BlockMath>{value}</BlockMath>;
});

MathBlock.displayName = 'MathBlock';
export default MathBlock;