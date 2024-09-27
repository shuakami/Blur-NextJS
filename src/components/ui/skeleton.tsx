import {cn} from "@/lib/utils"

function Skeleton({
                      className,
                      ...props
                  }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("relative overflow-hidden bg-primary/5 rounded-md", className)}
            {...props}
        >
            <div className="absolute inset-0 w-full h-full shimmer-effect"></div>
        </div>
    )
}

export {Skeleton}
