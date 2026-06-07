"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

/**
 * A sparse, continuous meteor shower for the dark space sections - a few white,
 * long-tailed streaks that fall on a shared radiant angle, staggered so some are
 * always in flight. Pure CSS animation (transform + opacity) -> 60fps. Positions
 * are seeded so server + client match (no hydration mismatch). The visual streak
 * + reduced-motion guard live in globals.css (.sky-meteor / @keyframes sky-meteor).
 */

function makeMeteors(count: number, seed: number) {
  let s = seed >>> 0;
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
  return Array.from({ length: count }, () => ({
    top: +(rand() * 58).toFixed(2), // start in the upper part of the viewport
    left: +(18 + rand() * 88).toFixed(2), // start right-ish, then streak down-left
    len: +(100 + rand() * 130).toFixed(1), // long tails
    delay: +(rand() * 14).toFixed(2), // spread out so they don't bunch up
    dur: +(10 + rand() * 9).toFixed(2), // full cycle: ~quick streak + a long rest
  }));
}

export function Meteors({
  count = 8,
  seed = 5,
  className,
}: {
  count?: number;
  seed?: number;
  className?: string;
}) {
  const meteors = useMemo(() => makeMeteors(count, seed), [count, seed]);
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 z-0 overflow-hidden",
        className,
      )}
    >
      {meteors.map((m, i) => (
        <span
          key={i}
          className="sky-meteor"
          style={{
            top: `${m.top}%`,
            left: `${m.left}%`,
            width: `${m.len}px`,
            animationDelay: `${m.delay}s`,
            animationDuration: `${m.dur}s`,
          }}
        />
      ))}
    </div>
  );
}
