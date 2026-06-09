"use client";

import { useRef } from "react";
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
import { ScrollParallax } from "@/components/motion/scroll-parallax";

type Role = {
  role: string;
  company: string;
  location?: string;
  period: string;
  year: string; // big ghost watermark
  summary: string;
  tags: string[];
  current?: boolean;
};

const ROLES: Role[] = [
  {
    role: "Associate Software Engineer",
    company: "Deltek",
    location: "Bangalore, IN",
    period: "Aug 2025 — Present",
    year: "2025",
    summary:
      "Engineering complex business logic across Payrule, Workflow, Validation, Accrual and Approval systems for enterprise clients — while shipping DPL, a real-time engagement platform, and a production-grade RAG system for citation-backed document querying.",
    tags: ["React", "Node.js", "PostgreSQL", "FastAPI", "WebRTC", "RAG"],
    current: true,
  },
  {
    role: "Software Engineer Intern",
    company: "DiscoverrAI",
    location: "Bangalore, IN",
    period: "Apr 2025 — Aug 2025",
    year: "2025",
    summary:
      "Built an AI-powered recommendation system for Shopify on Azure, optimised backend APIs and inference pipelines for lower latency and higher accuracy, and shipped an admin dashboard to orchestrate and monitor the AI pipelines.",
    tags: ["Azure", "Python", "AI/ML", "REST APIs"],
  },
  {
    role: "AI & Computer Vision Intern",
    company: "Murti Labs",
    period: "2024",
    year: "2024",
    summary:
      "Built computer vision for an autonomous coconut-harvesting system fusing drones, robotics and CV — detecting tree components (trunks, branches, leaves and coconuts), adding obstacle detection for safer drone navigation, and pinpointing optimal cutting points, validated in Unity and Unreal Engine simulations.",
    tags: ["Python", "OpenCV", "Computer Vision", "Unity", "Unreal Engine"],
  },
  {
    role: "Machine Learning & AI Automation Intern",
    company: "VYZA Solutions",
    period: "2023",
    year: "2023",
    summary:
      "Developed machine-learning models for predictive analytics and business automation — owning data cleaning, preprocessing, feature engineering and model evaluation — and built automation workflows that cut manual effort and improved operational efficiency.",
    tags: ["Python", "scikit-learn", "Pandas", "NumPy", "Machine Learning"],
  },
];

// "Worked with" logo strip. Drop logo files into /public/logos and set `logo`
// (SVG preferred, or transparent PNG); until then each tile shows a monogram.
const COMPANIES: { name: string; logo?: string; zoom?: number }[] = [
  { name: "Deltek", logo: "/companies/Deltek.png" },
  { name: "DiscoverrAI", logo: "/companies/DiscoverrAI.jpg" },
  { name: "Murti Labs", logo: "/companies/MurtiLabs1.png", zoom: 1.5 },
  { name: "VYZA Solutions", logo: "/companies/VyzaSolutions.jpg", zoom: 1.7 },
];

function initials(name: string) {
  const words = name.split(/[\s·]+/).filter(Boolean);
  // Single-word brands (e.g. "Deltek") read better as the first two letters.
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// Staggered cascade for each entry's content.
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};
const child: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

function ExperienceItem({ role }: { role: Role }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  // Focus: peaks when this entry's middle sits at the viewport centre, so the
  // entry you're reading lights up while the others rest.
  const { scrollYProgress: focus } = useScroll({
    target: ref,
    offset: ["start center", "end center"],
  });
  const focusRaw = useTransform(focus, [0, 0.5, 1], [0, 1, 0]);
  const focusAmt = useSpring(focusRaw, {
    stiffness: 110,
    damping: 28,
    mass: 0.4,
  });

  const glowOpacity = useTransform(focusAmt, [0, 1], [0, reduceMotion ? 0 : 0.5]);
  const ringOpacity = useTransform(focusAmt, [0, 1], [0, reduceMotion ? 0 : 0.85]);
  const ringScale = useTransform(focusAmt, [0, 1], [0.5, 1.9]);
  const yearOpacity = useTransform(
    focusAmt,
    [0, 1],
    reduceMotion ? [0.04, 0.04] : [0.035, 0.1],
  );

  return (
    <motion.div
      ref={ref}
      variants={container}
      initial={reduceMotion ? "show" : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "-12% 0px" }}
      className="group relative pl-14 sm:pl-20"
    >
      {/* Focus glow - blooms warmly behind the entry in view. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-x-6 -inset-y-5 -z-10 rounded-[2rem] blur-2xl"
        style={{
          opacity: glowOpacity,
          background:
            "radial-gradient(55% 60% at 22% 50%, rgba(217,185,140,0.5), rgba(217,185,140,0) 72%)",
        }}
      />

      {/* Big ghost year watermark. */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute right-0 -top-7 -z-10 select-none font-display text-[clamp(3.5rem,9vw,8rem)] font-bold leading-none tracking-tighter text-cream"
        style={{ opacity: yearOpacity }}
      >
        {role.year}
      </motion.span>

      {/* Node on the thread - reveals with the entry; a ring blooms on focus. */}
      <motion.span
        variants={child}
        className="absolute left-0 top-[8px] inline-flex h-3.5 w-3.5"
      >
        <motion.span
          aria-hidden
          className="absolute -inset-2 rounded-full"
          style={{
            opacity: ringOpacity,
            scale: ringScale,
            background:
              "radial-gradient(circle, rgba(217,185,140,0.55), rgba(217,185,140,0) 70%)",
          }}
        />
        {role.current && (
          <span className="absolute inset-0 animate-ping rounded-full bg-accent/50" />
        )}
        <span
          className="absolute inset-[3px] rounded-full bg-accent"
          style={{ boxShadow: "0 0 10px 2px rgba(217,185,140,0.6)" }}
        />
      </motion.span>

      <motion.span
        variants={child}
        className="block font-sans text-xs uppercase tracking-[0.3em] text-accent"
      >
        {role.period}
      </motion.span>

      <motion.h3
        variants={child}
        className="mt-2 font-display text-[clamp(1.4rem,2.8vw,2.1rem)] font-bold tracking-tight text-cream transition-colors duration-300 group-hover:text-accent"
      >
        {role.role}
      </motion.h3>

      <motion.p
        variants={child}
        className="mt-1.5 font-sans text-sm uppercase tracking-[0.16em] text-cream/60"
      >
        {role.company}
        {role.location ? ` · ${role.location}` : ""}
      </motion.p>

      <motion.p
        variants={child}
        className="mt-4 max-w-2xl font-sans text-[clamp(1rem,1.6vw,1.2rem)] font-light leading-relaxed text-cream/85"
      >
        {role.summary}
      </motion.p>

      <motion.div variants={child} className="mt-5 flex flex-wrap gap-2">
        {role.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-cream/15 bg-cream/[0.04] px-3 py-1 font-sans text-[0.7rem] uppercase tracking-[0.16em] text-cream/65 transition-colors duration-300 group-hover:border-cream/25"
          >
            {tag}
          </span>
        ))}
      </motion.div>
    </motion.div>
  );
}

function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="max-w-3xl"
    >
      <div className="flex items-center gap-4">
        <span className="h-px w-12 bg-accent/60" />
        <span className="font-sans text-xs uppercase tracking-[0.4em] text-accent">
          04 / Experience
        </span>
      </div>
      <h2 className="mt-7 font-display text-[clamp(2rem,5vw,4rem)] font-bold leading-[1.04] tracking-tight text-cream">
        The road so far.
      </h2>
    </motion.header>
  );
}

function LogoStrip() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-12% 0px" }}
      className="mt-12 sm:mt-14"
    >
      <motion.span
        variants={child}
        className="block font-sans text-[0.7rem] uppercase tracking-[0.35em] text-cream/45"
      >
        Worked with
      </motion.span>

      <motion.div variants={container} className="mt-5 flex flex-wrap gap-3 sm:gap-4">
        {COMPANIES.map((c) => (
          <motion.div
            key={c.name}
            variants={child}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            title={c.name}
            className={`group flex h-16 w-28 items-center justify-center overflow-hidden rounded-xl border transition-colors duration-300 sm:w-32 ${
              c.logo
                ? "border-white/10 bg-white px-3 shadow-[0_8px_24px_-14px_rgba(0,0,0,0.75)] hover:border-accent/50"
                : "border-cream/10 bg-cream/[0.04] px-4 hover:border-cream/25 hover:bg-cream/[0.07]"
            }`}
          >
            {c.logo ? (
              <div className="flex h-full w-full items-center justify-center transition-transform duration-300 group-hover:scale-[1.06]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.logo}
                  alt={c.name}
                  style={c.zoom ? { transform: `scale(${c.zoom})` } : undefined}
                  className="max-h-12 max-w-full object-contain"
                />
              </div>
            ) : (
              <span className="font-display text-lg font-bold tracking-wide text-cream/45 transition-colors duration-300 group-hover:text-cream/75">
                {initials(c.name)}
              </span>
            )}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

export function Experience() {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  // The glowing thread "draws" itself downward as you scroll the timeline.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.82", "end 0.6"],
  });
  const fill = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 26,
    mass: 0.4,
  });
  const headTop = useTransform(fill, [0, 1], ["0%", "100%"]);

  return (
    <section
      id="experience"
      className="relative isolate bg-background py-28 sm:py-36"
    >
      {/* Deep-night sky + embers, continuing the evening. */}
      <StarField count={80} opacity={0.7} seed={41} />
      <Meteors count={3} seed={43} />
      <Embers className="z-0" />

      {/* A lone astronaut drifting in the open right-hand space beside the
          timeline - a transparent cutout, rendered crisp with a soft warm glow,
          slowly turning in zero-g. */}
      <SpaceProp
        src="/astronaut.png"
        alt=""
        cutout
        glow={0.14}
        className="hidden lg:block right-[0vw] top-[20%] w-[clamp(260px,23vw,440px)]"
        parallax={150}
        bob={22}
        sway={12}
        tilt={5}
        floatDuration={22}
        blur={0}
        opacity={0.92}
      />

      {/* A ringed gas giant looming in the lower-left. The source's black frame
          is baked out to true transparency (luminance -> alpha), so the lit
          planet and rings float at full fidelity - no blend wash, and no black
          box even where it overflows the section. Mirrored so the rings sweep up
          into view, a serene, slow-drifting counterweight to the astronaut. */}
      <SpaceProp
        src="/saturn-cut.webp"
        alt=""
        cutout
        glow={0.08}
        flip
        growOnScroll={[0.94, 1.12]}
        className="hidden lg:block left-[-8vw] bottom-[-36%] w-[clamp(340px,36vw,640px)]"
        parallax={100}
        bob={14}
        sway={10}
        tilt={3}
        floatDuration={26}
        blur={0}
        opacity={0.95}
      />

      {/* Faint giant watermark, left-aligned - same treatment as About/Projects
          (sized down so the longer word fits without clipping). */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-x-0 top-[8vh] mx-auto max-w-[110rem] px-6 sm:px-10">
          <ScrollParallax distance={reduceMotion ? 0 : 120}>
            <span className="block select-none font-display text-[13vw] font-bold leading-none tracking-tight text-cream/[0.03]">
              EXPERIENCE
            </span>
          </ScrollParallax>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-[110rem] px-6 sm:px-10">
        <Header />

        {/* "Worked with" - company logos at a glance, above the detailed timeline. */}
        <LogoStrip />

        <div ref={ref} className="relative mt-16 max-w-4xl sm:mt-20">
          {/* Thread: faint base rail + a warm glow that fills with scroll. */}
          <div className="absolute left-[7px] top-1 bottom-1 w-px bg-cream/12" />
          <motion.div
            aria-hidden
            className="absolute left-[7px] top-1 bottom-1 w-px origin-top"
            style={{
              scaleY: reduceMotion ? 1 : fill,
              background:
                "linear-gradient(to bottom, rgba(217,185,140,0.85), rgba(217,185,140,0.25))",
              boxShadow: "0 0 8px 1px rgba(217,185,140,0.45)",
            }}
          />
          {/* The glowing head of the thread, travelling down as it draws. */}
          {!reduceMotion && (
            <motion.span
              aria-hidden
              className="absolute left-[7px] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
              style={{
                top: headTop,
                boxShadow: "0 0 10px 3px rgba(217,185,140,0.7)",
              }}
            />
          )}

          <div className="space-y-20 sm:space-y-28">
            {ROLES.map((role) => (
              <ExperienceItem key={`${role.role}-${role.period}`} role={role} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
