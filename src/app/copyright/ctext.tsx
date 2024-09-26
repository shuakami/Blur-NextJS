import React from 'react';
import Encode from "@/app/copyright/encode";

const CText: React.FC = () => {
    const version = process.env.NEXT_PUBLIC_VERSION as string;

    return (
        <>     <Encode/>
            <div className="text-center text-xs text-black/60 dark:text-[#b2b2b2]/90 mt-2">
                {version}&nbsp;-&nbsp;
                <span className="text-black/50 dark:text-[#b2b2b2]/80">
                    Blur 也可能会犯错哦。请注意检查消息是否正确。
                </span>
            </div>
        </>
    );
};

export default CText;
