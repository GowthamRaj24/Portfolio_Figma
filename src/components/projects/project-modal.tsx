"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Project } from "./projects";

/* ---------------------------------------------------------------- */
/* Icons                                                             */
/* ---------------------------------------------------------------- */

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden>
      <path d="M7 17L17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Chevron({ left }: { left?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path
        d={left ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------------------------------------------------------------- */
/* Gallery - cross-fading screenshots with prev/next + thumbnails    */
/* ---------------------------------------------------------------- */

function Gallery({
  images,
  ar,
  name,
}: {
  images: string[];
  ar: number;
  name: string;
}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (images.length <= 1 || paused) return;
    const id = window.setInterval(
      () => setActive((i) => (i + 1) % images.length),
      4200,
    );
    return () => window.clearInterval(id);
  }, [images.length, paused]);

  const go = (delta: number) =>
    setActive((i) => (i + delta + images.length) % images.length);

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="group/gal relative overflow-hidden rounded-xl border border-cream/12 bg-card"
        style={{ aspectRatio: ar }}
      >
        {images.map((src, i) => (
          <motion.img
            key={src}
            src={src}
            alt={`${name} screenshot ${i + 1}`}
            loading="lazy"
            decoding="async"
            initial={false}
            animate={{ opacity: i === active ? 1 : 0 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="absolute inset-0 h-full w-full object-contain"
          />
        ))}

        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous screenshot"
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-cream/15 bg-black/40 text-cream/80 opacity-100 backdrop-blur-md transition-all duration-300 hover:border-accent/50 hover:text-accent lg:opacity-0 lg:group-hover/gal:opacity-100 [&>svg]:h-4 [&>svg]:w-4"
            >
              <Chevron left />
            </button>
            <button
              type="button"
              aria-label="Next screenshot"
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-cream/15 bg-black/40 text-cream/80 opacity-100 backdrop-blur-md transition-all duration-300 hover:border-accent/50 hover:text-accent lg:opacity-0 lg:group-hover/gal:opacity-100 [&>svg]:h-4 [&>svg]:w-4"
            >
              <Chevron />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              aria-label={`Show screenshot ${i + 1}`}
              onClick={() => setActive(i)}
              className={cn(
                "relative h-12 w-20 shrink-0 overflow-hidden rounded-md border bg-card transition-all duration-300",
                i === active
                  ? "border-accent/70 ring-1 ring-accent/40"
                  : "border-cream/12 opacity-60 hover:opacity-100",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Section heading                                                   */
/* ---------------------------------------------------------------- */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-8">
      <div className="flex items-center gap-3">
        <span className="h-px w-6 bg-accent/60" />
        <span className="font-sans text-[0.7rem] uppercase tracking-[0.28em] text-accent">
          {title}
        </span>
      </div>
      <div className="mt-3.5">{children}</div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Modal                                                             */
/* ---------------------------------------------------------------- */

export function ProjectModal({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  // ESC to close + lock background scroll while open.
  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    // Lock scroll WITHOUT a layout jump: compensate for the now-hidden
    // scrollbar's width. Also flag the body so the page's decorative
    // animations pause (see globals.css) — otherwise the blurred backdrop
    // re-composites a live 60fps scene every frame and stutters.
    const { body } = document;
    const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;
    body.style.overflow = "hidden";
    if (scrollbarW > 0) body.style.paddingRight = `${scrollbarW}px`;
    body.classList.add("modal-open");
    closeRef.current?.focus();

    return () => {
      window.removeEventListener("keydown", onKey);
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
      body.classList.remove("modal-open");
    };
  }, [project, onClose]);

  if (!mounted) return null;

  const d = project?.detail;

  return createPortal(
    <AnimatePresence>
      {project && (
        <motion.div
          className="fixed inset-0 z-[200] flex justify-center overflow-hidden sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          {/* Backdrop */}
          <div
            aria-hidden
            className="fixed inset-0 bg-[#04030a]/80 backdrop-blur-md"
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
            onClick={(e) => e.stopPropagation()}
            initial={
              reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 26 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 14 }}
            transition={{ type: "spring", stiffness: 230, damping: 28 }}
            className="relative z-10 flex h-[100dvh] w-full min-w-0 max-w-5xl flex-col overflow-hidden rounded-none border border-cream/15 sm:h-auto sm:max-h-[90dvh] sm:rounded-2xl"
            style={{
              background:
                "linear-gradient(155deg, rgba(24,19,13,0.97), rgba(10,8,6,0.985))",
              boxShadow:
                "0 50px 130px -45px rgba(0,0,0,0.92), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            {/* Warm top-edge highlight + corner glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(217,185,140,0.7), transparent)",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-x-10 -top-24 h-48 -z-0"
              style={{
                background:
                  "radial-gradient(50% 100% at 28% 100%, rgba(217,185,140,0.12), transparent 72%)",
              }}
            />

            {/* Close */}
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close project details"
              className="absolute right-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-cream/15 bg-black/30 text-cream/75 backdrop-blur-md transition-all duration-300 hover:border-accent/50 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 [&>svg]:h-5 [&>svg]:w-5"
            >
              <CloseIcon />
            </button>

            {/* Scrollable body — min-h-0 + flex-1 bound it to the panel's
                max-h so it actually scrolls (esp. on mobile where the gallery
                and details stack into one tall column). */}
            <div className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain [-webkit-overflow-scrolling:touch]">
              <div className="grid w-full min-w-0 gap-7 p-5 sm:gap-8 sm:p-8 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:p-10">
                {/* Left: gallery (sticks while the details scroll on desktop) */}
                <div className="min-w-0 self-start lg:sticky lg:top-0">
                  {project.images && project.images.length > 0 ? (
                    <Gallery
                      images={project.images}
                      ar={project.ar}
                      name={project.name}
                    />
                  ) : (
                    <div
                      className="flex items-center justify-center rounded-xl border border-cream/12 bg-gradient-to-br from-cream/[0.05] to-transparent"
                      style={{ aspectRatio: project.ar }}
                    >
                      <span className="font-display text-2xl font-semibold text-cream/70">
                        {project.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Right: details */}
                <div className="min-w-0">
                  {/* Eyebrow */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-sans text-xs uppercase tracking-[0.26em] text-cream/45">
                    <span className="text-accent">[{project.id}]</span>
                    {d?.year && (
                      <>
                        <span className="text-cream/25">/</span>
                        <span>{d.year}</span>
                      </>
                    )}
                    {d?.status && (
                      <span className="inline-flex items-center gap-1.5 text-cream/55">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#6fe0a6]/70" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#6fe0a6]" />
                        </span>
                        {d.status}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h2
                    id="project-modal-title"
                    className="mt-3 font-display text-[clamp(1.8rem,4vw,2.7rem)] font-bold leading-[1.05] tracking-tight text-cream"
                  >
                    {project.name}
                  </h2>

                  {d?.tagline && (
                    <p className="mt-3 font-sans text-[clamp(1rem,1.6vw,1.18rem)] font-light leading-relaxed text-cream/75">
                      {d.tagline}
                    </p>
                  )}

                  {/* CTAs */}
                  {d?.links && d.links.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-3">
                      {d.links.map((l) => (
                        <a
                          key={l.href}
                          href={l.href}
                          target="_blank"
                          rel="noreferrer"
                          className={cn(
                            "group/cta inline-flex items-center gap-2 rounded-full px-6 py-3 font-sans text-xs font-medium uppercase tracking-[0.18em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
                            l.kind === "secondary"
                              ? "border border-cream/25 bg-white/5 text-cream hover:border-accent hover:text-accent"
                              : "bg-cream text-[#0a0b0e] hover:bg-accent",
                            "[&>svg]:h-4 [&>svg]:w-4",
                          )}
                        >
                          {l.label}
                          <span className="transition-transform duration-300 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5 [&>svg]:h-4 [&>svg]:w-4">
                            <ExternalIcon />
                          </span>
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Metrics */}
                  {d?.metrics && d.metrics.length > 0 && (
                    <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {d.metrics.map((m) => (
                        <div
                          key={m.label}
                          className="rounded-xl border border-cream/10 bg-cream/[0.03] px-3 py-3 text-center"
                        >
                          <div className="font-display text-xl font-bold tracking-tight text-cream sm:text-2xl">
                            {m.value}
                          </div>
                          <div className="mt-1 font-sans text-[0.6rem] uppercase leading-tight tracking-[0.16em] text-cream/50">
                            {m.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Overview */}
                  {d?.overview && (
                    <Section title="Overview">
                      <p className="font-sans text-[0.97rem] font-light leading-relaxed text-cream/80">
                        {d.overview}
                      </p>
                    </Section>
                  )}

                  {/* Highlights */}
                  {d?.features && d.features.length > 0 && (
                    <Section title="Highlights">
                      <ul className="space-y-2.5">
                        {d.features.map((f) => (
                          <li
                            key={f}
                            className="flex items-start gap-3 font-sans text-[0.95rem] font-light leading-relaxed text-cream/80"
                          >
                            <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rotate-45 bg-accent shadow-[0_0_6px_rgba(217,185,140,0.7)]" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </Section>
                  )}

                  {/* Stack */}
                  {d?.stack && d.stack.length > 0 && (
                    <Section title="Built with">
                      <div className="flex flex-wrap gap-2">
                        {d.stack.map((s) => (
                          <span
                            key={s}
                            className="rounded-full border border-cream/12 bg-cream/[0.04] px-3 py-1.5 font-sans text-xs text-cream/80"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </Section>
                  )}

                  {/* Role */}
                  {d?.role && (
                    <p className="mt-7 border-t border-cream/10 pt-5 font-sans text-sm font-light italic leading-relaxed text-cream/55">
                      {d.role}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
