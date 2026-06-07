"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion, useScroll } from "framer-motion";
import { useReveal } from "@/components/loader/load-context";
import { SETTLE } from "./constants";

const BirdsScene = dynamic(() => import("./birds-scene"), { ssr: false });

type BirdsProps = {
  /** Wrapper spanning hero + about; measured for the vertical-travel progress. */
  journeyRef: React.RefObject<HTMLElement | null>;
  /** The About section; measured for the black->bronze colour transition. */
  aboutRef: React.RefObject<HTMLElement | null>;
};

/**
 * Fixed, viewport-spanning WebGL flock that travels from the hero (over the
 * video, as dark silhouettes) into the About section (warming to bronze) and
 * settles. AFTER settling, its vertical position is LOCKED TO THE PAGE: it rises
 * with the scroll so it scrolls up and away with the section, just like the
 * text, while the wings keep flapping. Scroll/pointer signals go into refs (read
 * in useFrame) so neither scrolling nor mouse movement re-renders React. Mounts
 * only after the loader reveals, pauses once scrolled past, reduced-motion safe.
 */
export function Birds({ journeyRef, aboutRef }: BirdsProps) {
  const reduceMotion = useReducedMotion();
  const { revealed } = useReveal();
  const scrollRef = useRef(0);
  const pastScrollRef = useRef(0);
  const colorRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const settleScrollYRef = useRef(0);
  const viewHRef = useRef(1);
  const [active, setActive] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Glide-in travel: 0 at the top of the hero, 1 at the bottom of About.
  const { scrollYProgress: journey } = useScroll({
    target: journeyRef,
    offset: ["start start", "end end"],
  });
  // Colour: stays 0 (black) while the hero dominates, then ramps to 1 (bronze)
  // as About rises from the middle of the screen to the top.
  const { scrollYProgress: aboutEnter } = useScroll({
    target: aboutRef,
    offset: ["start center", "start start"],
  });

  useEffect(() => {
    const unsub = journey.on("change", (v) => {
      scrollRef.current = v;
    });
    return () => unsub();
  }, [journey]);

  useEffect(() => {
    const unsub = aboutEnter.on("change", (v) => {
      colorRef.current = v;
    });
    return () => unsub();
  }, [aboutEnter]);

  // Page lock: find the document scroll position where the flock settles
  // (journey === SETTLE), then on each scroll feed how many VIEWPORT-HEIGHTS
  // we've scrolled past it so the birds rise with the page. The render loop
  // stays active across hero + about + the brief scroll-off, then pauses.
  useEffect(() => {
    const measure = () => {
      const el = journeyRef.current;
      if (!el) return;
      const docTop = el.getBoundingClientRect().top + window.scrollY;
      const scrollDistance = Math.max(1, el.offsetHeight - window.innerHeight);
      settleScrollYRef.current = docTop + SETTLE * scrollDistance;
      viewHRef.current = window.innerHeight;
    };
    const onScroll = () => {
      const past = window.scrollY - settleScrollYRef.current;
      pastScrollRef.current = Math.max(0, past / viewHRef.current);
      // Keep rendering while they're on/near the screen (hero, about, scroll-off);
      // pause once they've cleared (~1.1 viewports past settle) deep in Projects.
      setActive(window.scrollY < settleScrollYRef.current + viewHRef.current * 1.1);
    };
    measure();
    onScroll();
    window.addEventListener("resize", measure, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", onScroll);
    };
  }, [journeyRef]);

  // Pointer parallax -> ref (normalised -1..1), no re-render.
  useEffect(() => {
    if (reduceMotion) return;
    const onMove = (e: PointerEvent) => {
      pointerRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduceMotion]);

  // Disabled for reduced motion, and hidden until the loader reveals the page
  // (so birds never flash over the loading screen).
  if (reduceMotion || !revealed) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-20"
    >
      {mounted && (
        <BirdsScene
          scrollRef={scrollRef}
          pastScrollRef={pastScrollRef}
          colorRef={colorRef}
          pointerRef={pointerRef}
          active={active}
        />
      )}
    </div>
  );
}
