"use client";

import React from "react";
import NumberFlow, { type NumberFlowProps } from "@number-flow/react";

interface AnimatedNumberProps extends Omit<NumberFlowProps, "value"> {
  value: number;
  className?: string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

export function AnimatedNumber({
  value,
  className,
  decimals = 0,
  prefix = "",
  suffix = "",
  ...props
}: AnimatedNumberProps) {
  // Ensure we are in the client context before rendering to avoid server mismatches
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <span className={className}>
        {prefix}
        {value.toFixed(decimals)}
        {suffix}
      </span>
    );
  }

  return (
    <div className="inline-flex items-center justify-center">
      {prefix && <span className={className}>{prefix}</span>}
      <NumberFlow
        value={value}
        className={className}
        format={{
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }}
        {...props}
      />
      {suffix && <span className={className}>{suffix}</span>}
    </div>
  );
}
