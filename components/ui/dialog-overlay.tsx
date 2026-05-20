"use client";

import React from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface DialogOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  indicatorColor?: "red" | "cyan" | "aqua" | "amber" | "green" | "blue";
  children: React.ReactNode;
}

export const DialogOverlay: React.FC<DialogOverlayProps> = ({
  isOpen,
  onClose,
  title,
  subtitle = "NOTHING // METEOROLOGICAL_SYS",
  indicatorColor = "red",
  children,
}) => {
  React.useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);
  const getIndicatorColor = () => {
    switch (indicatorColor) {
      case "cyan":
        return "#00E5FF";
      case "aqua":
        return "#0091FF";
      case "amber":
        return "#FF9100";
      case "green":
        return "#39FF14";
      case "blue":
        return "#5B9BF6";
      case "red":
      default:
        return "#D71921";
    }
  };

  const getIndicatorGlow = () => {
    switch (indicatorColor) {
      case "cyan":
        return "rgba(0, 229, 255, 0.5)";
      case "aqua":
        return "rgba(0, 145, 255, 0.5)";
      case "amber":
        return "rgba(255, 145, 0, 0.5)";
      case "green":
        return "rgba(57, 255, 20, 0.5)";
      case "blue":
        return "rgba(91, 155, 246, 0.5)";
      case "red":
      default:
        return "rgba(215, 25, 33, 0.5)";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-lg bg-surface/95 dark:bg-surface/95 border border-border-visible rounded-none overflow-hidden shadow-2xl backdrop-blur-2xl flex flex-col p-0 max-h-[90vh] md:max-h-[85vh] focus:outline-none"
      >
        {/* Subtle dot matrix grid mask */}
        <div className="absolute inset-0 dot-grid-subtle opacity-[0.12] pointer-events-none" />

        {/* Tactical Title Bar */}
        <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-surface-raised/40 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            {/* Pulsing signal indicator dot */}
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor: getIndicatorColor(),
                boxShadow: `0 0 8px ${getIndicatorGlow()}`,
              }}
            />
            <div className="flex flex-col">
              <span className="font-mono text-[9px] tracking-[0.2em] text-text-secondary uppercase">
                {subtitle}
              </span>
              <DialogTitle className="font-mono text-xs font-bold text-text-primary uppercase mt-0.5 tracking-tight border-none p-0 bg-transparent">
                {title}
              </DialogTitle>
            </div>
          </div>

          {/* Tactical Close Button */}
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-border-visible hover:border-text-primary hover:bg-surface-raised rounded-none transition-all duration-150 group font-mono text-[9px] text-text-secondary hover:text-text-primary font-bold"
          >
            <span>CLOSE</span>
            <X size={10} className="transition-transform group-hover:rotate-90 duration-200" />
          </button>
        </div>

        {/* Modal Scrollable Content Slot */}
        <div className="relative z-10 flex-1 overflow-y-auto px-6 py-6 md:px-8 text-text-primary scrollbar-none">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};
