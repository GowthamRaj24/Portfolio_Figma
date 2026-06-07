# Gowtham Raju Manda - Portfolio

A modern, cinematic portfolio built with Next.js, React, TypeScript, Tailwind CSS, and Framer Motion.

This first pass implements the **hero section**, inspired by an atmospheric, full-screen cinematic style: a central preloader with a real load-progress counter, a full-screen background video with a subtle mouse parallax, and a giant Inria Serif name headline that slides in (top line from the left, bottom line from the right) once loading finishes.

> Performance rule: everything targets a smooth **60fps**. All motion uses GPU-composited `transform`/`opacity` only (no WebGL/3D), the background is a hardware-decoded `<video>`, and parallax is `requestAnimationFrame`-throttled.

## Tech stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Framer Motion** - UI animations (transform/opacity only)
- **next-themes** - light / dark mode
- **Inria Serif** (display) + **Inter** (body) via `next/font`

## Getting started

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## How it works

- The page mounts inside a `LoadProvider` that coordinates the loader, the background video, and the hero reveal.
- `HeroVideo` reports real load progress (via the video's `progress`/`buffered` events) and fires ready on `canplaythrough`. It also runs the rAF-throttled mouse parallax.
- `Loader` shows a real `0 -> 100%` counter driven by that progress, holds a minimum duration, then plays a curtain slide-up reveal. An 8s fail-safe guarantees it never hangs.
- On reveal, `Headline` slides the two name lines in from opposite sides, and the remaining hero elements fade/rise in.
- All motion respects `prefers-reduced-motion`.

## Background assets

- `public/hero-bg.mp4` - the full-screen background video (replace with your own).
- `public/hero-bg.png` - used as the video `poster` (instant first paint) and fallback.

To use your own background, just replace those two files (keep the same names), or tell me a new path to wire up.

## Project structure

```
src/
  app/
    layout.tsx          # fonts, ThemeProvider, metadata
    page.tsx            # renders the hero experience
    globals.css         # Tailwind + design tokens (dark cinematic + light)
  components/
    loader/             # load-context, Loader (progress + curtain reveal)
    hero/               # Hero, Headline, HeroVideo, HeroExperience
    layout/             # Navbar
    ui/                 # PillButton, ThemeToggle
    theme-provider.tsx
  lib/
    fonts.ts            # Inria Serif (display) + Inter (body)
    utils.ts
```

## Roadmap

This is the hero-first pass. Next up (pending approval of the look):

- Roll the design system out to About, Skills, Projects, Experience, Services, Testimonials, Blog, Contact.
- Working contact form (Resend), downloadable resume PDF, SEO (sitemap/robots/OG), analytics.
- Match exact Figma specs once the Figma connection is available.
