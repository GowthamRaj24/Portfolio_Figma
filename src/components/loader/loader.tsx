"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { StarField } from "@/components/layout/star-field";
import { Embers } from "@/components/layout/embers";
import { useReveal } from "./load-context";

const MIN_DURATION = 1100; // ms - keep the loader on screen at least this long
const MAX_DURATION = 8000; // ms - never let the loader hang past this

// Progress ring geometry.
const R = 52;
const C = 2 * Math.PI * R;

// The loader narrates the site's own journey: a sunset drive into deep space.
function phaseFor(p: number) {
  if (p >= 100) return "Among the stars";
  if (p < 34) return "Starting the engine";
  if (p < 68) return "Chasing the sunset";
  return "Into the night";
}

export function Loader() {
  const reduceMotion = useReducedMotion();
  const { setRevealed, assetProgress, assetReady } = useReveal();

  const [display, setDisplay] = useState(0);
  const [done, setDone] = useState(false);
  const mountedAt = useRef<number>(Date.now());

  // Cap the visible counter at 95% until the asset is truly ready, so it
  // never claims "100%" before the background video can play through.
  const target = assetReady ? 100 : Math.min(assetProgress, 95);

  // Smoothly ease the displayed counter toward the target.
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

  // Complete once the asset is ready (respecting the minimum duration).
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

  // Safety net: never let the loader hang (e.g. if the video stalls).
  useEffect(() => {
    const failSafe = setTimeout(() => {
      setDisplay(100);
      setDone(true);
    }, MAX_DURATION);
    return () => clearTimeout(failSafe);
  }, []);

  const rounded = Math.min(100, Math.round(display));
  const p = Math.min(100, display);
  const dashOffset = C * (1 - p / 100);
  const glow = p / 100; // 0..1, drives the warming dawn glow
  const caption = phaseFor(rounded);

  return (
    <AnimatePresence onExitComplete={() => setRevealed(true)}>
      {!done && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[100] overflow-hidden bg-background gpu"
          initial={{ opacity: 1 }}
          exit={
            reduceMotion
              ? { opacity: 0, transition: { duration: 0.5 } }
              : {
                  y: "-100%",
                  transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] },
                }
          }
        >
          {/* Signature atmosphere - the same night sky + warm motes as the site. */}
          <StarField count={60} opacity={0.6} seed={7} />
          <Embers />

          {/* A warm "approaching dawn" glow that brightens + swells as it loads. */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 rounded-full blur-3xl"
            style={{
              width: "62vmin",
              height: "62vmin",
              background:
                "radial-gradient(circle, rgba(217,185,140,0.24), rgba(217,185,140,0.05) 45%, transparent 70%)",
              opacity: 0.22 + glow * 0.6,
              transform: `translate(-50%,-50%) scale(${0.7 + glow * 0.5})`,
            }}
          />

          {/* Cinematic edges + film texture, matching the site grade. */}
          <div className="vignette pointer-events-none absolute inset-0" />
          <div className="film-grain pointer-events-none absolute -inset-[20%]" />

          {/* Center launch console. Fades + scales away as the curtain rises. */}
          <motion.div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-9 sm:gap-11"
            exit={
              reduceMotion
                ? undefined
                : {
                    opacity: 0,
                    scale: 1.08,
                    transition: { duration: 0.5, ease: "easeIn" },
                  }
            }
          >
            {/* Orbital progress ring with a comet tracing it + center monogram. */}
            <div className="relative h-[clamp(152px,40vmin,224px)] w-[clamp(152px,40vmin,224px)]">
              {/* Slowly turning dashed "instrument" ring (decorative). */}
              <motion.div
                aria-hidden
                className="absolute -inset-3 rounded-full border border-dashed border-cream/10"
                animate={reduceMotion ? undefined : { rotate: 360 }}
                transition={
                  reduceMotion
                    ? undefined
                    : { duration: 26, ease: "linear", repeat: Infinity }
                }
              />

              <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                <defs>
                  <linearGradient id="loaderArc" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#f3dcb2" />
                    <stop offset="100%" stopColor="#d9b98c" />
                  </linearGradient>
                </defs>
                {/* Base rail. */}
                <circle
                  cx="60"
                  cy="60"
                  r={R}
                  fill="none"
                  stroke="rgba(236,231,221,0.1)"
                  strokeWidth="1.5"
                />
                {/* Progress arc. */}
                <circle
                  cx="60"
                  cy="60"
                  r={R}
                  fill="none"
                  stroke="url(#loaderArc)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={dashOffset}
                  style={{ filter: "drop-shadow(0 0 6px rgba(217,185,140,0.6))" }}
                />
              </svg>

              {/* Comet riding the leading edge of the arc. The arc circle has
                  r=52 in a 120 viewBox, so its top point sits 6.67% in from the
                  container edge - place the comet on that radius so it traces
                  the stroke exactly. */}
              <div
                className="absolute inset-0"
                style={{ transform: `rotate(${p * 3.6}deg)` }}
              >
                <span
                  className="absolute left-1/2 top-[6.67%] h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cream"
                  style={{ boxShadow: "0 0 12px 3px rgba(217,185,140,0.85)" }}
                />
              </div>

              {/* Monogram in the core. */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.span
                  className="font-serif text-[clamp(2rem,9vmin,3.2rem)] font-bold tracking-[0.14em] text-cream"
                  style={{ textShadow: "0 0 26px rgba(217,185,140,0.35)" }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                  GRM
                </motion.span>
              </div>
            </div>

            {/* Evolving journey caption + the live counter. */}
            <div className="flex flex-col items-center gap-3.5">
              <div className="h-5 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={caption}
                    initial={reduceMotion ? false : { y: 14, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={reduceMotion ? { opacity: 0 } : { y: -14, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="block font-sans text-[0.7rem] uppercase tracking-[0.42em] text-accent"
                  >
                    {caption}
                  </motion.span>
                </AnimatePresence>
              </div>

              <div className="flex items-end gap-1 font-display font-bold tabular-nums text-cream">
                <span className="text-[clamp(1.6rem,5vmin,2.3rem)] leading-none">
                  {rounded}
                </span>
                <span className="pb-0.5 text-base text-cream/40">%</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
