import { FC } from 'react';
import Layout from '@/Book/components/Layout';

type HomeProps = {
  // 暂时不需要props
}

const BookHome: FC<HomeProps> = () => {
  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">我的知识库</h1>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* 后续添加文档卡片列表 */}
        </div>
      </div>
    </Layout>
  );
};

export default BookHome; 