import React, { memo } from "react";
import { AlertCircle } from "lucide-react";

interface ErrorMessageProps {
  error: {
    code: number;
    message: string;
  };
}

const ErrorMessage = memo(({ error }: ErrorMessageProps) => (
    <div className="flex flex-col min-w-0 flex-1 mt-6 mb-4">
        <div className="rounded-2xl border-[0.5px] border-red-200/70 dark:border-red-500/30 px-3 py-1
                    bg-red-50/60 dark:bg-red-500/[0.075]">
      <div className="flex w-full items-center p-4">
        <div className="flex flex-1 min-w-0 gap-3">
          <AlertCircle 
            className="h-[20px] w-[20px] flex-shrink-0 
                       text-red-600 dark:text-red-400" 
          />
          <p className="min-w-0 text-sm-md leading-relaxed 
                       text-gray-850 dark:text-gray-50">
            {error.message}
          </p>
        </div>
        <div className="ml-4 pl-4 border-l border-red-200/50 dark:border-red-500/30">
          <div className="text-xs font-mono px-1
                         text-red-500/70 dark:text-red-400/60">
            Error {error.code}
          </div>
        </div>
      </div>
    </div>
  </div>
));

ErrorMessage.displayName = 'ErrorMessage';

export default ErrorMessage;