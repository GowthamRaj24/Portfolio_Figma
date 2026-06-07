"use client";

import { useEffect, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import { useReveal } from "@/components/loader/load-context";

export function Headline() {
  const { revealed } = useReveal();
  const reduceMotion = useReducedMotion();

  const { scrollY } = useScroll();

  const [vh, setVh] = useState(0);
  useEffect(() => {
    const update = () => setVh(window.innerHeight);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  const range = vh || 800;

  // Scroll parallax (outer wrappers): each line drifts up at a different rate.
  const yName = useTransform(scrollY, [0, range], reduceMotion ? [0, 0] : [0, -380]);
  const yRole = useTransform(scrollY, [0, range], reduceMotion ? [0, 0] : [0, -240]);
  const scrollFade = useTransform(
    scrollY,
    [0, range * 0.7],
    reduceMotion ? [1, 1] : [1, 0],
  );

  const slideDistance = reduceMotion ? 0 : 160;

  const fromLeft: Variants = {
    hidden: { x: -slideDistance, opacity: 0 },
    show: { x: 0, opacity: 1, transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] } },
  };
  const fromRight: Variants = {
    hidden: { x: slideDistance, opacity: 0 },
    show: {
      x: 0,
      opacity: 1,
      transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.14 },
    },
  };

  return (
    <h1 className="display text-cinematic">
      {/* OUTER motion.div = scroll parallax (y + fade). div avoids any inline
          span transform quirks. INNER span = entrance slide (x). */}
      <motion.div className="gpu" style={{ y: yName, opacity: scrollFade }}>
        <motion.span
          className="block"
          variants={fromLeft}
          initial="hidden"
          animate={revealed ? "show" : "hidden"}
        >
          GOWTHAM RAJU
        </motion.span>
      </motion.div>

      <motion.div className="gpu" style={{ y: yRole, opacity: scrollFade }}>
        <motion.span
          className="block whitespace-nowrap pl-[6vw] text-[0.4em] font-light tracking-[0.18em] text-cream/85"
          variants={fromRight}
          initial="hidden"
          animate={revealed ? "show" : "hidden"}
        >
          SOFTWARE ENGINEER
        </motion.span>
      </motion.div>
    </h1>
  );
}
