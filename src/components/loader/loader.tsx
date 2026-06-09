"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useReveal } from "./load-context";

const MIN_DURATION = 1100; // ms - keep the loader on screen at least this long
const MAX_DURATION = 8000; // ms - never let the loader hang past this

const WORDMARK = ["Gowtham\u2019s", "Portfolio"];

// Warm ember palette for the warp streaks (cream → gold → amber).
const STAR_COLORS = [
  "255,244,224",
  "255,214,150",
  "245,200,150",
  "236,227,214",
  "255,186,116",
];

function phaseFor(p: number) {
  if (p >= 100) return "Arrived";
  if (p < 40) return "Igniting";
  if (p < 80) return "Accelerating";
  return "Lightspeed";
}

/* ---------------------------------------------------------------- */
/* Warm hyperspace warp - a 3D star field projected to 2D, streaking */
/* outward from the centre and ACCELERATING with load progress.      */
/* ---------------------------------------------------------------- */

type Star = { x: number; y: number; z: number; c: string };

function Warp({
  progressRef,
  reduce,
}: {
  progressRef: RefObject<number>;
  reduce: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let cx = 0;
    let cy = 0;
    let depth = 1;
    let focal = 1;
    let stars: Star[] = [];

    const respawn = (s: Star, far: boolean) => {
      s.x = (Math.random() * 2 - 1) * w;
      s.y = (Math.random() * 2 - 1) * h;
      s.z = far ? depth : 1 + Math.random() * depth;
      s.c = STAR_COLORS[(Math.random() * STAR_COLORS.length) | 0];
    };

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      cx = w / 2;
      cy = h / 2;
      depth = Math.max(w, h);
      focal = depth * 0.35;
      canvas.width = Math.floor(w * DPR);
      canvas.height = Math.floor(h * DPR);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const count = Math.min(640, Math.max(240, Math.floor((w * h) / 3400)));
      stars = Array.from({ length: count }, () => {
        const s: Star = { x: 0, y: 0, z: 0, c: "" };
        respawn(s, false);
        return s;
      });
      ctx.fillStyle = "#0a0806";
      ctx.fillRect(0, 0, w, h);
    };
    resize();
    window.addEventListener("resize", resize);

    // Reduced motion: a single static, calm star field (no warp).
    if (reduce) {
      ctx.fillStyle = "#0a0806";
      ctx.fillRect(0, 0, w, h);
      for (const s of stars) {
        const sx = (s.x / s.z) * focal + cx;
        const sy = (s.y / s.z) * focal + cy;
        const c = 1 - s.z / depth;
        ctx.fillStyle = `rgba(${s.c},${0.2 + c * 0.5})`;
        ctx.fillRect(sx, sy, 1.4, 1.4);
      }
      return () => window.removeEventListener("resize", resize);
    }

    let raf = 0;
    const draw = () => {
      const p = Math.min(1, Math.max(0, (progressRef.current ?? 0) / 100));
      const speed = depth * (0.004 + p * p * 0.05); // ease-in acceleration

      // Translucent dark wash leaves a soft motion-blur trail behind streaks.
      ctx.fillStyle = "rgba(10,8,6,0.34)";
      ctx.fillRect(0, 0, w, h);
      ctx.lineCap = "round";

      for (const s of stars) {
        const pz = s.z;
        s.z -= speed;
        if (s.z < 1) {
          respawn(s, true);
          continue;
        }
        const sx = (s.x / s.z) * focal + cx;
        const sy = (s.y / s.z) * focal + cy;
        const px = (s.x / pz) * focal + cx;
        const py = (s.y / pz) * focal + cy;

        const closeness = 1 - s.z / depth; // 0 far → ~1 near
        const alpha = Math.min(1, 0.1 + closeness * closeness * 1.15);
        ctx.strokeStyle = `rgba(${s.c},${alpha})`;
        ctx.lineWidth = 0.5 + closeness * closeness * 2.6;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.stroke();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [reduce, progressRef]);

  return <canvas ref={ref} aria-hidden className="absolute inset-0 h-full w-full" />;
}

/* ---------------------------------------------------------------- */
/* Loader                                                            */
/* ---------------------------------------------------------------- */

export function Loader() {
  const reduceMotion = useReducedMotion();
  const { setRevealed, assetProgress, assetReady } = useReveal();

  const [display, setDisplay] = useState(0);
  const [done, setDone] = useState(false);
  const mountedAt = useRef<number>(Date.now());
  const progressRef = useRef(0);

  const target = assetReady ? 100 : Math.min(assetProgress, 95);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      setDisplay((prev) => {
        const next = prev + (target - prev) * 0.1;
        return Math.abs(target - next) < 0.4 ? target : next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  // Feed the canvas via a ref so the warp never waits on React re-renders.
  useEffect(() => {
    progressRef.current = display;
  }, [display]);

  useEffect(() => {
    if (!assetReady) return;
    const elapsed = Date.now() - mountedAt.current;
    const wait = Math.max(0, MIN_DURATION - elapsed);
    const timeout = setTimeout(() => {
      setDisplay(100);
      setDone(true);
    }, wait);
    return () => clearTimeout(timeout);
  }, [assetReady]);

  useEffect(() => {
    const failSafe = setTimeout(() => {
      setDisplay(100);
      setDone(true);
    }, MAX_DURATION);
    return () => clearTimeout(failSafe);
  }, []);

  const rounded = Math.min(100, Math.round(display));
  const p = Math.min(100, display) / 100;
  const caption = phaseFor(rounded);

  return (
    <AnimatePresence onExitComplete={() => setRevealed(true)}>
      {!done && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[100] overflow-hidden bg-background gpu"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] },
          }}
        >
          <Warp progressRef={progressRef} reduce={!!reduceMotion} />

          {/* Soft dark core so the centred wordmark stays readable over the warp. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(42% 42% at 50% 50%, rgba(8,6,4,0.62), rgba(8,6,4,0) 72%)",
            }}
          />
          {/* Warm core that brightens + swells as the warp accelerates. */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 rounded-full blur-3xl"
            style={{
              width: "72vmin",
              height: "72vmin",
              transform: `translate(-50%,-50%) scale(${0.6 + p * 0.6})`,
              opacity: 0.14 + p * 0.5,
              background:
                "radial-gradient(circle, rgba(255,200,140,0.5), rgba(255,168,90,0.12) 45%, transparent 70%)",
            }}
          />

          <div className="vignette pointer-events-none absolute inset-0" />
          <div className="film-grain pointer-events-none absolute -inset-[20%]" />

          {/* Centre console - flies toward you and dissolves as the curtain lifts. */}
          <motion.div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 px-6"
            exit={
              reduceMotion
                ? undefined
                : {
                    opacity: 0,
                    scale: 1.18,
                    filter: "blur(6px)",
                    transition: { duration: 0.55, ease: "easeIn" },
                  }
            }
          >
            <motion.div
              className="text-center font-display text-[clamp(1.9rem,9.5vw,4.6rem)] font-bold leading-[0.92] tracking-tight text-cream"
              style={{ textShadow: "0 0 36px rgba(255,200,140,0.4)" }}
              initial={
                reduceMotion
                  ? false
                  : { opacity: 0, scale: 0.92, filter: "blur(12px)" }
              }
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              {WORDMARK.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </motion.div>

            <div className="flex items-center gap-3 font-sans text-[0.7rem] uppercase tracking-[0.4em] sm:text-xs">
              <div className="h-4 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={caption}
                    initial={reduceMotion ? false : { y: 12, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={reduceMotion ? { opacity: 0 } : { y: -12, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="block text-accent"
                  >
                    {caption}
                  </motion.span>
                </AnimatePresence>
              </div>
              <span className="h-3 w-px bg-cream/25" />
              <span className="tabular-nums text-cream/85">{rounded}%</span>
            </div>
          </motion.div>

          {/* Lightspeed flash at the moment of arrival (on exit). */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-20 bg-[#f4e8d2]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0 }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : {
                    opacity: [0, 0.55, 0],
                    transition: { duration: 0.6, times: [0, 0.4, 1] },
                  }
            }
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
