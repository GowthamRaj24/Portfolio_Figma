"use client";

import { motion } from "framer-motion";
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

  return (
    <motion.header
      className="text-cinematic fixed inset-x-0 top-0 z-50 gpu"
      initial={{ y: -24, opacity: 0 }}
      animate={revealed ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
    >
      <nav className="mx-auto flex max-w-[110rem] items-center justify-between px-6 py-6 sm:px-10">
        {/* Logo / mark */}
        <a href="#home" className="flex flex-col leading-none">
          <span className="font-serif text-lg font-bold tracking-[0.1em] text-cream">
            Gowtham&rsquo;s
          </span>
          <span className="mt-1 text-[10px] uppercase tracking-[0.3em] text-muted">
            Portfolio
          </span>
        </a>

        {/* Center nav links */}
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
      </nav>
    </motion.header>
  );
}
