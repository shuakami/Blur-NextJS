import React from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { CSSTransition } from 'react-transition-group';

interface CodeHeaderProps {
    language: string;
    copied: boolean;
    handleCopy: () => void;
}

const CodeHeader: React.FC<CodeHeaderProps> = ({ language, copied, handleCopy }) => {
    return (
        <div>
            {/* 语言标签 */}
            <div
                className="text-[0.75rem]"
                style={{
                    position: 'absolute',
                    top: '10px',
                    left: '13px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    zIndex: 1,
                }}
            >
                <span>{language}</span>
            </div>

            {/* 复制按钮 */}
            <div className="sticky top-2 cursor-pointer z-50">
                <div
                    className="label-button-container"
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '13px',
                        zIndex: 1,
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <CopyToClipboard text={language} onCopy={handleCopy}>
                        <CSSTransition in={copied} timeout={300} classNames="fade">
                            <button>
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </CSSTransition>
                    </CopyToClipboard>
                </div>
            </div>
        </div>
    );
};

export default CodeHeader;
