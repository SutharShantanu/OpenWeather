"use client"

import * as React from "react"
import { CheckIcon, CopyIcon } from "lucide-react"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface CopyButtonProps
  extends Omit<ButtonProps, "children" | "value"> {
  /**
   * The text/string or a synchronous/asynchronous function returning the string to copy.
   */
  value: string | (() => string | Promise<string>)

  /**
   * Label to display when idle (not yet copied).
   * @default "Copy"
   */
  copyLabel?: React.ReactNode

  /**
   * Label to display after successfully copying.
   * @default "Copied"
   */
  copiedLabel?: React.ReactNode

  /**
   * Whether to render as an icon-only button without text.
   * Automatically inferred if `size` is an icon size (e.g. "icon", "icon-xs", "icon-sm", "icon-lg", "icon-xl").
   */
  iconOnly?: boolean

  /**
   * Custom icon element for the idle state.
   */
  copyIcon?: React.ReactNode

  /**
   * Custom icon element for the copied state.
   */
  copiedIcon?: React.ReactNode

  /**
   * Timeout in milliseconds to reset copied feedback.
   * @default 2000
   */
  timeout?: number

  /**
   * Callback fired when text is successfully copied to the clipboard.
   */
  onCopySuccess?: (copiedValue: string) => void

  /**
   * Callback fired if copying to clipboard fails.
   */
  onCopyError?: (error: Error) => void

  /**
   * Optional custom children or render function taking `{ isCopied }`.
   */
  children?:
    | React.ReactNode
    | ((props: { isCopied: boolean }) => React.ReactNode)
}

function resolveButtonSize(
  size: ButtonProps["size"] = "default",
  iconOnly?: boolean
): ButtonProps["size"] {
  if (iconOnly) {
    if (typeof size === "string" && size.startsWith("icon")) {
      return size
    }
    switch (size) {
      case "xs":
        return "icon-xs"
      case "sm":
        return "icon-sm"
      case "lg":
        return "icon-lg"
      case "xl":
        return "icon-xl"
      default:
        return "icon"
    }
  }
  return size
}

/**
 * A versatile, accessible copy-to-clipboard button supporting standard and icon-only layouts,
 * dynamic sizing, custom feedback durations, and custom render props.
 */
export const CopyButton = React.forwardRef<HTMLButtonElement, CopyButtonProps>(
  function CopyButton(
    {
      value,
      copyLabel = "Copy",
      copiedLabel = "Copied",
      iconOnly,
      copyIcon,
      copiedIcon,
      timeout = 2000,
      onCopySuccess,
      onCopyError,
      variant = "outline",
      size = "default",
      className,
      onClick,
      children,
      "aria-label": ariaLabelProp,
      title: titleProp,
      disabled,
      ...props
    },
    ref
  ) {
    const isIconOnly =
      iconOnly ?? (typeof size === "string" && size.startsWith("icon"))
    const resolvedSize = resolveButtonSize(size, isIconOnly)

    const { isCopied, copyToClipboard } = useCopyToClipboard({
      timeout,
      onCopy: onCopySuccess,
      onError: onCopyError,
    })

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e)
      if (e.defaultPrevented || disabled) return

      try {
        const text = typeof value === "function" ? await value() : value
        await copyToClipboard(text)
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to resolve copy value")
        onCopyError?.(error)
      }
    }

    const currentLabelNode = isCopied ? copiedLabel : copyLabel
    const fallbackText = isCopied ? "Copied" : "Copy"
    const labelString =
      typeof currentLabelNode === "string" ? currentLabelNode : fallbackText

    const accessibleLabel = ariaLabelProp ?? labelString
    const hoverTitle = titleProp ?? (isIconOnly ? labelString : undefined)

    const renderedIcon = isCopied
      ? copiedIcon ?? (
          <CheckIcon
            className="animate-in fade-in zoom-in-75 duration-200"
            aria-hidden="true"
          />
        )
      : copyIcon ?? (
          <CopyIcon
            className="animate-in fade-in duration-200"
            aria-hidden="true"
          />
        )

    return (
      <Button
        ref={ref}
        type="button"
        variant={variant}
        size={resolvedSize}
        aria-label={accessibleLabel}
        title={hoverTitle}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          "transition-colors",
          isCopied && "text-primary border-primary/30",
          className
        )}
        {...props}
      >
        {typeof children === "function" ? (
          children({ isCopied })
        ) : children !== undefined ? (
          children
        ) : (
          <>
            {renderedIcon}
            {!isIconOnly && currentLabelNode && <span>{currentLabelNode}</span>}
          </>
        )}
      </Button>
    )
  }
)

CopyButton.displayName = "CopyButton"

/**
 * Example pattern implementation matching the reui pattern request.
 */
export function Pattern() {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 1500 })

  return (
    <Button
      variant="outline"
      aria-label={isCopied ? "Copied" : "Copy"}
      onClick={() => copyToClipboard("https://reui.io")}
    >
      {isCopied ? (
        <CheckIcon aria-hidden="true" />
      ) : (
        <CopyIcon aria-hidden="true" />
      )}
      <span>{isCopied ? "Copied" : "Copy"}</span>
    </Button>
  )
}
