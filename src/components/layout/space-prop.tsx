"use client";

import { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";

type SpacePropProps = {
  src: string;
  alt: string;
  /** Positioning + sizing utilities (absolute, top/left/right, width). */
  className?: string;
  /** Scroll-linked vertical travel in px across the section (background drift). */
  parallax?: number;
  /**
   * Scroll-linked HORIZONTAL travel as [from, to] in vw, mapped across the
   * element's pass through the viewport (e.g. [0, -90] = start in place and
   * drift a screen-width to the left, exiting off-screen).
   */
  driftX?: [number, number];
  /**
   * Scroll-linked VERTICAL travel as [from, to] in vh. Pair with `driftX` for a
   * straight diagonal sweep. Overrides the symmetric `parallax` when set.
   */
  driftY?: [number, number];
  /** `tumble` = a slow full rotation (asteroid); otherwise a gentle zero-g sway. */
  tumble?: boolean;
  /** Ambient loop amplitudes. */
  bob?: number;
  sway?: number;
  tilt?: number;
  /** Ambient loop durations (s). */
  floatDuration?: number;
  spinDuration?: number;
  /** Depth cues. */
  blur?: number;
  opacity?: number;
  /**
   * Image already has a transparent background -> render it at full fidelity
   * (no `screen` blend) with a soft warm glow so it sits in the scene. When
   * false, the pure-black backdrop is melted away via `mix-blend: screen`.
   */
  cutout?: boolean;
  /** Warm glow strength for cutout mode (0..1). */
  glow?: number;
  /** Mirror the image horizontally (face the other way). */
  flip?: boolean;
  /** Mirror the image vertically (flip top-to-bottom). */
  flipY?: boolean;
  /** Static base rotation in degrees (e.g. a meteor's streak angle). */
  rotate?: number;
  /** Scroll-linked scale as [from, to] - the image grows as you scroll past. */
  growOnScroll?: [number, number];
};

/**
 * A lightweight, decorative "space object" for the dark sections. The source
 * images have pure-black backgrounds, so `mix-blend-mode: screen` melts the
 * black into the warm-dark starfield and only the lit subject floats - stars
 * even show through it. Motion is split across wrappers so the blurred image
 * stays a single static layer while only transforms animate (GPU, 60fps):
 *   outer  -> scroll-linked parallax (drift)
 *   middle -> endless ambient float / tumble
 *   inner  -> the static, blended image
 */
export function SpaceProp({
  src,
  alt,
  className,
  parallax = 180,
  driftX,
  driftY,
  tumble = false,
  bob = 16,
  sway = 12,
  tilt = 4,
  floatDuration = 18,
  spinDuration = 120,
  blur = 1.2,
  opacity = 0.6,
  cutout = false,
  glow = 0.12,
  flip = false,
  flipY = false,
  rotate = 0,
  growOnScroll,
}: SpacePropProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // Vertical scroll travel: explicit driftY (vh) wins, else symmetric parallax (px).
  const rawY = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? [0, 0] : (driftY ?? [-parallax, parallax]),
  );
  const yNum = useSpring(rawY, { stiffness: 55, damping: 22, mass: 0.5 });
  const yPx = useMotionTemplate`${yNum}px`;
  const yVh = useMotionTemplate`${yNum}vh`;
  const y = driftY ? yVh : yPx;

  // Horizontal scroll travel (vw), e.g. a meteor sweeping across the screen.
  const rawX = useTransform(
    scrollYProgress,
    [0, 1],
    reduce || !driftX ? [0, 0] : driftX,
  );
  const xNum = useSpring(rawX, { stiffness: 55, damping: 22, mass: 0.5 });
  const x = useMotionTemplate`${xNum}vw`;

  // Scroll-linked scale: the prop grows as the section scrolls past.
  const rawScale = useTransform(
    scrollYProgress,
    [0, 1],
    reduce || !growOnScroll ? [1, 1] : growOnScroll,
  );
  const scale = useSpring(rawScale, { stiffness: 55, damping: 22, mass: 0.5 });

  const filter = cutout
    ? `blur(${blur}px) drop-shadow(0 0 30px rgba(255,255,255,${glow * 0.6})) drop-shadow(0 18px 52px rgba(217,185,140,${glow}))`
    : `blur(${blur}px)`;

  const baseTransform =
    [
      flip ? "scaleX(-1)" : "",
      flipY ? "scaleY(-1)" : "",
      rotate ? `rotate(${rotate}deg)` : "",
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  const image = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      draggable={false}
      className="block h-auto w-full"
      style={{
        mixBlendMode: cutout ? "normal" : "screen",
        filter,
        opacity,
        transform: baseTransform,
      }}
    />
  );

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn("pointer-events-none absolute z-0 select-none", className)}
    >
      <motion.div style={{ x, y, scale, willChange: "transform" }}>
        {reduce ? (
          image
        ) : tumble ? (
          <motion.div
            animate={{ y: [0, -bob, 0] }}
            transition={{
              duration: floatDuration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ willChange: "transform" }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: spinDuration,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{ willChange: "transform" }}
            >
              {image}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            animate={{ y: [0, -bob, 0], x: [0, sway, 0], rotate: [-tilt, tilt, -tilt] }}
            transition={{
              duration: floatDuration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ willChange: "transform" }}
          >
            {image}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
