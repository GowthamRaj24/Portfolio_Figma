"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { Embers } from "@/components/layout/embers";
import { StarField } from "@/components/layout/star-field";
import { ScrollParallax } from "@/components/motion/scroll-parallax";
import { cn } from "@/lib/utils";
import { ProjectModal } from "./project-modal";

export type ProjectMetric = { value: string; label: string };

export type ProjectLink = {
  label: string;
  href: string;
  kind?: "primary" | "secondary";
};

/** Rich content rendered inside the project pop-up. All optional sections only
 *  render when present, so a card can ship with as much or as little as it has. */
export type ProjectDetail = {
  tagline: string;
  year: string;
  status?: string; // e.g. "Live"
  overview: string;
  role?: string;
  features: string[];
  stack: string[];
  metrics?: ProjectMetric[];
  links?: ProjectLink[];
};

export type Project = {
  id: string;
  name: string;
  date: string;
  href: string;
  /** Optional screenshots in /public; they auto-cycle one by one inside the
   *  card. Falls back to a styled placeholder when omitted. */
  images?: string[];
  /** Placeholder gradient when no image is supplied. */
  tone: string;
  /** Desktop scatter placement (non-uniform descending, landscape cards). */
  left: string;
  top: number; // vh
  width: string;
  ar: number; // frame aspect ratio (w/h) - matched to the screenshots
  /** Deep-dive content for the pop-up. */
  detail?: ProjectDetail;
};

// A tall descending scatter of LANDSCAPE framed cards (matched to the ~1.9:1
// screenshots): P1 left / P2 right-lower (2 columns), then P3 left / P4 centre /
// P5 right (3 columns) further down. Deliberately non-uniform, never a grid.
const PROJECTS: Project[] = [
  {
    id: "01",
    name: "My Copy Prompt",
    date: "11.2024",
    href: "https://mycopyprompt.in",
    images: ["/project1/01.png", "/project1/02.png", "/project1/03.png"],
    tone: "from-[#0b1020] to-[#05070d]",
    left: "3%",
    top: 6,
    width: "45%",
    ar: 1.96,
    detail: {
      tagline: "The fastest way to find AI prompts — search, copy, paste.",
      year: "2024",
      status: "Live",
      overview:
        "A free, curated library of copy-paste-ready prompts for ChatGPT, Claude, Midjourney, Flux, Gemini and every major AI tool. Every prompt is human-reviewed, tagged and tested before it ships, so anyone can search by keyword or model, copy in a single click, and get straight to work. The community can submit their own prompts through a lightweight review pipeline, or generate brand-new ones with AI.",
      role: "Solo end-to-end build — product, design, frontend, backend and deployment.",
      features: [
        "Instant search across 300+ prompts with category and AI-model filters, plus a text-vs-image toggle.",
        "One-click copy with live copy-count tracking and four ranking views: trending, most-viewed, newest and top-rated.",
        "Community submissions via a four-field form feeding a human review queue, with email-on-approval.",
        "Built-in AI generator to compose and refine brand-new prompts on the fly.",
        "SEO-first architecture: server-rendered per-model and per-category landing pages for organic discovery.",
        "Email authentication for saving favourites and managing submissions.",
      ],
      stack: [
        "Next.js",
        "TypeScript",
        "Tailwind CSS",
        "PostgreSQL",
        "Prisma",
        "Vercel",
      ],
      metrics: [
        { value: "312", label: "Curated prompts" },
        { value: "12", label: "Categories" },
        { value: "8+", label: "AI models" },
        { value: "24h", label: "Review SLA" },
      ],
      links: [
        { label: "Visit site", href: "https://mycopyprompt.in", kind: "primary" },
      ],
    },
  },
  {
    id: "02",
    name: "G-Buddy",
    date: "09.2024",
    href: "https://g-buddy.vercel.app/",
    images: ["/project2/01.png", "/project2/02.png", "/project2/03.png"],
    tone: "from-[#0a1f1c] to-[#04100e]",
    left: "52%",
    top: 30,
    width: "44%",
    ar: 1.89,
    detail: {
      tagline:
        "A one-stop platform for students to learn, share, buy, sell, and grow together.",
      year: "2024",
      status: "Live",
      overview:
        "G-Buddy is a MERN-stack student community platform that brings academic resources, commerce and career tools into one ecosystem. Students can share and access notes, PDFs and assignments, buy and sell books and lab essentials through a built-in marketplace with cart and order management, build professional resumes for placements, and get help from an AI chatbot — streamlining exam prep and collaboration in a single place.",
      role: "Full-stack MERN build spanning resource sharing, a two-sided marketplace, a resume builder and an AI assistant.",
      features: [
        "Resource sharing — upload and access peer-contributed PDFs, notes and assignments for exam prep.",
        "Student marketplace to buy and sell books, calculators and lab equipment, with cart and order management.",
        "AI chatbot that surfaces resources, answers common questions and smooths navigation.",
        "Resume builder with clean, easy-to-use templates for internships and placements.",
        "Centralized academic hub that improves collaboration and keeps every student service in one place.",
      ],
      stack: ["React.js", "Node.js", "Express.js", "MongoDB"],
      metrics: [
        { value: "MERN", label: "Full-stack" },
        { value: "5", label: "Core modules" },
        { value: "AI", label: "Chatbot" },
        { value: "1-Stop", label: "Student hub" },
      ],
      links: [
        { label: "Visit site", href: "https://g-buddy.vercel.app/", kind: "primary" },
      ],
    },
  },
  {
    id: "03",
    name: "BlogX",
    date: "06.2024",
    href: "https://blogx1.netlify.app/",
    images: ["/project3/01.png"],
    tone: "from-[#171428] to-[#0a0814]",
    left: "3%",
    top: 86,
    width: "31%",
    ar: 1.9,
    detail: {
      tagline:
        "Express your ideas — a fast, secure, edge-deployed blogging platform.",
      year: "2024",
      status: "Live",
      overview:
        "BlogX is a scalable blogging platform where writing meets the edge. It pairs JWT-based authentication with a backend built to handle large datasets, a rich writing experience, and edge deployment on Cloudflare Workers for low-latency, globally distributed request handling. Pagination and lazy loading keep rendering smooth even under concurrent usage.",
      role: "Full-stack build — secure JWT auth, a scalable Prisma/PostgreSQL data layer and an edge-deployed Cloudflare Workers backend.",
      features: [
        "Secure blogging platform with JWT authentication that keeps accounts safe.",
        "Scalable backend built to handle large datasets reliably.",
        "Rich text editor with cloud storage — content stays secure and accessible anywhere.",
        "Performance tuned with pagination and lazy loading for smooth rendering under concurrent usage.",
        "Backend deployed on Cloudflare Workers for low-latency, edge-based, scalable request handling.",
      ],
      stack: ["React.js", "PostgreSQL", "Prisma", "Cloudflare Workers", "JWT"],
      metrics: [
        { value: "Edge", label: "Deployed" },
        { value: "JWT", label: "Secure auth" },
        { value: "Prisma", label: "+ PostgreSQL" },
        { value: "Lazy", label: "+ pagination" },
      ],
      links: [
        { label: "Visit site", href: "https://blogx1.netlify.app/", kind: "primary" },
      ],
    },
  },
  {
    id: "04",
    name: "Human Pose Estimation",
    date: "03.2024",
    href: "#",
    images: ["/project4/unnamed.png"],
    tone: "from-[#1a1206] to-[#0c0803]",
    left: "35.5%",
    top: 104,
    width: "31%",
    ar: 1.9,
    detail: {
      tagline:
        "Pose-driven activity recognition for surveillance — reading human actions from skeletons, not raw pixels.",
      year: "2024",
      status: "Research",
      overview:
        "A pose-estimation and activity-recognition system for distributed and remote surveillance that analyses human movement from video by extracting skeletal landmarks instead of raw RGB frames. Working on body geometry rather than pixels makes it robust to lighting changes, background noise and environmental variation. Each frame is processed to detect landmarks, compute biomechanical features, and assemble structured datasets that feed temporal models for recognising actions in real time.",
      role: "Built the MediaPipe landmark-extraction and feature-engineering pipeline, the frame-by-frame dataset generator, and an upload-and-analyse UI.",
      features: [
        "Extracts full-body skeletal landmarks per frame with MediaPipe Pose — a skeleton-first approach that stays robust to lighting, background and environment changes.",
        "Engineers biomechanical features: left/right elbow, shoulder, knee and hip angles, body height, movement speed and pose coordinates.",
        "Frame-by-frame pipeline that processes video and exports structured, model-ready datasets to CSV.",
        "Recognises activities — walking, running, standing, sitting, jumping and more — from temporal sequences of pose features.",
        "Explored Random Forest, XGBoost and sequence models (LSTM / GRU), since activity depends on movement over time rather than a single frame.",
        "Upload-and-analyse UI to inspect pose metrics on any uploaded video.",
      ],
      stack: [
        "Python",
        "MediaPipe",
        "OpenCV",
        "NumPy",
        "Pandas",
        "TensorFlow / Keras",
        "scikit-learn",
      ],
      metrics: [
        { value: "92.5%", label: "Accuracy" },
        { value: "33", label: "Pose landmarks" },
        { value: "11", label: "Features" },
        { value: "6+", label: "Activities" },
      ],
    },
  },
  {
    id: "05",
    name: "This Portfolio",
    date: "06.2026",
    href: "#",
    images: ["/project5/01.png", "/project5/image.png"],
    tone: "from-[#101620] to-[#070b10]",
    left: "67.5%",
    top: 122,
    width: "31%",
    ar: 1.9,
    detail: {
      tagline:
        "The site you're on — a cinematic, scroll-driven portfolio set in deep space.",
      year: "2026",
      status: "Live",
      overview:
        "The portfolio you're looking at right now. It frames my work as a cinematic journey — from a sunset drive into deep space — using scroll-driven storytelling rather than static pages. A 4K hero film hands off to parallax space props, a flocking-birds 3D scene, procedural starfields, a meteor shower, drifting embers and spiral galaxies rendered on canvas/WebGL, all graded with film grain and a vignette so every section reads as one continuous film. It's engineered for 60fps with GPU-promoted layers, reduced-motion fallbacks and lazy-loaded effects.",
      role: "Designed and built end-to-end — concept, motion design, 3D/WebGL effects and front-end engineering.",
      features: [
        "Scroll-driven narrative with Framer Motion — parallax, scrubbed reveals and section-by-section choreography.",
        "Real-time 3D via React Three Fiber & drei: a flocking-birds scene, plus a procedural moon and spiral galaxies.",
        "Hand-built canvas/WebGL atmosphere — seeded starfields, a meteor shower and drifting embers across every section.",
        "One graded world: film grain, vignette and a single warm palette tie the hero and dark sections together as one film.",
        "Interactive project pop-ups (like this one), an animated icon cloud and seamless section transitions.",
        "Performance- and accessibility-first: 60fps GPU layers, prefers-reduced-motion fallbacks, lazy effects and light/dark themes.",
      ],
      stack: [
        "Next.js",
        "React",
        "TypeScript",
        "Tailwind CSS",
        "Framer Motion",
        "Three.js",
        "React Three Fiber",
      ],
      metrics: [
        { value: "60fps", label: "Motion" },
        { value: "7", label: "Sections" },
        { value: "3D", label: "WebGL scenes" },
      ],
    },
  },
];

/**
 * The card's image area: when a project supplies multiple screenshots they are
 * stacked and CROSS-FADED one by one on a timer (a quiet auto-gallery), with a
 * small progress indicator. The frame is sized to the image aspect ratio and the
 * images use object-contain, so the COMPLETE screenshot is always shown.
 */
function CardImage({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = window.setInterval(
      () => setActive((i) => (i + 1) % images.length),
      3000,
    );
    return () => window.clearInterval(id);
  }, [images.length]);

  return (
    <>
      {images.map((src, i) => (
        <motion.img
          key={src}
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          initial={false}
          animate={{ opacity: i === active ? 1 : 0 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
          className="absolute inset-0 h-full w-full object-contain"
        />
      ))}

      {images.length > 1 && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {images.map((src, i) => (
            <span
              key={src}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                i === active ? "w-5 bg-cream/85" : "w-1.5 bg-cream/35",
              )}
            />
          ))}
        </div>
      )}
    </>
  );
}

function Placeholder({ tone, name }: { tone: string; name: string }) {
  return (
    <div className={cn("flex h-full w-full flex-col bg-gradient-to-br", tone)}>
      <div className="flex items-center gap-2 border-b border-cream/5 px-4 py-3">
        <span className="h-2 w-2 rounded-full bg-cream/20" />
        <span className="h-2 w-2 rounded-full bg-cream/15" />
        <span className="h-2 w-2 rounded-full bg-cream/10" />
        <span className="ml-3 h-3 w-2/5 rounded-full bg-cream/[0.06]" />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6">
        <span className="text-center font-display text-lg font-semibold text-cream/85 sm:text-2xl">
          {name}
        </span>
        <span className="h-px w-12 bg-accent/50" />
      </div>
    </div>
  );
}

/**
 * A big framed gallery card with a premium, scroll-DRIVEN reveal: as it rises
 * from the lower part of the screen it slides up, fades in, scales up and tilts
 * forward in 3D until it settles flat - then its warm glow lights on. The image
 * also drifts inside its frame (parallax-in-mask). Cards reveal in order as you
 * scroll because they sit at descending positions.
 */
function CardVisual({
  project,
  onOpen,
  imageStyle,
  imageClassName,
  wrapperClassName,
  wrapperStyle,
}: {
  project: Project;
  onOpen: (p: Project) => void;
  imageStyle?: CSSProperties;
  imageClassName?: string;
  wrapperClassName?: string;
  wrapperStyle?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  // Cursor-driven 3D tilt + a warm glare that tracks the pointer, so each card
  // feels like a framed artifact you can pick up and angle toward the firelight.
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 150, damping: 17, mass: 0.3 });
  const sry = useSpring(ry, { stiffness: 150, damping: 17, mass: 0.3 });

  const handleMove = (e: MouseEvent<HTMLButtonElement>) => {
    // Glare position (relative to the framed image), set as CSS vars - no render.
    const frame = frameRef.current;
    if (frame) {
      const fr = frame.getBoundingClientRect();
      frame.style.setProperty("--mx", `${((e.clientX - fr.left) / fr.width) * 100}%`);
      frame.style.setProperty("--my", `${((e.clientY - fr.top) / fr.height) * 100}%`);
    }
    if (reduceMotion) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * 10);
    rx.set((0.5 - py) * 7);
  };

  const handleLeave = () => {
    setHovered(false);
    rx.set(0);
    ry.set(0);
  };

  // Reveal scrub. Triggered a bit higher up (you scroll into the section first),
  // and kept SHORTER than the vertical gap between cards (~18vh) so each card
  // fully finishes its TWO-phase animation before the next one begins.
  const { scrollYProgress: enter } = useScroll({
    target: ref,
    offset: ["start 0.72", "start 0.55"],
  });
  // Phase 1 - a LONG, gradual fade UP into place: the rise/fade/scale/tilt now
  // spans most of the zone so the card comes in slowly (kept within the same
  // zone width, so the one-by-one sequencing is preserved).
  const opacity = useTransform(enter, [0, 0.8], reduceMotion ? [1, 1] : [0, 1]);
  const y = useTransform(enter, [0, 0.8], reduceMotion ? [0, 0] : [120, 0]);
  const scale = useTransform(enter, [0, 0.8], reduceMotion ? [1, 1] : [0.9, 1]);
  const rotateX = useTransform(
    enter,
    [0, 0.8],
    reduceMotion ? [0, 0] : [10, 0],
  );
  // Phase 2 - the glow blooms in behind the card over the back of the zone,
  // overlapping the tail of the fade, before the next card begins.
  const glow = useTransform(
    enter,
    [0.55, 1],
    reduceMotion ? [0.55, 0.55] : [0, 1],
  );
  const glowScale = useTransform(
    enter,
    [0.55, 1],
    reduceMotion ? [1, 1] : [0.45, 1.3],
  );

  return (
    <motion.div
      ref={ref}
      className={wrapperClassName}
      style={{
        ...wrapperStyle,
        opacity,
        y,
        scale,
        rotateX,
        transformPerspective: 1300,
        transformOrigin: "center bottom",
      }}
    >
      {/* Phase 2: background glow blooms in (scale + fade) once the card has
          settled - a distinct second beat before the next card reveals. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-10 -z-10 rounded-[3rem] blur-3xl"
        style={{
          opacity: glow,
          scale: glowScale,
          background:
            "radial-gradient(60% 60% at 50% 45%, rgba(236,208,160,0.6), rgba(220,188,140,0.16) 48%, rgba(217,185,140,0) 76%)",
        }}
      />

      {/* Hover: a brighter, larger glow blooms in on top of the scroll glow. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-12 -z-10 rounded-[3.5rem] blur-3xl"
        animate={{
          opacity: hovered ? 1 : 0,
          scale: hovered ? 1.12 : 0.92,
        }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          background:
            "radial-gradient(60% 60% at 50% 45%, rgba(245,217,172,0.85), rgba(226,192,142,0.3) 50%, rgba(226,192,142,0) 78%)",
        }}
      />

      <motion.button
        type="button"
        onClick={() => onOpen(project)}
        aria-label={`View details for ${project.name}`}
        className="group block w-full cursor-pointer text-left focus:outline-none focus-visible:outline-none"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleLeave}
        onMouseMove={handleMove}
        whileHover={reduceMotion ? undefined : { scale: 1.03 }}
        style={{ rotateX: srx, rotateY: sry, transformPerspective: 1000 }}
        transition={{ type: "spring", stiffness: 240, damping: 24 }}
      >
        {/* The card reads as a glass "observation viewport": a warm-lit bezel, a
            screen-inset screenshot, HUD corner brackets, a console readout, and a
            caption bar - one cohesive designed unit (not a bare framed image). */}
        <div
          className="relative overflow-hidden rounded-2xl border border-cream/12 p-2.5 transition-colors duration-500 group-hover:border-accent/40"
          style={{
            background:
              "linear-gradient(155deg, rgba(255,255,255,0.055), rgba(255,255,255,0.012) 62%)",
            boxShadow:
              "0 34px 64px -44px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          {/* Warm top-edge highlight - the site's signature accent line. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(217,185,140,0.7), transparent)",
            }}
          />

          {/* HUD corner brackets in the bezel - ignite in the accent on hover. */}
          <span className="pointer-events-none absolute left-2 top-2 z-20 h-3.5 w-3.5 border-l border-t border-accent/0 transition-colors duration-500 group-hover:border-accent/70" />
          <span className="pointer-events-none absolute right-2 top-2 z-20 h-3.5 w-3.5 border-r border-t border-accent/0 transition-colors duration-500 group-hover:border-accent/70" />
          <span className="pointer-events-none absolute bottom-2 left-2 z-20 h-3.5 w-3.5 border-b border-l border-accent/0 transition-colors duration-500 group-hover:border-accent/70" />
          <span className="pointer-events-none absolute bottom-2 right-2 z-20 h-3.5 w-3.5 border-b border-r border-accent/0 transition-colors duration-500 group-hover:border-accent/70" />

          {/* Screen-inset screenshot viewport. */}
          <div
            ref={frameRef}
            className={cn(
              "relative overflow-hidden rounded-xl bg-card shadow-[inset_0_0_0_1px_rgba(236,231,221,0.10)]",
              imageClassName,
            )}
            style={imageStyle}
          >
            {project.images && project.images.length > 0 ? (
              <CardImage images={project.images} alt={project.name} />
            ) : (
              <Placeholder tone={project.tone} name={project.name} />
            )}

            {/* Glass-screen sheen across the top. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/[0.06] to-transparent"
            />

            {/* Warm specular glare that tracks the cursor (the firelight). */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(220px circle at var(--mx, 50%) var(--my, 50%), rgba(255,236,205,0.22), rgba(255,236,205,0) 60%)",
                mixBlendMode: "screen",
              }}
            />

            {/* Console readout: index + live status. */}
            <div className="absolute left-3 top-3 z-10 inline-flex items-center gap-2 rounded-full border border-cream/15 bg-black/35 px-2.5 py-1 backdrop-blur-md">
              <span className="font-sans text-[0.62rem] tracking-[0.22em] text-cream/75">
                {project.id}
              </span>
              {project.detail?.status === "Live" && (
                <span className="inline-flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#6fe0a6]/70" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#6fe0a6]" />
                  </span>
                  <span className="font-sans text-[0.55rem] uppercase tracking-[0.2em] text-[#9ff0c4]">
                    Live
                  </span>
                </span>
              )}
            </div>

            {/* Hover overlay: a peek at the stack + an explore affordance. */}
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/15 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <div className="m-4 flex translate-y-2 flex-col gap-2.5 transition-transform duration-500 group-hover:translate-y-0">
                {project.detail?.stack && project.detail.stack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {project.detail.stack.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="rounded-full border border-cream/20 bg-black/30 px-2.5 py-1 font-sans text-[0.62rem] uppercase tracking-[0.14em] text-cream/85 backdrop-blur-sm"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                <span className="inline-flex items-center gap-2 font-sans text-xs uppercase tracking-[0.2em] text-cream">
                  Explore project
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    &rarr;
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Caption bar: NAME (animated underline) ........ // DATE */}
          <div className="mt-3 flex items-baseline justify-between gap-4 px-1.5 pb-0.5">
            <span className="relative font-sans text-sm uppercase tracking-[0.2em] text-cream transition-colors duration-300 group-hover:text-accent sm:text-[0.95rem]">
              {project.name}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-accent transition-all duration-500 group-hover:w-full" />
            </span>
            <span className="shrink-0 font-sans text-xs tracking-[0.1em] text-muted">
              {`// ${project.date}`}
            </span>
          </div>
        </div>
      </motion.button>
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
          02 / Selected Work
        </span>
      </div>
      <h2 className="mt-7 font-display text-[clamp(2rem,5vw,4rem)] font-bold leading-[1.04] tracking-tight text-cream">
        Things I&apos;ve built.
      </h2>
    </motion.header>
  );
}

/**
 * A cinematic moon pinned to the viewport (sticky), spanning the full height and
 * drifting slowly from the FAR RIGHT to the left across the section as you scroll
 * while the project cards pass in front of it. Flipped horizontally; its
 * background is a transparent luminance cutout, so only the lit face shows.
 */
function MoonBackdrop({ reduce }: { reduce: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // Drift in slowly from the FAR RIGHT and keep gliding the whole way - the slide
  // is spread across the entire scroll (no mid-section stop), so it moves at a
  // gentle, continuous pace from start to finish.
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? ["56vw", "56vw"] : ["66vw", "54vw"],
  );
  const scale = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? [1, 1] : [1.05, 1.13],
  );

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 z-0">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[108vh] w-[108vh] -translate-x-1/2 -translate-y-1/2">
          <motion.div className="relative h-full w-full" style={{ x, scale }}>
            {/* Cool moonlight halo, riding along with the moon. */}
            <div
              className="absolute inset-[4%] rounded-full blur-[100px]"
              style={{
                background:
                  "radial-gradient(circle, rgba(190,205,235,0.13), rgba(170,160,205,0.05) 45%, transparent 70%)",
              }}
            />
            {/* Flipped moon with a transparent background (luminance cutout) -
                only the lit face shows; the dark sky + shadow are gone. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/moon-cut.webp"
              alt=""
              loading="lazy"
              decoding="async"
              draggable={false}
              className="relative block h-full w-full -scale-x-100 object-contain"
              style={{ opacity: 0.9, willChange: "transform" }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export function Projects() {
  const reduceMotion = useReducedMotion();
  const [selected, setSelected] = useState<Project | null>(null);
  // Landscape cards: rendered height ~= (width / aspect-ratio). Estimate each
  // card's height in vh on a ~16:9 desktop (container width ~= 1.78 x viewport
  // height) to size the scroll runway beneath the lowest card.
  const containerVh =
    Math.max(
      ...PROJECTS.map((p) => p.top + ((parseFloat(p.width) / 100) * 178) / p.ar),
    ) + 30;

  return (
    <section
      id="projects"
      className="relative isolate bg-background pb-28 pt-10 sm:pb-36 sm:pt-16"
    >
      {/* Deeper night sky - denser stars than About. */}
      <StarField count={110} opacity={0.85} seed={29} />

      {/* A cinematic moon looming on the right, pinned to the viewport and
          spanning the full height as the cards scroll past in front of it. */}
      <MoonBackdrop reduce={!!reduceMotion} />
      <Embers className="z-0" />

      {/* Faint giant watermark, left-aligned - same treatment as About. */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-x-0 top-[8vh] mx-auto max-w-[110rem] px-6 sm:px-10">
          <ScrollParallax distance={reduceMotion ? 0 : 120}>
            <span className="block select-none font-display text-[16vw] font-bold leading-none tracking-tight text-cream/[0.03]">
              PROJECTS
            </span>
          </ScrollParallax>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-[110rem] px-6 sm:px-10">
        <Header />

        {/* Desktop: tall (~200vh) non-uniform descending scatter. A long top
            runway so the first reveal only kicks in AFTER you've scrolled enough
            that the "Things I've built." header has risen to the upper screen. */}
        <div
          className="relative mt-[40vh] hidden lg:block"
          style={{ height: `${containerVh}vh` }}
        >
          {PROJECTS.map((project) => (
            <CardVisual
              key={project.id}
              project={project}
              onOpen={setSelected}
              wrapperClassName="absolute"
              wrapperStyle={{
                left: project.left,
                top: `${project.top}vh`,
                width: project.width,
              }}
              imageStyle={{ aspectRatio: project.ar }}
            />
          ))}
        </div>

        {/* Mobile / tablet: clean stacked column (same reveal). */}
        <div className="mt-12 space-y-16 lg:hidden">
          {PROJECTS.map((project) => (
            <CardVisual
              key={project.id}
              project={project}
              onOpen={setSelected}
              imageStyle={{ aspectRatio: project.ar }}
            />
          ))}
        </div>
      </div>

      {/* Project deep-dive pop-up (portaled to <body>, above all layers). */}
      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
