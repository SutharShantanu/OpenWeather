"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

function InputGroup({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      className={cn(
        "group/input-group relative flex w-full items-stretch rounded-none border border-input bg-transparent text-xs transition-colors focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/50 has-[input:disabled]:pointer-events-none has-[input:disabled]:opacity-50 dark:bg-input/30",
        "[&>input]:border-0 [&>input]:bg-transparent [&>input]:focus-visible:ring-0 [&>input]:focus-visible:border-0 [&>input]:h-8 [&>input]:flex-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function InputGroupInput({
  className,
  type,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input-group-control"
      className={cn(
        "h-8 w-full min-w-0 flex-1 bg-transparent px-2.5 py-1 text-xs outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-xs",
        className
      )}
      {...props}
    />
  )
}

interface InputGroupAddonProps extends React.ComponentProps<"div"> {
  align?: "inline-start" | "inline-end" | "block-start" | "block-end"
}

function InputGroupAddon({
  className,
  align = "inline-end",
  children,
  ...props
}: InputGroupAddonProps) {
  return (
    <div
      data-slot="input-group-addon"
      data-align={align}
      className={cn(
        "flex shrink-0 items-center justify-center text-muted-foreground",
        align === "inline-start" && "pl-2.5 pr-1 order-first",
        align === "inline-end" && "px-1.5 order-last",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function InputGroupText({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="input-group-text"
      className={cn(
        "flex items-center text-tiny text-muted-foreground select-none font-mono",
        className
      )}
      {...props}
    />
  )
}

function InputGroupButton({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group-button"
      className={cn("flex items-stretch shrink-0", className)}
      {...props}
    />
  )
}

export {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupText,
  InputGroupButton,
}
