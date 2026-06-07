"use client";

import { useEffect, useRef } from "react";

// Star palette: warm white/gold in the core, cool blue/violet/pink in the arms.
const COLORS = [
  "255,244,224",
  "255,206,138",
  "150,186,246",
  "196,164,236",
  "242,176,206",
];

/** A soft radial-glow sprite (drawn additively for the nebular shimmer). */
function glowSprite(rgb: string, s: number, inner = 0.25): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  grad.addColorStop(0, `rgba(${rgb},1)`);
  grad.addColorStop(inner, `rgba(${rgb},0.5)`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, s, s);
  return c;
}

/** A small irregular, shaded grey rock sprite (lit from the upper-left). */
function rockSprite(): HTMLCanvasElement {
  const s = 64;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const g = c.getContext("2d")!;
  const cx = s / 2;
  const cy = s / 2;
  const R = s * 0.4;
  const n = 8 + Math.floor(Math.random() * 4);
  g.beginPath();
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rad = R * (0.66 + Math.random() * 0.36);
    const x = cx + Math.cos(a) * rad;
    const y = cy + Math.sin(a) * rad;
    if (i === 0) g.moveTo(x, y);
    else g.lineTo(x, y);
  }
  g.closePath();
  const grad = g.createRadialGradient(
    cx - R * 0.35,
    cy - R * 0.35,
    R * 0.1,
    cx,
    cy,
    R * 1.15,
  );
  grad.addColorStop(0, "#bdb6ab");
  grad.addColorStop(0.5, "#7b746b");
  grad.addColorStop(1, "#322f2a");
  g.fillStyle = grad;
  g.fill();
  g.strokeStyle = "rgba(18,16,14,0.55)";
  g.lineWidth = 1.2;
  g.stroke();
  // A few darker craters.
  for (let i = 0; i < 3; i++) {
    g.beginPath();
    g.arc(
      cx + (Math.random() - 0.5) * R,
      cy + (Math.random() - 0.5) * R,
      R * (0.07 + Math.random() * 0.1),
      0,
      Math.PI * 2,
    );
    g.fillStyle = "rgba(38,34,30,0.5)";
    g.fill();
  }
  return c;
}

type Star = { x: number; y: number; r: number; a: number; c: number; ph: number };

/**
 * A canvas spiral galaxy: thousands of stars scattered along logarithmic arms
 * with a bright warm core, projected to a tilted disc and turning slowly as a
 * rigid pattern (so the arms never "wind up"). Additive blending gives the
 * nebular glow; a faint per-star twinkle keeps it alive. All transform + draw,
 * one render loop -> 60fps. Reduced-motion renders a single static frame.
 */
export function Galaxy({
  size = 760,
  reduce = false,
  className,
  mini = false,
  tilt = 58,
  spin = 0.0007,
}: {
  size?: number;
  reduce?: boolean;
  className?: string;
  /** Lighter variant for faint background galaxies (fewer stars, no rocks). */
  mini?: boolean;
  /** Disc viewing angle in degrees. */
  tilt?: number;
  /** Rotation speed (rad/frame); negative spins the other way. */
  spin?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const W = size;
  const H = Math.round(size * 0.7);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const cx = W / 2;
    const cy = H / 2;
    const maxR = W * 0.46;
    const ARMS = 3;
    const WIND = 5.4; // radians the arm wraps from core to edge
    const COUNT = Math.round(W * (mini ? 1.1 : 1.8));
    const TILT = Math.cos((tilt * Math.PI) / 180); // disc viewing angle

    const randn = () => Math.random() + Math.random() + Math.random() - 1.5;

    const stars: Star[] = [];
    for (let i = 0; i < COUNT; i++) {
      const rn = Math.pow(Math.random(), 0.82); // central concentration
      const r = rn * maxR + 1.5;
      const inArm = Math.random() < 0.86;
      const base = inArm
        ? ((i % ARMS) / ARMS) * Math.PI * 2 + rn * WIND
        : Math.random() * Math.PI * 2;
      const theta = base + (inArm ? randn() * (0.26 + rn * 0.1) : randn() * 0.6);

      let c: number;
      if (rn < 0.2) c = Math.random() < 0.62 ? 0 : 1;
      else if (rn < 0.46) {
        const k = Math.random();
        c = k < 0.5 ? 1 : k < 0.8 ? 0 : 2;
      } else {
        const k = Math.random();
        c = k < 0.42 ? 2 : k < 0.7 ? 3 : k < 0.9 ? 4 : 0;
      }

      stars.push({
        x: Math.cos(theta) * r,
        y: Math.sin(theta) * r,
        r: (1.1 + Math.random() * 2.4) * (1 - rn * 0.35),
        a: 0.32 + Math.random() * 0.5,
        c,
        ph: Math.random() * Math.PI * 2,
      });
    }

    const sprites = COLORS.map((rgb) => glowSprite(rgb, 48));
    const core = (() => {
      const s = 256;
      const c = document.createElement("canvas");
      c.width = c.height = s;
      const g = c.getContext("2d")!;
      const grad = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      grad.addColorStop(0, "rgba(255,240,212,0.95)");
      grad.addColorStop(0.16, "rgba(255,214,150,0.55)");
      grad.addColorStop(0.45, "rgba(244,168,108,0.13)");
      grad.addColorStop(1, "rgba(244,168,108,0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, s, s);
      return c;
    })();

    // A handful of rocks/asteroids drifting in the disc (skipped for mini).
    const rockSprites = mini ? [] : Array.from({ length: 4 }, () => rockSprite());
    const rocks = mini
      ? []
      : Array.from({ length: 14 }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: maxR * (0.34 + Math.random() * 0.6),
      size: 4 + Math.random() * 9,
      spin: (Math.random() - 0.5) * 0.6,
      phase: Math.random() * Math.PI * 2,
      s: Math.floor(Math.random() * 4),
    }));

    const coreSize = maxR * 1.15;
    let raf = 0;
    let rot = 0;
    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(1, TILT);
      ctx.rotate(rot);

      ctx.globalAlpha = 1;
      ctx.drawImage(core, -coreSize, -coreSize, coreSize * 2, coreSize * 2);

      for (const st of stars) {
        ctx.globalAlpha =
          st.a * (reduce ? 1 : 0.72 + 0.28 * Math.sin(t * 2 + st.ph));
        ctx.drawImage(
          sprites[st.c],
          st.x - st.r,
          st.y - st.r,
          st.r * 2,
          st.r * 2,
        );
      }

      ctx.restore();

      // Rocks: drawn in SCREEN space (no disc squash, so they look 3D) but
      // orbiting WITH the pattern, each tumbling on its own.
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      for (const rk of rocks) {
        const ang = rk.angle + rot;
        const sx = cx + Math.cos(ang) * rk.radius;
        const sy = cy + Math.sin(ang) * rk.radius * TILT;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(rk.phase + t * rk.spin);
        ctx.drawImage(
          rockSprites[rk.s],
          -rk.size,
          -rk.size,
          rk.size * 2,
          rk.size * 2,
        );
        ctx.restore();
      }
    };

    if (reduce) {
      rot = 0.5;
      draw();
      return;
    }

    const loop = () => {
      draw();
      rot += spin;
      t += 0.016;
      raf = requestAnimationFrame(loop);
    };

    // Drawing ~1.8x the width in star sprites EVERY frame is the heaviest loop
    // on the page. Only run it while the galaxy is actually on screen and the tab
    // is visible - otherwise it would steal main-thread time (and drop frames)
    // while you're scrolling a completely different section.
    let running = false;
    let onScreen = false;
    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const sync = () => {
      if (onScreen && !document.hidden) start();
      else stop();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { rootMargin: "15% 0px" },
    );
    io.observe(canvas);
    document.addEventListener("visibilitychange", sync);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      stop();
    };
  }, [W, H, reduce, mini, tilt, spin]);

  return (
    <canvas ref={ref} width={W} height={H} className={className} aria-hidden />
  );
}
