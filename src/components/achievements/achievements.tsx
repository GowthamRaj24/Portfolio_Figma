"use client";

import { useEffect, useRef, useState } from "react";
import {
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

function GhostNumber({ a, align }: { a: Achievement; align: "left" | "right" }) {
  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-20% 0px" }}
      transition={{ duration: 1 }}
      className={cn("select-none", align === "left" ? "text-left" : "text-right")}
    >
      <span
        className="font-display text-[7rem] font-bold leading-none tracking-tighter lg:text-[10rem]"
        style={{ color: `rgba(${a.glow}0.07)` }}
      >
        {a.id}
      </span>
    </motion.div>
  );
}

/* ---------------------------------------------------------------- */
/* Row                                                               */
/* ---------------------------------------------------------------- */

function AchievementRow({
  a,
  index,
  reduce,
}: {
  a: Achievement;
  index: number;
  reduce: boolean;
}) {
  // Even rows: card on the LEFT; odd rows: card on the RIGHT.
  const cardLeft = index % 2 === 0;
  return (
    <div
      className={cn(
        "relative flex flex-col items-center gap-7 sm:flex-row sm:gap-12",
        !cardLeft && "sm:flex-row-reverse",
      )}
    >
      {/* Card (one flex side). */}
      <div className="w-full sm:flex-1">
        <Card a={a} align={cardLeft ? "right" : "left"} />
      </div>

      {/* Emblem on the spine (centre). First on mobile for impact. */}
      <div className="order-first sm:order-none">
        <Emblem a={a} reduce={reduce} />
      </div>

      {/* Ghost rank number on the opposite side (desktop only). */}
      <div className="hidden sm:flex sm:flex-1 sm:items-center">
        <div className={cn("w-full", cardLeft ? "sm:text-left" : "sm:text-right")}>
          <GhostNumber a={a} align={cardLeft ? "left" : "right"} />
        </div>
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
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
