"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

/**
 * A large, cinematic moon that lives INSIDE the About section's normal flow -
 * NOT a fixed overlay. It scrolls up and away with the section exactly like the
 * text, and the only extra motion is a horizontal DRIFT TO THE LEFT as it passes
 * through view. Pure CSS disc, transform-only -> 60fps.
 *
 * Layering: rendered at z-1 inside the section, so it sits ABOVE the section
 * background + watermark but BELOW the text (z-10) and the birds (fixed, z-20).
 *
 * Position/size knobs:
 *   - container `left-[..] top-[..]`  -> where it sits within the section.
 *   - the `x` range                   -> how far it drifts left while scrolling.
 *   - `h/w-[44vmin]` in MoonDisc       -> its size.
 */
export function Moon() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // Progress as this element passes through the viewport (scrolls with section).
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // Horizontal-only parallax: the moon slides in from the RIGHT, moves LEFT, and
  // STOPS at its resting spot (x = 0 -> the base left-[..] position), then HOLDS
  // there as it keeps scrolling up with the section.
  const x = useTransform(
    scrollYProgress,
    [0, 0.4, 1],
    reduce ? ["0vw", "0vw", "0vw"] : ["18vw", "0vw", "0vw"],
  );

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute left-[78vw] top-[76vh] z-[1]"
    >
      <motion.div style={{ x }}>
        <div className="-translate-x-1/2 -translate-y-1/2">
          <MoonDisc />
        </div>
      </motion.div>
    </div>
  );
}

// Fine grayscale grain for surface texture (static fractal noise), clipped to
// the disc and blended so it reads as regolith rather than a flat fill.
const MOON_NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

function MoonDisc() {
  return (
    <div className="relative h-[44vmin] w-[44vmin]">
      {/* Warm outer halo. */}
      <div
        className="absolute -inset-[22%] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255,226,182,0.4), rgba(255,198,140,0.12) 52%, transparent 72%)",
        }}
      />
      {/* Tight inner glow hugging the rim. */}
      <div
        className="absolute -inset-[4%] rounded-full blur-xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255,238,208,0.3), transparent 66%)",
        }}
      />
      {/* The disc: base sphere gradient (last layer) with maria + craters on top. */}
      <div
        className="absolute inset-0 overflow-hidden rounded-full"
        style={{
          backgroundColor: "#f1e6cb",
          backgroundImage: [
            // Craters with a faint sunlit rim (dark pit + bright ring).
            "radial-gradient(circle at 38% 33%, rgba(138,126,98,0.6) 0 2.4%, rgba(255,248,226,0.4) 3.4%, transparent 4.4%)",
            "radial-gradient(circle at 66% 49%, rgba(138,126,98,0.55) 0 3.8%, rgba(255,248,226,0.34) 4.9%, transparent 6%)",
            "radial-gradient(circle at 50% 71%, rgba(138,126,98,0.5) 0 2.9%, rgba(255,248,226,0.3) 3.9%, transparent 5%)",
            "radial-gradient(circle at 28% 60%, rgba(138,126,98,0.5) 0 2%, rgba(255,248,226,0.28) 3%, transparent 4%)",
            // Soft small craters (pits only).
            "radial-gradient(circle at 58% 24%, rgba(150,138,110,0.42), transparent 2.6%)",
            "radial-gradient(circle at 78% 58%, rgba(150,138,110,0.42), transparent 3.4%)",
            "radial-gradient(circle at 45% 52%, rgba(150,138,110,0.3), transparent 2%)",
            "radial-gradient(circle at 33% 70%, rgba(150,138,110,0.38), transparent 2.4%)",
            "radial-gradient(circle at 64% 80%, rgba(150,138,110,0.34), transparent 2.1%)",
            "radial-gradient(circle at 20% 42%, rgba(150,138,110,0.3), transparent 1.9%)",
            "radial-gradient(circle at 72% 33%, rgba(150,138,110,0.28), transparent 1.7%)",
            "radial-gradient(circle at 52% 40%, rgba(150,138,110,0.26), transparent 1.6%)",
            // Maria: large soft dark seas under the craters.
            "radial-gradient(circle at 62% 64%, rgba(146,132,100,0.3), transparent 34%)",
            "radial-gradient(circle at 34% 38%, rgba(146,132,100,0.24), transparent 40%)",
            "radial-gradient(circle at 72% 28%, rgba(146,132,100,0.16), transparent 28%)",
            // Base sphere with limb darkening (light top-left -> dark rim).
            "radial-gradient(circle at 43% 40%, #f9f0db 0%, #ece0bf 54%, #d6c79f 85%, #c4b38b 100%)",
          ].join(", "),
          boxShadow:
            "inset -14px -16px 38px rgba(102,90,66,0.55), inset 12px 14px 28px rgba(255,250,236,0.55), 0 0 80px rgba(255,212,156,0.3)",
        }}
      >
        {/* Fine regolith grain, clipped to the disc. */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: MOON_NOISE,
            backgroundSize: "150px 150px",
            opacity: 0.4,
            mixBlendMode: "overlay",
          }}
        />
      </div>
    </div>
  );
}
