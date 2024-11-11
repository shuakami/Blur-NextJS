import './skeleton.css';

export const CodeBlockSkeleton = () => (
  <div className="my-4 rounded-lg border border-gray-200 dark:border-gray-900 overflow-hidden skeleton-fade-in">
    <div className="bg-gray-50 dark:bg-gray-950 px-4 py-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-900">
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-20 rounded"></div>
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-16 rounded"></div>
    </div>
    <div className="p-4 bg-gray-50/70 dark:bg-gray-950/70 space-y-2">
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-full rounded"></div>
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-4/5 rounded"></div>
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-3/4 rounded"></div>
    </div>
  </div>
);


export const BlockMathSkeleton = () => (
  <div className="my-4 flex justify-center skeleton-fade-in">
    <div className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg p-4 w-4/5">
      <div className="flex space-x-2 items-center justify-center">
        <div className="bg-gray-200 dark:bg-gray-600 h-6 w-12 rounded"></div>
        <div className="bg-gray-200 dark:bg-gray-600 h-6 w-16 rounded"></div>
        <div className="bg-gray-200 dark:bg-gray-600 h-6 w-8 rounded"></div>
      </div>
    </div>
  </div>
);

export const InlineMathSkeleton = () => (
  <span className="inline-flex items-center mx-1 skeleton-fade-in">
    <span className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded px-2 py-1">
      <span className="inline-block bg-gray-200 dark:bg-gray-600 h-4 w-8 rounded"></span>
    </span>
  </span>
);
