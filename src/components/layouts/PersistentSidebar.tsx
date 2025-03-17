import React, { memo } from 'react';
import MessagesSidebar from '@/app/[侧边栏管理]/messages_sidebar';
import BookSidebar from '@/app/[侧边栏管理]/book_sidebar';
import { useLayout } from './LayoutContext';
import styles from './PersistentSidebar.module.css';

interface PersistentSidebarProps {
    sidebarType?: 'messages' | 'book';
}

const PersistentSidebar = memo<PersistentSidebarProps>(({ sidebarType = 'messages' }) => {
    const { isSidebarOpen, toggleSidebar, isMobile } = useLayout();

    const SidebarComponent = sidebarType === 'book' ? BookSidebar : MessagesSidebar;

    return (
        <div className={styles.root}>
            <div 
                className={`fixed top-0 left-0 h-full z-50 ${styles.sidebar}`}
                data-open={isSidebarOpen}
            >
                <SidebarComponent onClose={toggleSidebar} />
            </div>

            {/* 移动端遮罩 */}
            {isMobile && (
                <div 
                    className={`fixed inset-0 cursor-pointer z-40 ${styles.overlay}`}
                    data-open={isSidebarOpen}
                    onClick={toggleSidebar}
                />
            )}
        </div>
    );
});

PersistentSidebar.displayName = 'PersistentSidebar';

export default PersistentSidebar; 