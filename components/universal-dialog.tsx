"use client";

import * as React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type UniversalDialogSize =
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "full";

const sizeClasses: Record<UniversalDialogSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  full: "max-w-[96vw]",
};

export interface UniversalDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;

  // Header Props
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  headerAction?: React.ReactNode;
  hideHeader?: boolean;

  // Body Props
  children: React.ReactNode;
  scrollable?: boolean;

  // Footer Props
  footer?: React.ReactNode;

  // Styling & Options
  size?: UniversalDialogSize;
  contentClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  showCloseButton?: boolean;
}

/**
 * UniversalDialog provides a standardized, responsive modal dialog shell
 * across the application, unifying dialog sizing, header formatting (icon, title, badge, description),
 * scroll containers, and footer actions.
 */
export function UniversalDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  icon,
  badge,
  headerAction,
  hideHeader = false,
  children,
  scrollable = true,
  footer,
  size = "2xl",
  contentClassName,
  headerClassName,
  bodyClassName,
  footerClassName,
  showCloseButton = true,
}: UniversalDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        showCloseButton={showCloseButton}
        className={cn(
          "flex h-auto max-h-[90vh] sm:h-auto sm:max-h-[86vh] w-full flex-col gap-0 overflow-hidden p-0 text-xs",
          sizeClasses[size],
          contentClassName
        )}
      >
        {!hideHeader && (title || description || icon) && (
          <DialogHeader
            className={cn(
              "shrink-0 border-b border-border bg-muted/20 p-4 pr-14 pb-3.5 sm:p-5",
              headerClassName
            )}
          >
            <div className="flex items-center gap-3">
              {icon && (
                <div className="flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary shadow-xs">
                  {icon}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {title && (
                    <DialogTitle className="font-heading text-base font-semibold tracking-tight text-foreground">
                      {title}
                    </DialogTitle>
                  )}
                  {badge}
                </div>
                {description && (
                  <DialogDescription className="mt-0.5 text-xs text-muted-foreground">
                    {description}
                  </DialogDescription>
                )}
              </div>
              {headerAction && (
                <div className="shrink-0 mr-2">{headerAction}</div>
              )}
            </div>
          </DialogHeader>
        )}

        {scrollable ? (
          <div
            className={cn(
              "flex-1 min-h-0 overflow-y-auto p-4 sm:p-6",
              bodyClassName
            )}
          >
            {children}
          </div>
        ) : (
          <div
            className={cn(
              "flex-1 min-h-0 flex flex-col overflow-hidden",
              bodyClassName
            )}
          >
            {children}
          </div>
        )}

        {footer && (
          <DialogFooter
            className={cn(
              "flex w-full shrink-0 items-center justify-end border-t border-border bg-muted/20 p-3 px-5 sm:p-4",
              footerClassName
            )}
          >
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Subcomponents for custom compositional layouts
export function UniversalDialogHeader({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogHeader>) {
  return (
    <DialogHeader
      className={cn(
        "shrink-0 border-b border-border bg-muted/20 p-4 pr-14 pb-3.5 sm:p-5",
        className
      )}
      {...props}
    >
      {children}
    </DialogHeader>
  );
}

export function UniversalDialogBody({
  className,
  scrollable = true,
  children,
  ...props
}: React.ComponentProps<"div"> & { scrollable?: boolean }) {
  return (
    <div
      className={cn(
        scrollable
          ? "flex-1 min-h-0 overflow-y-auto p-4 sm:p-6"
          : "flex-1 min-h-0 flex flex-col overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function UniversalDialogFooter({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogFooter>) {
  return (
    <DialogFooter
      className={cn(
        "flex w-full shrink-0 items-center justify-between border-t border-border bg-muted/20 p-3 px-5 sm:justify-between sm:p-4",
        className
      )}
      {...props}
    >
      {children}
    </DialogFooter>
  );
}

export { DialogClose };
