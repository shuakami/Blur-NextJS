"use client";

import { FC } from 'react';
import { BookProvider } from '@/app/[笔记管理]/BookContext';
import { BookEditor } from '@/components/book/editor/BookEditor';

// 主页面组件
const BookPage: FC = () => (
    <BookProvider>
        <BookEditor />
    </BookProvider>
);

export default BookPage;