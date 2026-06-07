"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

/**
 * A faint night-sky star field for the dark sections. Stars are generated
 * DETERMINISTICALLY (a tiny seeded RNG) so server and client render the same
 * positions - no hydration mismatch and no Math.random. They're static dots
 * (one paint); life comes from two parent layers gently pulsing out of phase
 * (see .star-layer-a/b in globals.css), so the whole sky shimmers at ~60fps.
 *
 * Drop it into a section at z-0 (behind the content). Tune `count`/`opacity`
 * per section so the night deepens from About -> Projects.
 */

type Star = { x: number; y: number; size: number; bright: number };

function makeStars(count: number, seed: number): Star[] {
  let s = seed >>> 0;
  const rand = () => {
    // LCG - deterministic across SSR/CSR.
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
  return Array.from({ length: count }, () => ({
    x: rand() * 100,
    y: rand() * 100,
    size: 0.7 + rand() * 1.7,
    bright: 0.35 + rand() * 0.6,
  }));
}

function Dots({ stars }: { stars: Star[] }) {
  return (
    <>
      {stars.map((st, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${st.x}%`,
            top: `${st.y}%`,
            width: `${st.size}px`,
            height: `${st.size}px`,
            background: `rgba(255,244,222,${st.bright})`,
            boxShadow: `0 0 ${st.size * 2}px rgba(255,236,205,${st.bright * 0.5})`,
          }}
        />
      ))}
    </>
  );
}

export function StarField({
  count = 70,
  opacity = 1,
  seed = 11,
  className,
}: {
  count?: number;
  opacity?: number;
  seed?: number;
  className?: string;
}) {
  const stars = useMemo(() => makeStars(count, seed), [count, seed]);
  const a = stars.filter((_, i) => i % 2 === 0);
  const b = stars.filter((_, i) => i % 2 === 1);

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 z-0 overflow-hidden",
        className,
      )}
      style={{ opacity }}
    >
      <div className="star-layer-a absolute inset-0">
        <Dots stars={a} />
      </div>
      <div className="star-layer-b absolute inset-0">
        <Dots stars={b} />
      </div>
    </div>
  );
}
