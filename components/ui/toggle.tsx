"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Toggle as TogglePrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

const toggleVariants = cva(
  "group/toggle inline-flex items-center justify-center gap-1.5 rounded-none font-mono text-xs font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        default:
          "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
        outline:
          "border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary shadow-2xs",
        subtle:
          "border border-border/70 bg-muted/20 text-muted-foreground hover:bg-muted/40 hover:text-foreground data-[state=on]:bg-primary/10 data-[state=on]:text-primary data-[state=on]:border-primary/40 data-[state=on]:font-bold",
      },
      size: {
        default: "h-8 px-3 text-xs",
        sm: "h-7 px-2.5 text-xs",
        lg: "h-9 px-3.5 text-xs",
      },
    },
    defaultVariants: {
      variant: "outline",
      size: "default",
    },
  }
);

function Toggle({
  className,
  variant = "outline",
  size = "default",
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };
