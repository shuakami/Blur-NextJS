import { cn } from '@/lib/utils/utils';

interface SpinnerProps {
  size?: number;
  className?: string;
}

export function Spinner({ size = 20, className }: SpinnerProps) {
  return (
    <div 
      className={cn("relative", className)}
      style={{ 
        width: size,
        height: size
      }}
    >
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className={cn(
            "absolute",
            "bg-neutral-700 dark:bg-neutral-300",
            "rounded-[var(--radius)]",
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
            width: size * 0.21,
            height: size * 0.07,
            left: '50%',
            top: '50%',
            transform: `rotate(${i * 30}deg) translate(${size * 0.22}px, -50%)`,
            transformOrigin: 'left center',
            opacity: 0.8,
          }}
        />
      ))}
    </div>
  );
}