"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ScrollParallax } from "@/components/motion/scroll-parallax";
import { PillButton } from "@/components/ui/pill-button";
import { Embers } from "@/components/layout/embers";
import { ReflectionVideo } from "@/components/about/reflection-video";
import { StarField } from "@/components/layout/star-field";
import {
  GeometricBackdrop,
  type Geo,
} from "@/components/layout/geometric-backdrop";
import { cn } from "@/lib/utils";

// Smaller satellite geometries for About - spread around the text/moon, well
// clear of the dense bio so they read as quiet background detail.
const ABOUT_GEOS: Geo[] = [
  { top: 18, left: 86, size: 6, type: "ticks", dur: 66, dir: 1 },
  { top: 44, left: 70, size: 4, type: "orbit", dur: 80, dir: -1 },
  { top: 70, left: 90, size: 7, type: "rings", dur: 88, dir: 1 },
  { top: 36, left: 12, size: 5, type: "rings", dur: 60, dir: -1 },
  { top: 88, left: 18, size: 4, type: "ticks", dur: 52, dir: 1 },
  { top: 58, left: 52, size: 3.5, type: "orbit", dur: 44, dir: -1 },
];

// Focus areas, shown as compact chips instead of a second prose paragraph.
const FOCUS = ["Backend", "Real-Time Systems", "AI / RAG", "Full-Stack", "Cloud"];

/* ------------------------------------------------------------------ */
/* Keyword - accent-coloured term inside a line.                       */
/* ------------------------------------------------------------------ */
function K({ children }: { children: ReactNode }) {
  return <span className="text-accent">{children}</span>;
}

/* ------------------------------------------------------------------ */
/* ReadingLine - illuminates from dim to bright as it scrolls up into  */
/* the reading zone, like a spotlight sweeping the line. Opacity + a    */
/* small rise only -> 60fps. Once read, it stays lit.                  */
/* ------------------------------------------------------------------ */
function ReadingLine({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "start 0.5"],
  });

  const opacity = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [1, 1] : [0.14, 1],
  );
  const y = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [16, 0]);

  return (
    <motion.span
      ref={ref}
      className={cn("gpu block", className)}
      style={{ opacity, y }}
    >
      {children}
    </motion.span>
  );
}

/* Fade/rise in when scrolled into view - reused for the framing UI. */
const riseIn = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-12% 0px" },
} as const;

export function About({
  sectionRef,
}: {
  /** Provided by the parent so the birds can measure About's scroll position. */
  sectionRef?: React.RefObject<HTMLElement | null>;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative min-h-screen bg-background"
    >
      {/* The hero's footage continued as a night-graded reflection across the
          top - hero -> About as one scene, fading to transparent down the page. */}
      <ReflectionVideo />

      {/* Night sky - faint stars as dusk settles into night. */}
      <StarField count={52} opacity={0.5} seed={11} />

      {/* Smaller rotating astrolabe, anchored down near the CTA buttons (not
          centred), scrolling with the content. */}
      <GeometricBackdrop
        size={42}
        glowSize={24}
        geos={ABOUT_GEOS}
        anchor={{ top: "82vh", left: "34%" }}
      />

      {/* Drifting warm embers - the living afterglow. */}
      <Embers className="z-0" />

      {/* Faint giant watermark, left-aligned to match the content. */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-x-0 top-[8vh] mx-auto max-w-[110rem] px-6 sm:px-10">
          <ScrollParallax distance={reduceMotion ? 0 : 120}>
            <span className="block select-none font-display text-[24vw] font-bold leading-none tracking-tight text-cream/[0.03]">
              ABOUT
            </span>
          </ScrollParallax>
        </div>
      </div>

      {/* Left-oriented content column (matches the hero's left alignment). */}
      <div className="relative z-10 mx-auto max-w-[110rem] px-6 pb-[22vh] pt-[32vh] sm:px-10">
        <div className="relative max-w-4xl">
          {/* ---------- Header: index + availability + divider ---------- */}
          <motion.div {...riseIn} transition={{ duration: 0.7, ease: "easeOut" }}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="h-px w-12 bg-accent/60" />
                <span className="font-sans text-xs uppercase tracking-[0.4em] text-accent">
                  01 / About
                </span>
              </div>

              {/* Availability badge */}
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#6fe0a6]/70" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#6fe0a6]" />
                </span>
                <span className="font-sans text-[0.7rem] uppercase tracking-[0.25em] text-cream/70">
                  Available for work
                </span>
              </div>
            </div>
            <div className="mt-6 h-px w-full bg-line" />
          </motion.div>

          {/* ---------- A tight statement + focus chips (not a wall of text) ---------- */}
          <div className="mt-12">
            <p className="font-display text-[clamp(1.9rem,5vw,4rem)] font-bold leading-[1.07] tracking-tight text-cream">
              <ReadingLine>
                I&apos;m a <K>Software Engineer</K>
              </ReadingLine>
              <ReadingLine>building intelligent, scalable,</ReadingLine>
              <ReadingLine>user-focused systems.</ReadingLine>
            </p>

            <p className="mt-8 max-w-2xl font-sans text-[clamp(1.05rem,2vw,1.45rem)] font-light leading-snug text-cream/75">
              <ReadingLine>I turn complex problems</ReadingLine>
              <ReadingLine>into products people actually use.</ReadingLine>
            </p>

            {/* Focus areas at a glance. */}
            <motion.div
              {...riseIn}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="mt-9 flex flex-wrap gap-2.5"
            >
              {FOCUS.map((f) => (
                <span
                  key={f}
                  className="rounded-full border border-cream/15 bg-cream/[0.04] px-4 py-1.5 font-sans text-xs uppercase tracking-[0.16em] text-cream/65"
                >
                  {f}
                </span>
              ))}
            </motion.div>
          </div>

          {/* ---------- CTA ---------- */}
          <motion.div
            {...riseIn}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mt-16 flex flex-wrap items-center gap-x-8 gap-y-4"
          >
            <PillButton href="#contact" variant="solid">
              Let&apos;s work together
            </PillButton>
            <a
              href="/Gowtham_Raju_Manda_Resume.pdf"
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 font-sans text-sm uppercase tracking-[0.2em] text-cream/70 transition-colors duration-300 hover:text-accent"
            >
              View résumé
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                &rarr;
              </span>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
