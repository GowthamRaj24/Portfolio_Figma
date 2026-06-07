"use client";

import { useEffect, useRef, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

/**
 * GeometricBackdrop - a faint, symmetric "celestial mechanism" (astrolabe):
 * concentric rings, a tick ring, spokes and orbiting nodes drawn in
 * COUNTER-ROTATING layers (inner fast -> outer slow) that turn slowly forever
 * and react to scroll (a gentle extra rotation + breathing scale), plus
 * scattered small satellite geometries.
 *
 * Pinned (sticky) to the viewport centre so it stays behind the content as the
 * section scrolls. Pure SVG + Framer transforms at very low opacity -> 60fps,
 * and never competes with the foreground. Reusable: pass `size` (vmin) and your
 * own `geos` so it can sit behind different sections at different scales.
 */

const STROKE = "rgba(236,222,194,"; // warm cream; alpha appended per use
const NODE = "rgba(255,210,150,"; // warm amber nodes

const SPOKES = [0, 45, 90, 135, 180, 225, 270, 315];

export type GeoType = "ticks" | "orbit" | "rings";
export type Geo = {
  top: number; // vh from section top
  left: number; // %
  size: number; // vmin
  type: GeoType;
  dur: number;
  dir: number;
};

export function GeometricBackdrop({
  size = 80,
  glowSize = 42,
  geos = [],
  anchor,
  variant = "astrolabe",
}: {
  /** Central mechanism diameter (vmin). */
  size?: number;
  /** Soft warm core-glow diameter (vmin). */
  glowSize?: number;
  /** Scattered satellite geometries (positions in vh / %). */
  geos?: Geo[];
  /** If set, the central mechanism is positioned HERE (CSS top/left, scrolls
   *  with the section) instead of being pinned to the viewport centre. */
  anchor?: { top: string; left: string };
  /** "astrolabe" = celestial mechanism; "solar" = a sun with orbiting planets. */
  variant?: "astrolabe" | "solar";
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // Scroll interaction: a slow extra turn + a gentle breathing scale as the
  // section passes through view (on top of the layers' continuous spin).
  const rotate = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-16, 16]);
  const scale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reduce ? [1, 1, 1] : [0.94, 1.05, 0.94],
  );

  const solar = variant === "solar";

  // The full mechanism + its glow, sized and centred on its own box.
  const core = (
    <div
      className="relative"
      style={{ width: `${size}vmin`, height: `${size}vmin` }}
    >
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          width: `${glowSize}vmin`,
          height: `${glowSize}vmin`,
          background: solar
            ? "radial-gradient(circle, rgba(255,190,120,0.16), rgba(255,150,80,0.05) 45%, transparent 72%)"
            : "radial-gradient(circle, rgba(255,200,140,0.08), transparent 70%)",
        }}
        animate={
          reduce || !solar
            ? undefined
            : { scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] }
        }
        transition={
          reduce || !solar
            ? undefined
            : { duration: 7, repeat: Infinity, ease: "easeInOut" }
        }
      />
      {solar ? (
        <SolarSystem rotate={rotate} scale={scale} reduce={!!reduce} />
      ) : (
        <Rings rotate={rotate} scale={scale} reduce={!!reduce} />
      )}
    </div>
  );

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 z-0">
      {anchor ? (
        // Anchored near a point (scrolls with the section content).
        <div className="absolute" style={{ top: anchor.top, left: anchor.left }}>
          <div className="-translate-x-1/2 -translate-y-1/2">{core}</div>
        </div>
      ) : (
        // Pinned to the viewport centre for the whole section.
        <div className="sticky top-0 flex h-screen items-center justify-center">
          {core}
        </div>
      )}

      {/* Scattered small satellite geometries (scroll with the section). */}
      {geos.map((geo, i) => (
        <SmallGeo key={i} geo={geo} reduce={!!reduce} />
      ))}
    </div>
  );
}

function Rings({
  rotate,
  scale,
  reduce,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  reduce: boolean;
}) {
  return (
    <motion.div className="absolute inset-0" style={{ rotate, scale }}>
      {/* OUTER ring: circles + tick ring + spokes + cardinal nodes. */}
      <Layer reduce={reduce} dur={175} dir={1}>
        <circle cx="50" cy="50" r="49" fill="none" stroke={`${STROKE}0.10)`} strokeWidth="0.3" />
        <circle cx="50" cy="50" r="44" fill="none" stroke={`${STROKE}0.06)`} strokeWidth="0.3" />
        <circle
          cx="50"
          cy="50"
          r="46.5"
          fill="none"
          stroke={`${STROKE}0.15)`}
          strokeWidth="0.8"
          strokeDasharray="0.5 3.1"
        />
        {SPOKES.map((a) => {
          const rad = (a * Math.PI) / 180;
          return (
            <line
              key={a}
              x1={(50 + 40 * Math.cos(rad)).toFixed(2)}
              y1={(50 + 40 * Math.sin(rad)).toFixed(2)}
              x2={(50 + 49 * Math.cos(rad)).toFixed(2)}
              y2={(50 + 49 * Math.sin(rad)).toFixed(2)}
              stroke={`${STROKE}0.10)`}
              strokeWidth="0.3"
            />
          );
        })}
        {SPOKES.map((a) => {
          const rad = (a * Math.PI) / 180;
          return (
            <circle
              key={`n${a}`}
              cx={(50 + 49 * Math.cos(rad)).toFixed(2)}
              cy={(50 + 49 * Math.sin(rad)).toFixed(2)}
              r="0.7"
              fill={`${NODE}0.45)`}
            />
          );
        })}
      </Layer>

      {/* MIDDLE ring: dashed circle + concentric ring + orbiting dots. */}
      <Layer reduce={reduce} dur={74} dir={-1}>
        <circle
          cx="50"
          cy="50"
          r="36"
          fill="none"
          stroke={`${STROKE}0.10)`}
          strokeWidth="0.4"
          strokeDasharray="2 3"
        />
        <circle cx="50" cy="50" r="30.5" fill="none" stroke={`${STROKE}0.07)`} strokeWidth="0.3" />
        <circle cx={(50 + 36 * Math.cos(0.8)).toFixed(2)} cy={(50 + 36 * Math.sin(0.8)).toFixed(2)} r="0.9" fill={`${NODE}0.55)`} />
        <circle cx={(50 + 36 * Math.cos(3.7)).toFixed(2)} cy={(50 + 36 * Math.sin(3.7)).toFixed(2)} r="0.7" fill={`${NODE}0.4)`} />
      </Layer>

      {/* INNER ring (fastest): circle + dashed ring + small ring. */}
      <Layer reduce={reduce} dur={30} dir={1}>
        <circle cx="50" cy="50" r="24" fill="none" stroke={`${STROKE}0.10)`} strokeWidth="0.3" />
        <circle cx="50" cy="50" r="18.5" fill="none" stroke={`${STROKE}0.09)`} strokeWidth="0.5" strokeDasharray="1.5 2.5" />
        <circle cx="50" cy="50" r="13" fill="none" stroke={`${STROKE}0.08)`} strokeWidth="0.3" />
      </Layer>

      {/* Static centre mark. */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
        <circle cx="50" cy="50" r="1.4" fill={`${NODE}0.6)`} />
      </svg>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Solar-system variant                                                */
/* ------------------------------------------------------------------ */

type Orbit = {
  r: number; // orbit radius (viewBox units)
  dur: number; // revolution period (s) - inner fast, outer slow
  dir: number;
  planet: number; // planet radius
  grad: "rock" | "cream" | "amber" | "cool"; // sphere shading palette
  phase: number; // starting angle (rad) so planets are spread out
  alpha: number; // overall presence (kept subtle - it's a backdrop)
  ring?: boolean; // a Saturn-style ring
  atmo?: string; // atmosphere rim colour ("r,g,b," prefix)
  moon?: boolean; // a small companion
};

// Inner planets orbit faster than outer ones (Kepler-ish + the requested
// inner-fast -> outer-slow speed gradient).
const ORBITS: Orbit[] = [
  { r: 13, dur: 30, dir: 1, planet: 1.3, grad: "rock", phase: 0.6, alpha: 0.6 },
  { r: 20, dur: 48, dir: 1, planet: 1.9, grad: "cream", phase: 2.4, alpha: 0.62, moon: true },
  { r: 27, dur: 72, dir: 1, planet: 1.5, grad: "cool", phase: 4.2, alpha: 0.6, atmo: "150,190,235," },
  { r: 37, dur: 104, dir: 1, planet: 2.7, grad: "amber", phase: 5.6, alpha: 0.66, ring: true },
  { r: 44, dur: 140, dir: 1, planet: 1.6, grad: "cream", phase: 1.3, alpha: 0.56 },
  { r: 49.5, dur: 182, dir: 1, planet: 1.2, grad: "cool", phase: 3.4, alpha: 0.52, atmo: "150,180,215," },
];

// Sphere shading stops per palette: [lit highlight, midtone, terminator/shadow].
const PLANET_GRADS: Record<Orbit["grad"], [string, string, string]> = {
  rock: ["#d7cfc4", "#8a7f74", "#1d1916"],
  cream: ["#fff1da", "#d6c09a", "#2f271d"],
  amber: ["#ffe3b4", "#dd9f56", "#341f0d"],
  cool: ["#e0ecf9", "#8fb4d8", "#172534"],
};

// Base tilt of the orbital plane (deg) - the cursor nudges it a few more, so the
// circular orbits read as a real solar system seen at an angle.
const BASE_TILT = 18;

// A scattered asteroid belt (deterministic so SSR + client match).
const BELT = (() => {
  const out: { x: number; y: number; s: number; o: number }[] = [];
  let seed = 7;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  const N = 54;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 + (rnd() - 0.5) * 0.22;
    const rr = 32 + (rnd() - 0.5) * 3.6;
    out.push({
      x: +(50 + rr * Math.cos(a)).toFixed(2),
      y: +(50 + rr * Math.sin(a)).toFixed(2),
      s: +(0.1 + rnd() * 0.34).toFixed(2),
      o: +(0.18 + rnd() * 0.5).toFixed(2),
    });
  }
  return out;
})();

function SolarDefs() {
  return (
    <defs>
      {/* Sun corona + white-hot core. */}
      <radialGradient id="ss-corona" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="rgba(255,226,168,0.85)" />
        <stop offset="38%" stopColor="rgba(255,168,82,0.3)" />
        <stop offset="100%" stopColor="rgba(255,140,60,0)" />
      </radialGradient>
      <radialGradient id="ss-sun" cx="50%" cy="44%" r="58%">
        <stop offset="0%" stopColor="#fff8ec" />
        <stop offset="32%" stopColor="#ffdd97" />
        <stop offset="68%" stopColor="#ff9e44" />
        <stop offset="100%" stopColor="#e0611c" />
      </radialGradient>
      {/* Spherical planet shading - highlight upper-left, shadow lower-right. */}
      {(Object.entries(PLANET_GRADS) as [Orbit["grad"], [string, string, string]][]).map(
        ([k, [a, b, c]]) => (
          <radialGradient key={k} id={`ss-${k}`} cx="36%" cy="30%" r="72%">
            <stop offset="0%" stopColor={a} />
            <stop offset="48%" stopColor={b} />
            <stop offset="100%" stopColor={c} />
          </radialGradient>
        ),
      )}
    </defs>
  );
}

function SolarSystem({
  rotate,
  scale,
  reduce,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  reduce: boolean;
}) {
  // Interactivity: the whole orbital plane tilts toward the cursor in 3D.
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const sx = useSpring(pointerX, { stiffness: 45, damping: 18, mass: 0.7 });
  const sy = useSpring(pointerY, { stiffness: 45, damping: 18, mass: 0.7 });
  const rotateX = useTransform(sy, [-1, 1], [BASE_TILT + 7, BASE_TILT - 7]);
  const rotateY = useTransform(sx, [-1, 1], [-9, 9]);

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      pointerX.set((e.clientX / window.innerWidth) * 2 - 1);
      pointerY.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [pointerX, pointerY, reduce]);

  return (
    <div className="absolute inset-0" style={{ perspective: "1500px" }}>
      <motion.div
        className="absolute inset-0"
        style={{ rotateX: reduce ? BASE_TILT : rotateX, rotateY: reduce ? 0 : rotateY }}
      >
        <motion.div className="absolute inset-0" style={{ rotate, scale }}>
          {/* Orbital paths + the sun (the gradient defs live here, referenced by
              the planet layers via url(#id)). */}
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 h-full w-full overflow-visible"
          >
            <SolarDefs />
            <g opacity={0.55}>
              {ORBITS.map((o) => (
                <circle
                  key={o.r}
                  cx="50"
                  cy="50"
                  r={o.r}
                  fill="none"
                  stroke="rgba(236,222,194,0.14)"
                  strokeWidth="0.18"
                />
              ))}
            </g>
            {/* Sun: glowing corona + white-hot core + thin chromosphere ring. */}
            <circle cx="50" cy="50" r="12" fill="url(#ss-corona)" />
            <circle cx="50" cy="50" r="3.4" fill="url(#ss-sun)" />
            <circle
              cx="50"
              cy="50"
              r="3.5"
              fill="none"
              stroke="rgba(255,238,205,0.45)"
              strokeWidth="0.18"
            />
          </svg>

          {/* Asteroid belt - scattered rocks drifting between the orbits. */}
          <Layer reduce={reduce} dur={200} dir={1}>
            <g opacity={0.5}>
              {BELT.map((b, i) => (
                <circle
                  key={i}
                  cx={b.x}
                  cy={b.y}
                  r={b.s}
                  fill={`rgba(214,201,180,${b.o})`}
                />
              ))}
            </g>
          </Layer>

          {/* Planets - each revolves on its orbit (inner fast -> outer slow). */}
          {ORBITS.map((o) => (
            <PlanetLayer key={o.r} orbit={o} reduce={reduce} />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

function PlanetLayer({ orbit, reduce }: { orbit: Orbit; reduce: boolean }) {
  const { r, dur, dir, planet, grad, phase, alpha, ring, atmo, moon } = orbit;
  const px = +(50 + r * Math.cos(phase)).toFixed(2);
  const py = +(50 + r * Math.sin(phase)).toFixed(2);
  return (
    <Layer reduce={reduce} dur={dur} dir={dir}>
      <g opacity={alpha}>
        {/* Soft atmosphere rim (icy/gas worlds). */}
        {atmo && (
          <circle
            cx={px}
            cy={py}
            r={+(planet * 1.5).toFixed(2)}
            fill={`rgba(${atmo}0.16)`}
          />
        )}
        {/* Ring drawn BEHIND the planet (its front arc is occluded by the body). */}
        {ring && (
          <ellipse
            cx={px}
            cy={py}
            rx={+(planet * 2.35).toFixed(2)}
            ry={+(planet * 0.84).toFixed(2)}
            fill="none"
            stroke="rgba(228,198,150,0.55)"
            strokeWidth="0.5"
            transform={`rotate(-22 ${px} ${py})`}
          />
        )}
        {/* Planet body - spherically shaded (lit side -> terminator). */}
        <circle cx={px} cy={py} r={planet} fill={`url(#ss-${grad})`} />
        {moon && (
          <circle
            cx={+(px + planet + 1.7).toFixed(2)}
            cy={+(py - planet * 0.5).toFixed(2)}
            r={+Math.max(0.5, planet * 0.32).toFixed(2)}
            fill="url(#ss-rock)"
          />
        )}
      </g>
    </Layer>
  );
}

function SmallGeo({ geo, reduce }: { geo: Geo; reduce: boolean }) {
  return (
    <motion.div
      className="absolute"
      style={{
        top: `${geo.top}vh`,
        left: `${geo.left}%`,
        width: `${geo.size}vmin`,
        height: `${geo.size}vmin`,
        willChange: "transform",
      }}
      animate={reduce ? undefined : { rotate: 360 * geo.dir }}
      transition={
        reduce
          ? undefined
          : { duration: geo.dur, ease: "linear", repeat: Infinity }
      }
    >
      <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
        <Motif type={geo.type} />
      </svg>
    </motion.div>
  );
}

function Motif({ type }: { type: GeoType }) {
  const s = (a: number) => `${STROKE}${a})`;
  const n = (a: number) => `${NODE}${a})`;

  switch (type) {
    case "ticks":
      return (
        <>
          <circle cx="50" cy="50" r="45" fill="none" stroke={s(0.18)} strokeWidth="1.3" strokeDasharray="1 4" />
          <circle cx="50" cy="50" r="30" fill="none" stroke={s(0.14)} strokeWidth="1.2" />
          <circle cx="50" cy="50" r="2.6" fill={n(0.5)} />
        </>
      );
    case "orbit":
      return (
        <>
          <circle cx="50" cy="50" r="42" fill="none" stroke={s(0.15)} strokeWidth="1.2" />
          <circle cx="92" cy="50" r="3.4" fill={n(0.55)} />
          <circle cx="50" cy="50" r="2.4" fill={n(0.45)} />
        </>
      );
    case "rings":
    default:
      return (
        <>
          <circle cx="50" cy="50" r="45" fill="none" stroke={s(0.16)} strokeWidth="1.2" />
          <circle cx="50" cy="50" r="31" fill="none" stroke={s(0.11)} strokeWidth="1.2" strokeDasharray="2 3" />
          <circle cx="50" cy="50" r="2.4" fill={n(0.45)} />
        </>
      );
  }
}

function Layer({
  reduce,
  dur,
  dir,
  children,
}: {
  reduce: boolean;
  dur: number;
  dir: number;
  children: ReactNode;
}) {
  return (
    <motion.div
      className="absolute inset-0"
      style={{ willChange: "transform" }}
      animate={reduce ? undefined : { rotate: 360 * dir }}
      transition={
        reduce
          ? undefined
          : { duration: dur, ease: "linear", repeat: Infinity }
      }
    >
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full overflow-visible"
      >
        {children}
      </svg>
    </motion.div>
  );
}
