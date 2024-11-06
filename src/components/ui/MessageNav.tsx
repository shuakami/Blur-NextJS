import { memo } from 'react';

interface MessageNavProps {
    currentIndex: number;
    totalCount: number;
    onPrev: () => void;
    onNext: () => void;
}

const MessageNav = memo(({ currentIndex, totalCount, onPrev, onNext }: MessageNavProps) => (
    <div className="mb-2 flex gap-3 empty:hidden mr-1 flex-row-reverse">
        <div className="items-center justify-start rounded-xl p-1 flex">
            <div className="flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-300">
                <button 
                    className="flex h-[30px] w-[30px] items-center justify-center rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:hover:bg-transparent" 
                    aria-label="上一回复"
                    onClick={onPrev}
                    disabled={currentIndex <= 1}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="icon-md-heavy">
                        <path fillRule="evenodd" clipRule="evenodd" d="M14.7071 5.29289C15.0976 5.68342 15.0976 6.31658 14.7071 6.70711L9.41421 12L14.7071 17.2929C15.0976 17.6834 15.0976 18.3166 14.7071 18.7071C14.3166 19.0976 13.6834 19.0976 13.2929 18.7071L7.29289 12.7071C7.10536 12.5196 7 12.2652 7 12C7 11.7348 7.10536 11.4804 7.29289 11.2929L13.2929 5.29289C13.6834 4.90237 14.3166 4.90237 14.7071 5.29289Z" fill="currentColor" />
                    </svg>
                </button>
                <div className="px-0.5 text-sm font-semibold tabular-nums">
                    {currentIndex}/{totalCount}
                </div>
                <button 
                    className="flex h-[30px] w-[30px] items-center justify-center rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:hover:bg-transparent"
                    aria-label="下一回复"
                    onClick={onNext}
                    disabled={currentIndex >= totalCount}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="icon-md-heavy">
                        <path fillRule="evenodd" clipRule="evenodd" d="M9.29289 18.7071C8.90237 18.3166 8.90237 17.6834 9.29289 17.2929L14.5858 12L9.29289 6.70711C8.90237 6.31658 8.90237 5.68342 9.29289 5.29289C9.68342 4.90237 10.3166 4.90237 10.7071 5.29289L16.7071 11.2929C16.8946 11.4804 17 11.7348 17 12C17 12.2652 16.8946 12.5196 16.7071 12.7071L10.7071 18.7071C10.3166 19.0976 9.68342 19.0976 9.29289 18.7071Z" fill="currentColor" />
                    </svg>
                </button>
            </div>
        </div>
    </div>
));

MessageNav.displayName = 'MessageNav';

export default MessageNav; 