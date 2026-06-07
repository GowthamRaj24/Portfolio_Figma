"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Embers } from "@/components/layout/embers";
import { StarField } from "@/components/layout/star-field";
import { Meteors } from "@/components/layout/meteors";
import { SpaceProp } from "@/components/layout/space-prop";
import { ScrollParallax } from "@/components/motion/scroll-parallax";
import { Galaxy } from "@/components/ui/galaxy";

/* ---------------------------------------------------------------- */
/* Data                                                              */
/* ---------------------------------------------------------------- */

type Group = { title: string; skills: string[] };

const GROUPS: Group[] = [
  {
    title: "Languages",
    skills: ["JavaScript", "TypeScript", "Python", "Java", "C", "SQL"],
  },
  {
    title: "Backend & Databases",
    skills: [
      "Node.js",
      "Express.js",
      "FastAPI",
      "REST APIs",
      "WebSockets",
      "SSE",
      "PostgreSQL",
      "MongoDB",
      "MySQL",
      "pgvector",
    ],
  },
  {
    title: "Frontend & Tools",
    skills: ["React.js", "Next.js", "Tailwind CSS", "Prisma", "Drizzle ORM"],
  },
  {
    title: "Cloud & Concepts",
    skills: [
      "AWS",
      "Azure",
      "Docker",
      "System Design",
      "Distributed Systems",
      "Microservices",
      "Real-Time Systems",
      "RAG",
    ],
  },
];

/* ---------------------------------------------------------------- */
/* Motion                                                            */
/* ---------------------------------------------------------------- */

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ---------------------------------------------------------------- */
/* Pieces                                                            */
/* ---------------------------------------------------------------- */

function SkillGroup({ group }: { group: Group }) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-12% 0px" }}
    >
      <motion.div variants={item} className="flex items-baseline gap-3">
        <span className="h-px w-6 bg-accent/60" />
        <span className="font-sans text-xs uppercase tracking-[0.3em] text-accent">
          {group.title}
        </span>
        <span className="font-sans text-[0.7rem] tracking-[0.1em] text-muted">
          {String(group.skills.length).padStart(2, "0")}
        </span>
      </motion.div>

      <motion.div variants={stagger} className="mt-4 flex flex-wrap gap-2.5">
        {group.skills.map((skill) => (
          <motion.span
            key={skill}
            variants={item}
            whileHover={{ y: -3 }}
            transition={{ type: "spring", stiffness: 320, damping: 20 }}
            className="group/pill inline-flex items-center gap-2 rounded-full border border-cream/12 bg-cream/[0.03] px-3.5 py-2 transition-colors duration-300 hover:border-accent/40 hover:bg-cream/[0.06]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent/80 shadow-[0_0_6px_rgba(217,185,140,0.6)] transition-colors duration-300 group-hover/pill:bg-accent" />
            <span className="font-sans text-sm text-cream/85 transition-colors duration-300 group-hover/pill:text-cream">
              {skill}
            </span>
          </motion.span>
        ))}
      </motion.div>
    </motion.div>
  );
}

function GalaxyVisual() {
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);

  // Subtle cursor parallax (no re-render - just a smoothed wrapper transform).
  useEffect(() => {
    if (reduce) return;
    const el = wrapRef.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      el.style.transform = `translate3d(${nx * 12}px, ${ny * 9}px, 0) rotate(${nx * 1.6}deg)`;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-[42rem] lg:max-w-none"
    >
      {/* Soft halo behind the disc. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] w-[88%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(217,185,140,0.12), rgba(150,170,230,0.05) 55%, transparent 75%)",
        }}
      />
      <div
        ref={wrapRef}
        className="relative transition-transform duration-300 ease-out [&_canvas]:h-auto [&_canvas]:w-full"
      >
        <Galaxy size={760} reduce={!!reduce} />
      </div>
    </motion.div>
  );
}

function Header() {
  return (
    <motion.header
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-12% 0px" }}
      className="max-w-2xl"
    >
      <motion.div variants={item} className="flex items-center gap-4">
        <span className="h-px w-12 bg-accent/60" />
        <span className="font-sans text-xs uppercase tracking-[0.4em] text-accent">
          03 / Skills
        </span>
      </motion.div>
      <motion.h2
        variants={item}
        className="mt-7 font-display text-[clamp(2rem,5vw,4rem)] font-bold leading-[1.04] tracking-tight text-cream"
      >
        What I build with.
      </motion.h2>
      <motion.p
        variants={item}
        className="mt-6 max-w-xl font-sans text-[clamp(1rem,1.6vw,1.2rem)] font-light leading-relaxed text-cream/80"
      >
        An evolving toolkit across backend systems, real-time platforms,
        full-stack web, and cloud — the things I reach for to take an idea from
        sketch to shipped.
      </motion.p>
    </motion.header>
  );
}

/* ---------------------------------------------------------------- */
/* Section                                                           */
/* ---------------------------------------------------------------- */

export function Skills() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="skills"
      className="relative isolate bg-background py-28 sm:py-36"
    >
      {/* Deep-night sky + embers, continuing the evening. */}
      <StarField count={70} opacity={0.6} seed={53} />
      {/* Meteor shower begins here (Skills onward). */}
      <Meteors count={3} seed={31} />
      <Embers className="z-0" />

      {/* A drifting asteroid in the lower-left background - a transparent
          cutout floating in zero-g, the SAME treatment as the astronaut:
          gentle bob/sway/tilt + scroll parallax + a soft warm glow. */}
      <SpaceProp
        src="/asteroid.png"
        alt=""
        cutout
        glow={0.1}
        className="hidden lg:block left-[-4vw] top-[72%] w-[24vw] max-w-[30rem]"
        parallax={150}
        bob={18}
        sway={14}
        tilt={5}
        floatDuration={22}
        blur={0}
        opacity={0.85}
      />

      {/* Faint giant watermark, left-aligned - same treatment as the others. */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-x-0 top-[8vh] mx-auto max-w-[110rem] px-6 sm:px-10">
          <ScrollParallax distance={reduceMotion ? 0 : 120}>
            <span className="block select-none font-display text-[20vw] font-bold leading-none tracking-tight text-cream/[0.03]">
              SKILLS
            </span>
          </ScrollParallax>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-[110rem] px-6 sm:px-10">
        <Header />

        <div className="mt-14 grid items-center gap-12 lg:mt-20 lg:grid-cols-[minmax(0,1fr)_45vw] lg:gap-10 xl:gap-14">
          {/* Left: the written skill groups. */}
          <div className="space-y-10 sm:space-y-12">
            {GROUPS.map((group) => (
              <SkillGroup key={group.title} group={group} />
            ))}
          </div>

          {/* Right: a slowly turning spiral galaxy. */}
          <div className="lg:sticky lg:top-24">
            <GalaxyVisual />
          </div>
        </div>
      </div>
    </section>
  );
}
