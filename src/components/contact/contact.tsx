"use client";

import { useRef, useState, type ReactNode } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import { Embers } from "@/components/layout/embers";
import { StarField } from "@/components/layout/star-field";
import { Meteors } from "@/components/layout/meteors";
import { GeometricBackdrop } from "@/components/layout/geometric-backdrop";
import { ScrollParallax } from "@/components/motion/scroll-parallax";
import { PillButton } from "@/components/ui/pill-button";

/* ---------------------------------------------------------------- */
/* Details - REPLACE these placeholders with your real handles.      */
/* ---------------------------------------------------------------- */

const EMAIL = "mgowthamraj9491@gmail.com";
const PHONE = "+91 9491226619";
const RESUME = "/Gowtham_Raju_Manda_Resume.pdf";

// Same pre-filled subject + greeting as the hero "Contact" button, so emailing
// from anywhere on the site opens a ready-to-edit message (not a blank compose).
const EMAIL_MAILTO = `mailto:${EMAIL}?subject=${encodeURIComponent(
  "Let's connect — from your portfolio",
)}&body=${encodeURIComponent(
  "Hi Gowtham,\n\nI came across your portfolio and would love to connect about ",
)}`;

const SOCIALS: {
  label: string;
  href: string;
  /** When set, the Contact-section button copies this value instead of navigating. */
  copy?: string;
  icon: ReactNode;
}[] = [
  { label: "GitHub", href: "https://github.com/GowthamRaj24", icon: <GitHubIcon /> },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/gowtham-raj-1061a5272/",
    icon: <LinkedInIcon />,
  },
  { label: "Email", href: EMAIL_MAILTO, icon: <MailIcon /> },
  {
    label: "Phone",
    href: `tel:${PHONE.replace(/\s+/g, "")}`,
    copy: PHONE,
    icon: <PhoneIcon />,
  },
];

const NAV = [
  { label: "About", href: "#about" },
  { label: "Work", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Awards", href: "#achievements" },
  { label: "Contact", href: "#contact" },
];

/* ---------------------------------------------------------------- */
/* Motion                                                            */
/* ---------------------------------------------------------------- */

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
const rise: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ---------------------------------------------------------------- */
/* Contact section                                                   */
/* ---------------------------------------------------------------- */

export function Contact() {
  const [copied, setCopied] = useState(false);
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable - the mailto link still works */
    }
  };

  const copyToClipboard = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedLabel(label);
      window.setTimeout(
        () => setCopiedLabel((c) => (c === label ? null : c)),
        1800,
      );
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <section id="contact" className="relative bg-background py-28 sm:py-40">
      {/* Deep-night sky + meteors + embers, continuing the evening. */}
      <StarField count={72} opacity={0.6} seed={83} />
      <Meteors count={3} seed={67} />
      <Embers className="z-0" />

      {/* Rotating solar system behind the contact (moved here from Projects). */}
      <GeometricBackdrop variant="solar" />

      {/* Faint giant watermark. */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-x-0 top-[10vh] text-center">
          <ScrollParallax distance={120}>
            <span className="block select-none font-display text-[22vw] font-bold leading-none tracking-tight text-cream/[0.03]">
              HELLO
            </span>
          </ScrollParallax>
        </div>
      </div>

      {/* Readability scrim: dims the busy backdrop behind the centred text so it
          stays easy to read; the solar system still shows around the edges. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(62% 56% at 50% 44%, rgba(10,8,6,0.78), rgba(10,8,6,0.42) 64%, transparent 100%)",
        }}
      />

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-14% 0px" }}
        className="relative z-10 mx-auto max-w-4xl px-6 text-center sm:px-10"
      >
        <motion.div variants={rise} className="flex items-center justify-center gap-4">
          <span className="h-px w-12 bg-accent/60" />
          <span className="font-sans text-xs uppercase tracking-[0.4em] text-accent">
            06 / Contact
          </span>
          <span className="h-px w-12 bg-accent/60" />
        </motion.div>

        <motion.h2
          variants={rise}
          className="mt-7 font-display text-[clamp(2.4rem,7vw,5.5rem)] font-bold leading-[1.02] tracking-tight text-cream"
        >
          Let&apos;s make contact.
        </motion.h2>

        <motion.p
          variants={rise}
          className="mx-auto mt-6 max-w-xl font-sans text-[clamp(1rem,1.7vw,1.25rem)] font-light leading-relaxed text-cream/80"
        >
          A role, a freelance build, or just a hello from across the galaxy — my
          inbox is always open.
        </motion.p>

        {/* Email - the hero of the section. */}
        <motion.div variants={rise} className="mt-12 flex flex-col items-center gap-4">
          <a
            href={EMAIL_MAILTO}
            className="font-display text-[clamp(1.4rem,4.5vw,2.8rem)] font-bold tracking-tight text-cream underline decoration-accent/40 decoration-2 underline-offset-[10px] transition-colors duration-300 hover:text-accent hover:decoration-accent"
          >
            {EMAIL}
          </a>
          <button
            type="button"
            onClick={copyEmail}
            className="inline-flex items-center gap-2 rounded-full border border-cream/20 px-4 py-1.5 font-sans text-xs uppercase tracking-[0.2em] text-cream/70 transition-colors duration-300 hover:border-accent/50 hover:text-accent"
          >
            {copied ? "Copied \u2713" : "Copy email"}
          </button>
        </motion.div>

        {/* Social profiles. */}
        <motion.div
          variants={rise}
          className="mt-12 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
        >
          {SOCIALS.map((s) => {
            const itemClass =
              "group flex items-center gap-2.5 rounded-2xl border border-cream/12 bg-cream/[0.03] px-5 py-3 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:bg-cream/[0.06]";
            const iconSpan = (
              <span className="text-cream/70 transition-colors duration-300 group-hover:text-accent [&>svg]:h-5 [&>svg]:w-5">
                {s.icon}
              </span>
            );

            // Phone (and any `copy` entry): copy to clipboard instead of a
            // dead `tel:` link, with a transient "Copied" confirmation.
            if (s.copy) {
              const value = s.copy;
              const done = copiedLabel === s.label;
              return (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => copyToClipboard(value, s.label)}
                  aria-label={`Copy ${s.label.toLowerCase()} number`}
                  title={value}
                  className={`${itemClass} cursor-pointer`}
                >
                  {iconSpan}
                  <span className="font-sans text-sm text-cream/80 transition-colors duration-300 group-hover:text-cream">
                    {done ? "Copied \u2713" : s.label}
                  </span>
                </button>
              );
            }

            return (
              <a
                key={s.label}
                href={s.href}
                target={s.href.startsWith("http") ? "_blank" : undefined}
                rel={s.href.startsWith("http") ? "noreferrer" : undefined}
                className={itemClass}
              >
                {iconSpan}
                <span className="font-sans text-sm text-cream/80 transition-colors duration-300 group-hover:text-cream">
                  {s.label}
                </span>
              </a>
            );
          })}
        </motion.div>

        {/* Availability + résumé. */}
        <motion.div
          variants={rise}
          className="mt-14 flex flex-col items-center gap-6 sm:flex-row sm:justify-center"
        >
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#6fe0a6]/70" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#6fe0a6]" />
            </span>
            <span className="font-sans text-[0.75rem] uppercase tracking-[0.25em] text-cream/70">
              Available for new projects
            </span>
          </div>
          <PillButton
            href={RESUME}
            variant="solid"
            target="_blank"
            rel="noreferrer"
          >
            Download r&eacute;sum&eacute;
          </PillButton>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/* Footer                                                            */
/* ---------------------------------------------------------------- */

export function Footer() {
  const year = new Date().getFullYear();
  const reduce = useReducedMotion();
  const footerRef = useRef<HTMLElement>(null);

  // Scroll-linked parallax: as the footer rises into view the satellite drifts
  // diagonally at its own (slower) rate, layered UNDER the ambient bob/tilt.
  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ["start end", "end end"],
  });
  const satX = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-54, 20]);
  const satY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [18, -16]);

  return (
    <footer
      ref={footerRef}
      className="relative z-10 overflow-hidden border-t border-cream/10 bg-background"
    >
      {/* A little satellite drifting at the left edge of the footer sky. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[-4vw] top-1/2 -z-10 hidden -translate-y-1/2 select-none sm:block"
      >
        {/* Outer layer = scroll parallax; inner image = endless zero-g float. */}
        <motion.div style={{ x: satX, y: satY }}>
          <motion.img
            src="/satellite-cut.png"
            alt=""
            draggable={false}
            className="w-[clamp(140px,14vw,240px)] opacity-50"
            style={{ filter: "drop-shadow(0 14px 34px rgba(0,0,0,0.55))" }}
            animate={
              reduce ? undefined : { y: [0, -14, 0], rotate: [-2.5, 2.5, -2.5] }
            }
            transition={
              reduce
                ? undefined
                : { duration: 18, repeat: Infinity, ease: "easeInOut" }
            }
          />
        </motion.div>
      </div>

      <div className="mx-auto max-w-[110rem] px-6 py-12 sm:px-10 sm:py-14">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          {/* Wordmark + tagline. */}
          <div>
            <a
              href="#home"
              className="font-display text-2xl font-bold tracking-tight text-cream"
            >
              Gowtham
            </a>
            <p className="mt-2 max-w-xs font-sans text-sm leading-relaxed text-cream/55">
              Gowtham Raju Manda — Software Engineer crafting intelligent,
              user-focused products.
            </p>
          </div>

          {/* Nav. */}
          <nav className="flex flex-wrap gap-x-6 gap-y-3">
            {NAV.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="font-sans text-sm uppercase tracking-[0.16em] text-cream/60 transition-colors duration-300 hover:text-accent"
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Socials. */}
          <div className="flex gap-3">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target={s.href.startsWith("http") ? "_blank" : undefined}
                rel={s.href.startsWith("http") ? "noreferrer" : undefined}
                aria-label={s.label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/12 text-cream/65 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent [&>svg]:h-[18px] [&>svg]:w-[18px]"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 border-t border-cream/[0.08] pt-6 sm:flex-row sm:justify-between">
          <span className="font-sans text-xs tracking-[0.05em] text-cream/45">
            &copy; {year} Gowtham Raju Manda. All rights reserved.
          </span>
          <a
            href="#home"
            className="group inline-flex items-center gap-2 font-sans text-xs uppercase tracking-[0.2em] text-cream/55 transition-colors duration-300 hover:text-accent"
          >
            Back to top
            <span className="transition-transform duration-300 group-hover:-translate-y-0.5">
              &uarr;
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}

/* ---------------------------------------------------------------- */
/* Icons (inline so there's no icon dependency)                      */
/* ---------------------------------------------------------------- */

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M1.5 5.25A2.25 2.25 0 013.75 3h16.5A2.25 2.25 0 0122.5 5.25v.443l-10.5 6.3-10.5-6.3V5.25zm0 2.707V18.75A2.25 2.25 0 003.75 21h16.5a2.25 2.25 0 002.25-2.25V7.957l-9.9 5.94a2.25 2.25 0 01-2.7 0L1.5 7.957z" />
    </svg>
  );
}
