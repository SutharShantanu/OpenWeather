import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const DotVariants = cva(
    "inline-flex shrink-0 rounded-full",
    {
        variants: {
            variant: {
                default: "bg-primary/60",
                info: "bg-blue-500 dark:bg-blue-500",
                success: "bg-emerald-500 dark:bg-emerald-500",
                warning: "bg-amber-500 dark:bg-amber-500",
                danger: "bg-red-500 dark:bg-red-500",
            },
            size: {
                sm: "h-1.5 w-1.5",
                md: "h-2 w-2",
                lg: "h-2.5 w-2.5",
            },
            pulse: {
                true: "animate-pulse",
                false: "",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "md",
            pulse: false,
        },
    }
)

function Dot({
    className,
    variant,
    size,
    pulse,
    ...props
}: React.ComponentProps<"span"> &
    VariantProps<typeof DotVariants>) {
    return (
        <span
            aria-hidden
            data-slot="dot"
            className={cn(
                DotVariants({ variant, size, pulse }),
                className
            )}
            {...props}
        />
    )
}

export { Dot, DotVariants }
