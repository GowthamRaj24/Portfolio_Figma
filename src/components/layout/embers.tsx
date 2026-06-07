import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * Slow, warm ember motes drifting upward through the dark sections - the living
 * afterglow of the hero's sunset. Pure CSS (transform/opacity only), a modest
 * count, and disabled under reduced motion -> 60fps. Deterministic values so
 * there's no hydration mismatch.
 */

type Ember = {
  left: string;
  size: number;
  delay: string;
  duration: string;
  drift: string;
};

const EMBERS: Ember[] = [
  { left: "5%", size: 5, delay: "0s", duration: "13s", drift: "4vw" },
  { left: "12%", size: 3, delay: "5s", duration: "16s", drift: "-2vw" },
  { left: "20%", size: 6, delay: "9s", duration: "12s", drift: "3vw" },
  { left: "28%", size: 4, delay: "2s", duration: "17s", drift: "-3vw" },
  { left: "37%", size: 3, delay: "11s", duration: "14s", drift: "2vw" },
  { left: "45%", size: 5, delay: "6s", duration: "15s", drift: "-4vw" },
  { left: "53%", size: 4, delay: "1s", duration: "18s", drift: "3vw" },
  { left: "61%", size: 6, delay: "8s", duration: "12s", drift: "-2vw" },
  { left: "69%", size: 3, delay: "4s", duration: "16s", drift: "4vw" },
  { left: "77%", size: 5, delay: "12s", duration: "14s", drift: "-3vw" },
  { left: "85%", size: 4, delay: "7s", duration: "17s", drift: "2vw" },
  { left: "93%", size: 3, delay: "3s", duration: "15s", drift: "-2vw" },
];

export function Embers({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      {EMBERS.map((ember, i) => (
        <span
          key={i}
          className="ember absolute bottom-[-6%] rounded-full"
          style={
            {
              left: ember.left,
              width: `${ember.size}px`,
              height: `${ember.size}px`,
              animationDelay: ember.delay,
              animationDuration: ember.duration,
              "--ember-drift": ember.drift,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
