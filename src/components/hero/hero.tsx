"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { PillButton } from "@/components/ui/pill-button";
import { HeroVideo } from "./hero-video";
import { Headline } from "./headline";
import { useReveal } from "@/components/loader/load-context";

export function Hero() {
  const { revealed } = useReveal();
  const reduceMotion = useReducedMotion();

  // Window-scroll parallax for the bottom row (reliable approach).
  const { scrollY } = useScroll();
  const [vh, setVh] = useState(0);
  useEffect(() => {
    const update = () => setVh(window.innerHeight);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  const range = vh || 800;

  // Bottom row drifts up and fades as the hero scrolls away.
  const bottomY = useTransform(
    scrollY,
    [0, range],
    reduceMotion ? [0, 0] : [0, -120],
  );
  const bottomFade = useTransform(
    scrollY,
    [0, range * 0.55],
    reduceMotion ? [1, 1] : [1, 0],
  );

  return (
    <section
      id="home"
      className="relative flex min-h-screen flex-col overflow-hidden bg-background"
    >
      {/* Background video + scrim */}
      <HeroVideo />

      <Navbar />

      {/* Giant headline - left aligned, nudged up like the reference */}
      <div className="relative z-10 mx-auto flex w-full max-w-[110rem] flex-1 flex-col justify-center px-6 pb-20 sm:px-10">
        <Headline />
      </div>

      {/* Bottom row: role subtitle + buttons (bottom-left) and scroll hint.
          Drifts up + fades on scroll for a layered parallax feel. */}
      <motion.div
        className="relative z-10 mx-auto flex w-full max-w-[110rem] items-end justify-between px-6 pb-10 sm:px-10 gpu"
        style={{ y: bottomY, opacity: bottomFade }}
      >
        <div className="flex flex-col gap-5">
          <motion.p
            className="text-cinematic font-sans text-sm uppercase tracking-[0.35em] text-cream/90 sm:text-base"
            initial={{ opacity: 0, y: 16 }}
            animate={revealed ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
          >
            Software Engineer
          </motion.p>

          {/* Resume + Contact buttons, bottom-left */}
          <motion.div
            className="flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={revealed ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.65 }}
          >
            <PillButton href="#resume" variant="solid">
              Resume
            </PillButton>
            <PillButton href="#contact" variant="outline">
              Contact
            </PillButton>
          </motion.div>
        </div>

        <motion.div
          className="hidden items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-muted sm:flex"
          initial={{ opacity: 0 }}
          animate={revealed ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <span>Scroll</span>
          <span className="h-10 w-px bg-line" />
        </motion.div>
      </motion.div>
    </section>
  );
}
