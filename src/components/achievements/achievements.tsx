"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import { Embers } from "@/components/layout/embers";
import { StarField } from "@/components/layout/star-field";
import { Meteors } from "@/components/layout/meteors";
import { SpaceProp } from "@/components/layout/space-prop";
import { Galaxy } from "@/components/ui/galaxy";
import { ScrollParallax } from "@/components/motion/scroll-parallax";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------- */
/* Data                                                              */
/* ---------------------------------------------------------------- */

type Achievement = {
  id: string;
  badge: string; // emblem centre, e.g. "1ST"
  rank: string; // "1st place · 120+ teams"
  title: string;
  subtitle: string;
  points: string[];
  accent: string; // hex
  glow: string; // "r,g,b," prefix for rgba()
  core: [string, string]; // emblem core gradient [lit, shadow]
  image?: string; // proof photograph shown in the mission-log viewport
  caption?: string; // short line printed under the photo
  credentials?: { issuer: string; name: string }[]; // shown instead of a photo
  scorecard?: {
    exam: string;
    paper: string;
    air: string;
    stats: { label: string; value: string; sub?: string }[];
  };
};

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "01",
    badge: "1ST",
    rank: "1st place · 120+ teams",
    title: "Internal SIH 2023",
    subtitle: "Crowd monitoring & crime prevention",
    points: [
      "1st place among 120+ teams in the internal Smart India Hackathon 2023.",
      "Crowd-monitoring system that reads behaviour from live CCTV feeds to pre-empt incidents.",
      "Computer-vision detection driving an automated crime-prevention alert pipeline.",
    ],
    accent: "#f5c451",
    glow: "245,196,81,",
    core: ["#ffe6a6", "#7a5418"],
    image: "/Awards/InternalSIH.jpg",
    caption: "Team Bloomers · ₹10,000 winning cheque",
  },
  {
    id: "02",
    badge: "2ND",
    rank: "2nd place · 50+ teams",
    title: "HackFest 2024 — 48 Hours",
    subtitle: "Real-time parking management with CV",
    points: [
      "2nd place among 50+ teams for a real-time, ML-integrated build.",
      "Surveillance web app reading live camera feeds with computer vision.",
      "Detects empty parking slots and guides the car to the nearest free one.",
    ],
    accent: "#bcd0ea",
    glow: "188,208,234,",
    core: ["#e7f0fb", "#3f536f"],
    image: "/Awards/Hackfest.jpg",
    caption: "On stage · 48-hour build, certified runners-up",
  },
  {
    id: "03",
    badge: "AIR",
    rank: "All-India Rank < 5,000",
    title: "GATE 2024 Qualified",
    subtitle: "Data Science & Artificial Intelligence",
    points: [
      "Secured an All-India Rank under 5,000 in GATE 2024 (Data Science & AI).",
      "Qualified across machine learning, data analysis and AI fundamentals.",
      "Proven ability to apply theory to real-world data-science problems.",
    ],
    accent: "#6fd8c6",
    glow: "111,216,198,",
    core: ["#c9f5ec", "#246b60"],
    scorecard: {
      exam: "GATE 2024",
      paper: "Data Science & AI (DA)",
      air: "4559",
      stats: [
        { label: "GATE Score", value: "404", sub: "/ 1000" },
        { label: "Marks", value: "41", sub: "/ 100" },
      ],
    },
  },
  {
    id: "04",
    badge: "★",
    rank: "3 Certifications",
    title: "Specializations & Certifications",
    subtitle: "Stanford · AWS · GeeksforGeeks",
    points: [
      "Machine Learning Specialization — Stanford Online (DeepLearning.AI).",
      "AWS Machine Learning Foundations.",
      "GeeksforGeeks Advanced DSA Certification.",
    ],
    accent: "#b9a3f0",
    glow: "185,163,240,",
    core: ["#e9e1fb", "#463a78"],
    credentials: [
      { issuer: "Stanford Online · DeepLearning.AI", name: "Machine Learning Specialization" },
      { issuer: "Amazon Web Services", name: "ML Foundations" },
      { issuer: "GeeksforGeeks", name: "Advanced DSA" },
    ],
  },
];

/* ---------------------------------------------------------------- */
/* Emblem - a celestial medallion (the "space object" per award).    */
/* ---------------------------------------------------------------- */

function Emblem({ a, reduce }: { a: Achievement; reduce: boolean }) {
  const inView = { once: true, margin: "-18% 0px" } as const;
  return (
    <div className="relative h-36 w-36 shrink-0 sm:h-44 sm:w-44">
      {/* Outer glow. */}
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-full blur-2xl"
        style={{
          background: `radial-gradient(circle, rgba(${a.glow}0.55), rgba(${a.glow}0) 70%)`,
        }}
        initial={{ opacity: 0, scale: 0.6 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={inView}
        transition={{ duration: 0.9, ease: "easeOut" }}
      />

      {/* Ignition shockwave - a ring that expands once as it arrives. */}
      {!reduce && (
        <motion.div
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{ border: `1px solid rgba(${a.glow}0.6)` }}
          initial={{ opacity: 0, scale: 0.4 }}
          whileInView={{ opacity: [0, 0.7, 0], scale: [0.4, 1.7, 2.2] }}
          viewport={inView}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.1 }}
        />
      )}

      {/* Tilted Saturn ring (behind the core). Kept STATIC: animating a Framer
          transform here would clobber the inline translate/scaleY and the ring
          would render as a big off-centre circle. */}
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[126%] w-[126%] rounded-full"
        style={{
          border: `1.5px solid rgba(${a.glow}0.5)`,
          transform: "translate(-50%,-50%) rotate(-20deg) scaleY(0.34)",
        }}
      />
      {/* A second, tighter ring for a touch more depth. */}
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[108%] w-[108%] rounded-full"
        style={{
          border: `1px solid rgba(${a.glow}0.28)`,
          transform: "translate(-50%,-50%) rotate(-20deg) scaleY(0.34)",
        }}
      />

      {/* Core disc - a shaded little planet carrying the rank. */}
      <motion.div
        className="absolute inset-[19%] flex items-center justify-center rounded-full"
        style={{
          background: `radial-gradient(circle at 34% 28%, ${a.core[0]}, ${a.core[1]})`,
          boxShadow: `inset 0 -6px 16px rgba(0,0,0,0.45), inset 0 4px 10px rgba(255,255,255,0.25), 0 0 34px rgba(${a.glow}0.5)`,
        }}
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={inView}
        transition={{ type: "spring", stiffness: 170, damping: 15, delay: 0.18 }}
      >
        <span
          className="font-display text-xl font-bold tracking-tight sm:text-2xl"
          style={{ color: "#171008", textShadow: "0 1px 1px rgba(255,255,255,0.3)" }}
        >
          {a.badge}
        </span>
      </motion.div>

      {/* Orbiting spark on its own ring (in front). */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        animate={reduce ? undefined : { rotate: 360 }}
        transition={
          reduce
            ? undefined
            : { duration: 16, ease: "linear", repeat: Infinity }
        }
        style={{ willChange: "transform" }}
      >
        <span
          className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full"
          style={{
            background: a.accent,
            boxShadow: `0 0 10px 2px rgba(${a.glow}0.9)`,
          }}
        />
      </motion.div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Card - the written detail, alternating sides.                     */
/* ---------------------------------------------------------------- */

const cardWrap: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.12 } },
};
const cardItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

// HUD-style corner brackets in the rank colour (brighten on hover).
function CardCorners({ glow }: { glow: string }) {
  const base =
    "pointer-events-none absolute h-3.5 w-3.5 opacity-40 transition-opacity duration-500 group-hover/card:opacity-100";
  const c = `rgba(${glow}0.65)`;
  return (
    <>
      <span className={cn(base, "left-2.5 top-2.5 border-l border-t")} style={{ borderColor: c }} />
      <span className={cn(base, "right-2.5 top-2.5 border-r border-t")} style={{ borderColor: c }} />
      <span className={cn(base, "bottom-2.5 left-2.5 border-b border-l")} style={{ borderColor: c }} />
      <span className={cn(base, "bottom-2.5 right-2.5 border-b border-r")} style={{ borderColor: c }} />
    </>
  );
}

function Card({
  a,
  align,
}: {
  a: Achievement;
  align: "left" | "right";
}) {
  const right = align === "right";
  return (
    <motion.div
      variants={cardWrap}
      initial="hidden"
      whileInView="show"
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      viewport={{ once: true, margin: "-15% 0px" }}
      onMouseMove={(e) => {
        // Cursor-follow spotlight (no re-render - just CSS vars).
        const el = e.currentTarget;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
      className={cn(
        "group/card relative overflow-hidden rounded-2xl border border-cream/12 p-6 backdrop-blur-md transition-colors duration-500 hover:border-cream/30 sm:p-7",
        right ? "sm:text-right" : "sm:text-left",
      )}
      style={{
        background:
          "linear-gradient(155deg, rgba(255,255,255,0.06), rgba(255,255,255,0.012) 62%)",
        boxShadow:
          "0 30px 60px -42px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {/* Always-on faint accent aura in the near corner. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(80% 60% at ${right ? "90%" : "10%"} -6%, rgba(${a.glow}0.12), transparent 58%)`,
        }}
      />
      {/* Cursor-follow spotlight (hover). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
        style={{
          background: `radial-gradient(240px circle at var(--mx, 50%) var(--my, 50%), rgba(${a.glow}0.16), transparent 68%)`,
        }}
      />
      {/* Accent top-edge highlight. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, rgba(${a.glow}0.75), transparent)`,
        }}
      />
      {/* Diagonal sheen sweep on hover. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-[120%] opacity-0 transition-all duration-[900ms] ease-out group-hover/card:translate-x-[120%] group-hover/card:opacity-100"
        style={{
          background:
            "linear-gradient(110deg, transparent 38%, rgba(255,255,255,0.07) 50%, transparent 62%)",
        }}
      />
      <CardCorners glow={a.glow} />

      {/* Content sits above the decoration layers. */}
      <div className="relative z-10">
        <motion.div
          variants={cardItem}
          className={cn("flex", right && "sm:justify-end")}
        >
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1",
              right && "flex-row-reverse",
            )}
            style={{
              borderColor: `rgba(${a.glow}0.4)`,
              background: `rgba(${a.glow}0.08)`,
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: a.accent, boxShadow: `0 0 8px rgba(${a.glow}0.9)` }}
            />
            <span
              className="font-sans text-[0.7rem] font-medium uppercase tracking-[0.22em]"
              style={{ color: a.accent }}
            >
              {a.rank}
            </span>
          </span>
        </motion.div>

        <motion.h3
          variants={cardItem}
          className="mt-4 font-display text-[clamp(1.4rem,2.5vw,2rem)] font-bold leading-tight tracking-tight text-cream"
        >
          {a.title}
        </motion.h3>
        <motion.p
          variants={cardItem}
          className="mt-1.5 font-sans text-sm uppercase tracking-[0.16em] text-cream/55"
        >
          {a.subtitle}
        </motion.p>

        {/* Accent divider. */}
        <motion.div
          variants={cardItem}
          className="mt-5 h-px w-full"
          style={{
            background: `linear-gradient(${right ? "270deg" : "90deg"}, rgba(${a.glow}0.55), rgba(${a.glow}0) 82%)`,
          }}
        />

        <motion.ul variants={cardWrap} className="mt-5 space-y-3">
          {a.points.map((p) => (
            <motion.li
              key={p}
              variants={cardItem}
              className={cn(
                "flex items-start gap-3 font-sans text-[0.95rem] font-light leading-relaxed text-cream/80",
                right && "sm:flex-row-reverse",
              )}
            >
              <span
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45"
                style={{
                  background: a.accent,
                  boxShadow: `0 0 6px rgba(${a.glow}0.7)`,
                }}
              />
              <span>{p}</span>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </motion.div>
  );
}

// HUD corner brackets that frame the photo (brighten on hover).
function PhotoCorners({ glow }: { glow: string }) {
  const base =
    "pointer-events-none absolute z-20 h-4 w-4 opacity-55 transition-opacity duration-500 group-hover/photo:opacity-100";
  const c = `rgba(${glow}0.85)`;
  return (
    <>
      <span className={cn(base, "left-2 top-2 rounded-tl-md border-l-2 border-t-2")} style={{ borderColor: c }} />
      <span className={cn(base, "right-2 top-2 rounded-tr-md border-r-2 border-t-2")} style={{ borderColor: c }} />
      <span className={cn(base, "bottom-2 left-2 rounded-bl-md border-b-2 border-l-2")} style={{ borderColor: c }} />
      <span className={cn(base, "bottom-2 right-2 rounded-br-md border-b-2 border-r-2")} style={{ borderColor: c }} />
    </>
  );
}

/* The proof photograph, framed like a recovered mission-log dispatch. */
function PhotoViewport({
  a,
  align,
  reduce,
  onOpen,
}: {
  a: Achievement;
  align: "left" | "right";
  reduce: boolean;
  onOpen: (src: string, alt: string) => void;
}) {
  const right = align === "right";
  const c = (o: number) => `rgba(${a.glow}${o})`;
  if (!a.image) return null;

  return (
    <div className="relative mx-auto w-full max-w-[30rem]">
      {/* Ghost rank id peeking behind the frame for editorial depth. */}
      <motion.span
        aria-hidden
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-20% 0px" }}
        transition={{ duration: 1 }}
        className={cn(
          "pointer-events-none absolute -top-12 z-0 select-none font-display text-[7rem] font-bold leading-none tracking-tighter sm:text-[9rem]",
          right ? "-right-2" : "-left-2",
        )}
        style={{ color: c(0.08) }}
      >
        {a.id}
      </motion.span>

      <motion.button
        type="button"
        onClick={() => onOpen(a.image as string, a.title)}
        aria-label={`View ${a.title} — open full image`}
        initial={{ opacity: 0, y: 30, rotate: reduce ? 0 : right ? 1.4 : -1.4 }}
        whileInView={{ opacity: 1, y: 0, rotate: 0 }}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        whileHover={reduce ? undefined : { y: -8, scale: 1.015 }}
        className="group/photo relative z-10 block w-full cursor-pointer overflow-hidden rounded-2xl border p-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-cream/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        style={{
          borderColor: c(0.38),
          boxShadow: `0 38px 72px -42px rgba(0,0,0,0.92), inset 0 1px 0 rgba(255,255,255,0.07), 0 0 46px -18px ${c(0.55)}`,
        }}
      >
        <div className="relative aspect-[3/2] w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={a.image}
            alt={a.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover object-center transition-transform duration-[1200ms] ease-out group-hover/photo:scale-[1.06]"
            style={{ filter: "saturate(1.05) contrast(1.04)" }}
          />

          {/* Warm-into-cold tint so the photo sits inside the palette. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 mix-blend-soft-light"
            style={{
              background: `linear-gradient(180deg, ${c(0.18)}, transparent 32%, rgba(7,10,18,0.22))`,
            }}
          />
          {/* Vignette. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ boxShadow: "inset 0 0 90px rgba(0,0,0,0.55)" }}
          />
          {/* Transmission scanlines. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(255,255,255,0.6) 0 1px, transparent 1px 3px)",
            }}
          />

          {/* Top transmission bar. */}
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-3.5 py-3">
            <span className="flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 backdrop-blur-sm">
              <motion.span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: a.accent, boxShadow: `0 0 8px ${c(0.95)}` }}
                animate={reduce ? undefined : { opacity: [1, 0.3, 1] }}
                transition={reduce ? undefined : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="font-sans text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-cream/85">
                Log {a.id}
              </span>
            </span>
            <span className="rounded-full bg-black/40 px-2.5 py-1 font-sans text-[0.6rem] uppercase tracking-[0.2em] text-cream/70 backdrop-blur-sm">
              Verified
            </span>
          </div>

          {/* Bottom caption plate. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent px-4 pb-3.5 pt-12">
            <div className="flex items-end justify-between gap-3">
              <span className="font-sans text-[0.82rem] font-medium leading-snug text-cream">
                {a.caption}
              </span>
              <span className="flex shrink-0 items-center gap-1 font-sans text-[0.62rem] uppercase tracking-[0.18em] text-cream/75 transition-colors group-hover/photo:text-cream">
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
                View
              </span>
            </div>
          </div>

          {/* Hover sheen sweep. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-[120%] opacity-0 transition-all duration-[1100ms] ease-out group-hover/photo:translate-x-[120%] group-hover/photo:opacity-100"
            style={{
              background:
                "linear-gradient(110deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)",
            }}
          />
        </div>

        <PhotoCorners glow={a.glow} />
      </motion.button>
    </div>
  );
}

/* Certifications have no single photo — present them as a stacked credential
   ledger that mirrors the weight of a photo on the opposite side. */
function CredentialStack({ a, reduce }: { a: Achievement; reduce: boolean }) {
  const c = (o: number) => `rgba(${a.glow}${o})`;
  const certs = a.credentials ?? [];
  return (
    <div className="relative mx-auto w-full max-w-[30rem]">
      <motion.span
        aria-hidden
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-20% 0px" }}
        transition={{ duration: 1 }}
        className="pointer-events-none absolute -top-12 -left-2 z-0 select-none font-display text-[7rem] font-bold leading-none tracking-tighter sm:text-[9rem]"
        style={{ color: c(0.08) }}
      >
        {a.id}
      </motion.span>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-15% 0px" }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } }}
        className="relative z-10 space-y-3.5"
      >
        {certs.map((cert) => (
          <motion.div
            key={cert.issuer}
            variants={{
              hidden: { opacity: 0, x: 26, rotate: reduce ? 0 : -1.4 },
              show: { opacity: 1, x: 0, rotate: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
            }}
            whileHover={reduce ? undefined : { x: 7 }}
            className="group/cert relative flex items-center gap-4 overflow-hidden rounded-2xl border p-4 backdrop-blur-md"
            style={{
              borderColor: c(0.28),
              background:
                "linear-gradient(150deg, rgba(255,255,255,0.06), rgba(255,255,255,0.012) 70%)",
              boxShadow: "0 22px 46px -34px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 w-0.5"
              style={{ background: c(0.6) }}
            />
            {/* Wax-seal medallion. */}
            <div
              className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full"
              style={{
                background: `radial-gradient(circle at 34% 28%, ${a.core[0]}, ${a.core[1]})`,
                boxShadow: `inset 0 -4px 10px rgba(0,0,0,0.4), inset 0 3px 7px rgba(255,255,255,0.25), 0 0 18px ${c(0.45)}`,
              }}
            >
              <span className="font-display text-base font-bold" style={{ color: "#1a1330" }}>
                ★
              </span>
            </div>
            <div className="min-w-0">
              <p
                className="truncate font-sans text-[0.68rem] uppercase tracking-[0.18em]"
                style={{ color: a.accent }}
              >
                {cert.issuer}
              </p>
              <p className="mt-0.5 font-display text-base font-semibold leading-tight text-cream">
                {cert.name}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

/* A designed result panel for GATE — the proof as data, no scorecard PII. */
function ScoreCard({
  a,
  align,
  reduce,
}: {
  a: Achievement;
  align: "left" | "right";
  reduce: boolean;
}) {
  const right = align === "right";
  const c = (o: number) => `rgba(${a.glow}${o})`;
  const sc = a.scorecard;
  if (!sc) return null;

  return (
    <div className="relative mx-auto w-full max-w-[30rem]">
      <motion.span
        aria-hidden
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-20% 0px" }}
        transition={{ duration: 1 }}
        className={cn(
          "pointer-events-none absolute -top-12 z-0 select-none font-display text-[7rem] font-bold leading-none tracking-tighter sm:text-[9rem]",
          right ? "-right-2" : "-left-2",
        )}
        style={{ color: c(0.08) }}
      >
        {a.id}
      </motion.span>

      <motion.div
        initial={{ opacity: 0, y: 30, rotate: reduce ? 0 : right ? 1.4 : -1.4 }}
        whileInView={{ opacity: 1, y: 0, rotate: 0 }}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        whileHover={reduce ? undefined : { y: -8 }}
        className="group/photo relative z-10 overflow-hidden rounded-2xl border p-5 sm:p-6"
        style={{
          borderColor: c(0.38),
          background:
            "linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.012) 70%)",
          boxShadow: `0 38px 72px -42px rgba(0,0,0,0.92), inset 0 1px 0 rgba(255,255,255,0.07), 0 0 46px -18px ${c(0.55)}`,
        }}
      >
        {/* Faint blueprint grid. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(${c(1)} 1px, transparent 1px), linear-gradient(90deg, ${c(1)} 1px, transparent 1px)`,
            backgroundSize: "22px 22px",
          }}
        />
        {/* Accent top edge. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${c(0.75)}, transparent)` }}
        />

        {/* Header. */}
        <div className="relative flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <motion.span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: a.accent, boxShadow: `0 0 8px ${c(0.95)}` }}
              animate={reduce ? undefined : { opacity: [1, 0.3, 1] }}
              transition={reduce ? undefined : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="font-sans text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-cream/85">
              {sc.exam} · Scorecard
            </span>
          </span>
          <span
            className="rounded-full border px-2.5 py-0.5 font-sans text-[0.56rem] font-semibold uppercase tracking-[0.2em]"
            style={{ borderColor: c(0.45), color: a.accent, background: c(0.08) }}
          >
            Qualified
          </span>
        </div>

        {/* Hero metric: All India Rank. */}
        <div className="relative mt-5">
          <p className="font-sans text-[0.6rem] uppercase tracking-[0.22em] text-cream/55">
            All India Rank
          </p>
          <p className="mt-0.5 flex items-baseline gap-2">
            <span className="font-display text-[clamp(2.6rem,7vw,3.6rem)] font-bold leading-none text-cream">
              {sc.air}
            </span>
            <span
              className="font-display text-lg font-semibold"
              style={{ color: a.accent }}
            >
              AIR
            </span>
          </p>
        </div>

        {/* Stat tiles. */}
        <div className="relative mt-5 grid grid-cols-2 gap-3">
          {sc.stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-cream/10 bg-black/20 px-3.5 py-3"
            >
              <p className="font-sans text-[0.56rem] uppercase tracking-[0.16em] text-cream/50">
                {s.label}
              </p>
              <p className="mt-1 font-display text-xl font-bold text-cream">
                {s.value}
                {s.sub && (
                  <span className="ml-1 font-sans text-xs font-normal text-cream/45">
                    {s.sub}
                  </span>
                )}
              </p>
            </div>
          ))}
        </div>

        {/* Paper footer. */}
        <div className="relative mt-4 flex items-center gap-2 border-t border-cream/10 pt-3">
          <span className="font-sans text-[0.6rem] uppercase tracking-[0.18em] text-cream/45">
            Paper
          </span>
          <span className="font-sans text-sm text-cream/80">{sc.paper}</span>
        </div>

        <PhotoCorners glow={a.glow} />
      </motion.div>
    </div>
  );
}

/* Full-screen lightbox so the proof images (esp. the scorecard) are readable. */
function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={alt}
    >
      <div className="absolute inset-0 bg-[#05060c]/85 backdrop-blur-md" />
      <motion.div
        className="relative z-10"
        initial={{ scale: 0.92, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="max-h-[86vh] max-w-[92vw] rounded-xl border border-cream/15 object-contain shadow-[0_40px_120px_-30px_rgba(0,0,0,0.92)]"
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute -right-3 -top-3 grid h-9 w-9 place-items-center rounded-full border border-cream/25 bg-[#0b0e16] text-lg text-cream/80 transition hover:scale-105 hover:text-cream"
        >
          ✕
        </button>
        <p className="mt-3 text-center font-sans text-sm text-cream/70">{alt}</p>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

/* ---------------------------------------------------------------- */
/* Row                                                               */
/* ---------------------------------------------------------------- */

function AchievementRow({
  a,
  index,
  reduce,
  onOpenImage,
}: {
  a: Achievement;
  index: number;
  reduce: boolean;
  onOpenImage: (src: string, alt: string) => void;
}) {
  // Even rows: card on the LEFT; odd rows: card on the RIGHT.
  // Mobile stack order (via order-*): emblem → visual → card.
  const cardLeft = index % 2 === 0;
  return (
    <div
      className={cn(
        "relative flex flex-col items-center gap-8 sm:flex-row sm:gap-12",
        !cardLeft && "sm:flex-row-reverse",
      )}
    >
      {/* Card (one flex side). */}
      <div className="order-3 w-full sm:order-none sm:flex-1">
        <Card a={a} align={cardLeft ? "right" : "left"} />
      </div>

      {/* Emblem on the spine (centre). First on mobile for impact. */}
      <div className="order-1 sm:order-none">
        <Emblem a={a} reduce={reduce} />
      </div>

      {/* Proof visual on the opposite side: photograph or credential ledger. */}
      <div className="order-2 w-full sm:order-none sm:flex sm:flex-1 sm:items-center">
        {a.image ? (
          <PhotoViewport
            a={a}
            align={cardLeft ? "right" : "left"}
            reduce={reduce}
            onOpen={onOpenImage}
          />
        ) : a.scorecard ? (
          <ScoreCard a={a} align={cardLeft ? "right" : "left"} reduce={reduce} />
        ) : (
          <CredentialStack a={a} reduce={reduce} />
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Mini galaxies - faint distant galaxies for the deep-space backdrop */
/* ---------------------------------------------------------------- */

const MINIS = [
  { top: "14%", left: "6%", size: 230, tilt: 64, spin: 0.0006, opacity: 0.5 },
  { top: "42%", left: "76%", size: 280, tilt: 50, spin: -0.0005, opacity: 0.42 },
  { top: "80%", left: "12%", size: 210, tilt: 58, spin: 0.00055, opacity: 0.42 },
];

function MiniGalaxies() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  // Only run the canvases while the section is on/near screen.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), {
      rootMargin: "35% 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {active &&
        MINIS.map((m, i) => (
          <div
            key={i}
            className="absolute [&_canvas]:h-auto [&_canvas]:w-full"
            style={{
              top: m.top,
              left: m.left,
              width: m.size,
              opacity: m.opacity,
            }}
          >
            <Galaxy
              size={m.size}
              mini
              tilt={m.tilt}
              spin={m.spin}
              reduce={!!reduce}
            />
          </div>
        ))}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Section                                                           */
/* ---------------------------------------------------------------- */

function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="mx-auto max-w-3xl text-center"
    >
      <div className="flex items-center justify-center gap-4">
        <span className="h-px w-12 bg-accent/60" />
        <span className="font-sans text-xs uppercase tracking-[0.4em] text-accent">
          05 / Achievements
        </span>
        <span className="h-px w-12 bg-accent/60" />
      </div>
      <h2 className="mt-7 font-display text-[clamp(2rem,5vw,4rem)] font-bold leading-[1.04] tracking-tight text-cream">
        Milestones in orbit.
      </h2>
      <p className="mx-auto mt-6 max-w-xl font-sans text-[clamp(1rem,1.6vw,1.2rem)] font-light leading-relaxed text-cream/80">
        A few moments where the work broke through — ranked, recognised, and
        earned.
      </p>
    </motion.header>
  );
}

export function Achievements() {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  // The flight path "draws" itself down the constellation as you scroll.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.65"],
  });
  const fill = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 26,
    mass: 0.4,
  });
  const headTop = useTransform(fill, [0, 1], ["0%", "100%"]);

  return (
    <section
      id="achievements"
      // No own background: the page-level `bg-background` (on <main>) shows
      // through, so the Saturn overflowing from the Experience section above
      // continues seamlessly across the seam instead of being clipped here.
      className="relative py-28 sm:py-36"
    >
      {/* Deep space: faint nebula clouds, a dense star sky, a meteor shower and
          the warm embers - layered so it reads as real space, not just dust. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <div
          className="absolute left-[10%] top-[14%] h-[44vmin] w-[44vmin] rounded-full blur-[80px]"
          style={{
            background:
              "radial-gradient(circle, rgba(120,150,225,0.1), transparent 70%)",
          }}
        />
        <div
          className="absolute right-[6%] bottom-[12%] h-[50vmin] w-[50vmin] rounded-full blur-[90px]"
          style={{
            background:
              "radial-gradient(circle, rgba(160,110,205,0.09), transparent 70%)",
          }}
        />
      </div>

      {/* A field of faint distant mini galaxies. */}
      <MiniGalaxies />

      <StarField count={120} opacity={0.85} seed={71} />
      <Meteors count={3} seed={23} />
      <Embers className="z-0" />

      {/* A drifting asteroid in the upper-right - same cutout + zero-g float as
          the one in Skills, but mirrored horizontally AND vertically so it reads
          as a different rock catching the light from the other side. */}
      <SpaceProp
        src="/asteroid.png"
        alt=""
        cutout
        glow={0.1}
        flip
        flipY
        className="hidden lg:block right-[-4vw] top-[6%] w-[20vw] max-w-[26rem]"
        parallax={150}
        bob={18}
        sway={14}
        tilt={5}
        floatDuration={22}
        blur={0}
        opacity={0.85}
      />

      {/* Faint giant watermark. */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-x-0 top-[8vh] mx-auto max-w-[110rem] px-6 sm:px-10">
          <ScrollParallax distance={reduceMotion ? 0 : 120}>
            <span className="block select-none text-center font-display text-[12vw] font-bold leading-none tracking-tight text-cream/[0.03]">
              AWARDS
            </span>
          </ScrollParallax>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-[100rem] px-6 sm:px-10">
        <Header />

        <div ref={ref} className="relative mt-20 sm:mt-28">
          {/* Flight path: faint base rail + a glowing fill that draws with scroll. */}
          <div className="absolute left-1/2 top-0 bottom-0 hidden w-px -translate-x-1/2 bg-cream/10 sm:block" />
          <motion.div
            aria-hidden
            className="absolute left-1/2 top-0 bottom-0 hidden w-px -translate-x-1/2 origin-top sm:block"
            style={{
              scaleY: reduceMotion ? 1 : fill,
              background:
                "linear-gradient(to bottom, rgba(245,210,150,0.85), rgba(150,200,230,0.4))",
              boxShadow: "0 0 9px 1px rgba(240,205,150,0.4)",
            }}
          />
          {/* Comet head travelling down the path as it draws. */}
          {!reduceMotion && (
            <motion.span
              aria-hidden
              className="absolute left-1/2 z-10 hidden h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cream sm:block"
              style={{
                top: headTop,
                boxShadow: "0 0 14px 4px rgba(245,220,180,0.75)",
              }}
            />
          )}

          <div className="space-y-20 sm:space-y-28">
            {ACHIEVEMENTS.map((a, i) => (
              <AchievementRow
                key={a.id}
                a={a}
                index={i}
                reduce={!!reduceMotion}
                onOpenImage={(src, alt) => setLightbox({ src, alt })}
              />
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {lightbox && (
          <Lightbox
            src={lightbox.src}
            alt={lightbox.alt}
            onClose={() => setLightbox(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
