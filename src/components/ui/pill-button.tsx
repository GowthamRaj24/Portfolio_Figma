"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type PillButtonProps = React.ComponentProps<"a"> & {
  variant?: "solid" | "outline";
};

export const PillButton = forwardRef<HTMLAnchorElement, PillButtonProps>(
  function PillButton({ variant = "outline", className, children, ...props }, ref) {
    return (
      <a
        ref={ref}
        className={cn(
          "group inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-medium uppercase tracking-[0.18em] transition-all duration-300",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          variant === "solid"
            ? "bg-cream text-[#0a0b0e] hover:bg-accent hover:text-[#0a0b0e]"
            : "border border-cream/30 bg-white/5 text-cream backdrop-blur-md hover:border-accent hover:bg-white/10 hover:text-accent",
          className,
        )}
        {...props}
      >
        {children}
      </a>
    );
  },
);
