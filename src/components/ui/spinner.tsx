import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: number;
  className?: string;
}

export function Spinner({ size = 20, className }: SpinnerProps) {
  return (
    <div 
      className={cn("inline-flex", className)}
      style={{ '--spinner-size': `${size}px` } as React.CSSProperties}
    >
      <div className="relative w-[var(--spinner-size)] h-[var(--spinner-size)] min-w-4 ">
        <div className="absolute top-1/2 left-1/2 w-[var(--spinner-size)] h-[var(--spinner-size)]">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "absolute h-[8%] w-[24%] -left-[10%] -top-[3.9%]",
                "rounded-[var(--radius)]",
                "bg-neutral-700 dark:bg-neutral-300", // 添加背景色
                {
                  'animate-spinner-1': i === 0,
                  'animate-spinner-2': i === 1,
                  'animate-spinner-3': i === 2,
                  'animate-spinner-4': i === 3,
                  'animate-spinner-5': i === 4,
                  'animate-spinner-6': i === 5,
                  'animate-spinner-7': i === 6,
                  'animate-spinner-8': i === 7,
                  'animate-spinner-9': i === 8,
                  'animate-spinner-10': i === 9,
                  'animate-spinner-11': i === 10,
                  'animate-spinner-12': i === 11,
                }
              )}
              style={{
                transform: `rotate(${i * 30}deg) translate(146%)`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}