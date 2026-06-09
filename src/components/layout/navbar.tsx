"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReveal } from "@/components/loader/load-context";

const LINKS = [
  { label: "About", href: "#about" },
  { label: "Work", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Awards", href: "#achievements" },
];

export function Navbar() {
  const { revealed } = useReveal();
  const [open, setOpen] = useState(false);

  // Close the mobile menu on ESC.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <motion.header
      className="text-cinematic fixed inset-x-0 top-0 z-50 gpu"
      initial={{ y: -24, opacity: 0 }}
      animate={revealed ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
    >
      <nav className="mx-auto flex max-w-[110rem] items-center justify-between px-6 py-6 sm:px-10">
        {/* Logo / mark */}
        <a
          href="#home"
          onClick={() => setOpen(false)}
          className="flex flex-col leading-none"
        >
          <span className="font-serif text-lg font-bold tracking-[0.1em] text-cream">
            Gowtham&rsquo;s
          </span>
          <span className="mt-1 text-[10px] uppercase tracking-[0.3em] text-muted">
            Portfolio
          </span>
        </a>

        {/* Center nav links (desktop) */}
        <ul className="hidden items-center gap-9 text-xs uppercase tracking-[0.18em] text-muted md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="transition-colors duration-300 hover:text-cream"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile menu toggle (hamburger → X) */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
          className="relative z-50 -mr-2 flex h-10 w-10 items-center justify-center text-cream md:hidden"
        >
          <span className="relative block h-3.5 w-6">
            <motion.span
              className="absolute left-0 top-0 block h-0.5 w-6 rounded-full bg-current"
              animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
            <motion.span
              className="absolute left-0 top-1/2 block h-0.5 w-6 -translate-y-1/2 rounded-full bg-current"
              animate={open ? { opacity: 0, x: -8 } : { opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            />
            <motion.span
              className="absolute bottom-0 left-0 block h-0.5 w-6 rounded-full bg-current"
              animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </span>
        </button>
      </nav>

      {/* Mobile dropdown menu. Anchored ABSOLUTE to the navbar (not fixed),
          because the header's `gpu` transform would otherwise contain a fixed
          overlay to the header's own box. */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            key="mobile-nav"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-0 top-full origin-top border-b border-cream/10 bg-[#070509]/92 backdrop-blur-xl md:hidden"
          >
            <ul className="mx-auto flex max-w-[110rem] flex-col gap-1 px-6 py-3">
              {LINKS.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.05, duration: 0.3 }}
                >
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-3.5 font-sans text-sm uppercase tracking-[0.2em] text-cream/80 transition-colors duration-200 hover:bg-cream/5 hover:text-cream"
                  >
                    <span className="font-sans text-[0.65rem] text-accent/80">
                      0{i + 1}
                    </span>
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
