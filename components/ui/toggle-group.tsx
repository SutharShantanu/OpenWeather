"use client";

import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";
import { toggleVariants } from "@/components/ui/toggle";

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number;
    orientation?: "horizontal" | "vertical";
  }
>({
  size: "default",
  variant: "outline",
  spacing: 1,
  orientation: "horizontal",
});

function ToggleGroup({
  className,
  variant = "outline",
  size = "default",
  spacing = 1,
  orientation = "horizontal",
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants> & {
    spacing?: number;
    orientation?: "horizontal" | "vertical";
  }) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      data-orientation={orientation}
      className={cn(
        "group/toggle-group inline-flex items-center rounded-none font-mono text-xs",
        spacing === 0
          ? "gap-0 [&>*:not(:first-child)]:border-l-0"
          : spacing === 1
          ? "gap-1.5"
          : "gap-2",
        orientation === "vertical" ? "flex-col items-stretch" : "flex-row",
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider
        value={{ variant, size, spacing, orientation }}
      >
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext);

  const resolvedVariant = variant || context.variant || "outline";
  const resolvedSize = size || context.size || "default";

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={resolvedVariant}
      data-size={resolvedSize}
      className={cn(
        toggleVariants({
          variant: resolvedVariant,
          size: resolvedSize,
        }),
        "cursor-pointer select-none font-mono transition-all",
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
}

export { ToggleGroup, ToggleGroupItem };
