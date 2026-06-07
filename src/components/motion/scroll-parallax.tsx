"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionStyle,
} from "framer-motion";
import { cn } from "@/lib/utils";

type ScrollParallaxProps = {
  children: React.ReactNode;
  /**
   * Vertical travel in pixels across the element's pass through the viewport.
   * Negative = drifts up as you scroll (foreground feel).
   * Positive = drifts down (background feel). Use small values for subtlety.
   */
  distance?: number;
  /** Optional fade as the element passes through (0..1 of opacity remaining). */
  fade?: boolean;
  /** Smooth the motion with a spring for a more fluid, premium feel. */
  smooth?: boolean;
  className?: string;
  as?: "div" | "span";
  style?: MotionStyle;
};

/**
 * Translates (and optionally fades) its children as they scroll through the
 * viewport. Transform/opacity only -> 60fps. The universal parallax building
 * block used across every section. Always renders a block-level element so the
 * transform applies reliably.
 */
export function ScrollParallax({
  children,
  distance = 60,
  fade = false,
  smooth = true,
  className,
  style,
}: ScrollParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const rawY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [-distance, distance],
  );
  const y = useSpring(rawY, {
    stiffness: smooth ? 120 : 1000,
    damping: smooth ? 30 : 100,
    mass: 0.4,
  });

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.15, 0.85, 1],
    fade && !reduceMotion ? [0.2, 1, 1, 0.2] : [1, 1, 1, 1],
  );

  return (
    <div ref={ref} className={cn("relative", className)}>
      <motion.div className="gpu" style={{ y, opacity, ...style }}>
        {children}
      </motion.div>
    </div>
  );
}
