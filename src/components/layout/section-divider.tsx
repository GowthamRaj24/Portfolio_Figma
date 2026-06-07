"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Fancy horizontal section separator: two gradient hairlines that grow outward
 * from a glowing center diamond as it scrolls into view. Transform/opacity only
 * -> 60fps. Aligns to the site's content width.
 */
export function SectionDivider() {
  const reduceMotion = useReducedMotion();

  const line = {
    hidden: { scaleX: 0, opacity: 0 },
    show: { scaleX: 1, opacity: 1 },
  };
  const mark = {
    hidden: { scale: 0, opacity: 0 },
    show: { scale: 1, opacity: 1 },
  };

  return (
    <div className="relative mx-auto w-full max-w-[110rem] px-6 py-16 sm:px-10 sm:py-24">
      <motion.div
        className="flex items-center justify-center"
        initial={reduceMotion ? "show" : "hidden"}
        whileInView="show"
        viewport={{ once: true, margin: "-10% 0px" }}
      >
        <motion.span
          aria-hidden
          className="gpu h-px flex-1 origin-right bg-gradient-to-r from-transparent via-cream/10 to-accent/50"
          variants={line}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />

        <motion.span
          aria-hidden
          className="relative mx-5 flex items-center justify-center"
          variants={mark}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.35 }}
        >
          {/* glow */}
          <span
            className="absolute h-7 w-7 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(217,185,140,0.45), rgba(217,185,140,0) 70%)",
            }}
          />
          {/* diamond */}
          <span
            className="block h-2.5 w-2.5 bg-accent"
            style={{
              transform: "rotate(45deg)",
              boxShadow: "0 0 10px 1px rgba(217,185,140,0.6)",
            }}
          />
        </motion.span>

        <motion.span
          aria-hidden
          className="gpu h-px flex-1 origin-left bg-gradient-to-l from-transparent via-cream/10 to-accent/50"
          variants={line}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />
      </motion.div>
    </div>
  );
}
