"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type MouseParallaxProps = {
  children: React.ReactNode;
  /** Max pixel offset at the screen edges. Negative moves with the cursor. */
  strength?: number;
  /** Easing factor per frame (lower = smoother/laggier). */
  ease?: number;
  /** Constant scale applied so the offset never reveals edges. */
  scale?: number;
  className?: string;
};

/**
 * Moves its children a few pixels toward/away from the pointer using only
 * GPU-composited transforms, throttled with requestAnimationFrame (60fps-safe).
 */
export function MouseParallax({
  children,
  strength = -14,
  ease = 0.06,
  scale = 1,
  className,
}: MouseParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const base = scale === 1 ? "" : `scale(${scale}) `;

    if (reduceMotion) {
      el.style.transform = base.trim();
      return;
    }

    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * strength;
      ty = (e.clientY / window.innerHeight - 0.5) * strength;
    };

    const loop = () => {
      cx += (tx - cx) * ease;
      cy += (ty - cy) * ease;
      el.style.transform = `${base}translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduceMotion, strength, ease, scale]);

  return (
    <div
      ref={ref}
      className={cn("gpu", className)}
      style={{ transform: scale === 1 ? undefined : `scale(${scale})` }}
    >
      {children}
    </div>
  );
}
