"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { StarField } from "@/components/layout/star-field";
import { Embers } from "@/components/layout/embers";
import { useReveal } from "./load-context";

const MIN_DURATION = 1100; // ms - keep the loader on screen at least this long
const MAX_DURATION = 8000; // ms - never let the loader hang past this

const WORDMARK = ["Gowtham\u2019s", "Portfolio"];

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

  // Cap the visible counter at 95% until the asset is truly ready.
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

  // Safety net: never let the loader hang.
  useEffect(() => {
    const failSafe = setTimeout(() => {
      setDisplay(100);
      setDone(true);
    }, MAX_DURATION);
    return () => clearTimeout(failSafe);
  }, []);

  const rounded = Math.min(100, Math.round(display));
  const p = Math.min(100, display);
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
              width: "60vmin",
              height: "60vmin",
              background:
                "radial-gradient(circle, rgba(217,185,140,0.22), rgba(217,185,140,0.05) 45%, transparent 70%)",
              opacity: 0.2 + glow * 0.6,
              transform: `translate(-50%,-50%) scale(${0.7 + glow * 0.5})`,
            }}
          />

          {/* Cinematic edges + film texture, matching the site grade. */}
          <div className="vignette pointer-events-none absolute inset-0" />
          <div className="film-grain pointer-events-none absolute -inset-[20%]" />

          {/* Center: the name materialises, then FILLS with warm light as it loads.
              Fades + scales away as the curtain rises. */}
          <motion.div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-7 px-6"
            exit={
              reduceMotion
                ? undefined
                : {
                    opacity: 0,
                    scale: 1.06,
                    transition: { duration: 0.5, ease: "easeIn" },
                  }
            }
          >
            <motion.div
              className="relative"
              initial={
                reduceMotion
                  ? false
                  : { opacity: 0, y: 18, filter: "blur(10px)" }
              }
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Dim base of the wordmark (stacked two lines). */}
              <div className="font-display text-[clamp(1.9rem,9.5vw,4.6rem)] font-bold leading-[0.92] tracking-tight text-cream/12">
                {WORDMARK.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </div>
              {/* Bright fill, revealed left-to-right by the load progress. */}
              <div
                aria-hidden
                className="absolute inset-0 font-display text-[clamp(1.9rem,9.5vw,4.6rem)] font-bold leading-[0.92] tracking-tight text-cream"
                style={{
                  clipPath: `inset(0 ${100 - p}% 0 0)`,
                  textShadow: "0 0 32px rgba(217,185,140,0.45)",
                }}
              >
                {WORDMARK.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </div>
              {/* Glowing leading edge that sweeps across with progress. */}
              {!reduceMotion && p > 1 && p < 99 && (
                <span
                  aria-hidden
                  className="absolute top-0 bottom-0 w-[2px]"
                  style={{
                    left: `${p}%`,
                    background: "rgba(245,226,192,0.9)",
                    boxShadow: "0 0 14px 3px rgba(217,185,140,0.8)",
                  }}
                />
              )}
            </motion.div>

            {/* Evolving journey caption · live counter. */}
            <div className="flex items-center gap-3 font-sans text-[0.7rem] uppercase tracking-[0.35em] sm:text-xs">
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
              <span className="h-3 w-px bg-cream/20" />
              <span className="tabular-nums text-cream/80">{rounded}%</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
