"use client";

import { useRef } from "react";
import { LoadProvider } from "@/components/loader/load-context";
import { Loader } from "@/components/loader/loader";
import { Hero } from "./hero";
import { About } from "@/components/about/about";
import { Projects } from "@/components/projects/projects";
import { Skills } from "@/components/skills/skills";
import { Experience } from "@/components/experience/experience";
import { Achievements } from "@/components/achievements/achievements";
import { Contact, Footer } from "@/components/contact/contact";
import { SectionDivider } from "@/components/layout/section-divider";
import { CinematicOverlay } from "@/components/layout/cinematic-overlay";
import { StarField } from "@/components/layout/star-field";
import { SafeBoundary } from "@/components/motion/safe-boundary";
import { Birds } from "@/components/about/birds/birds";

export function HeroExperience() {
  // The flock travels the hero -> about journey only, so it measures a wrapper
  // around just those two (ending at About's bottom). `aboutRef` measures when
  // About enters view for the black -> bronze colour transition.
  const journeyRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLElement>(null);

  return (
    <LoadProvider>
      <Loader />
      <main className="bg-background">
        {/* Birds journey = hero + about (Projects sits outside it). */}
        <div ref={journeyRef}>
          <Hero />
          <About sectionRef={aboutRef} />
        </div>
        <SectionDivider />
        <Projects />
        <SectionDivider />
        <Skills />
        <SectionDivider />
        <Experience />
        <SectionDivider />
        <Achievements />
        <SectionDivider />
        <Contact />
      </main>

      <Footer />

      {/* Birds silhouetted over the hero video, warming to bronze as they
          descend into About. Fixed overlay; wrapped so any WebGL/model failure
          falls back to no birds rather than blanking the page. */}
      <SafeBoundary label="birds">
        <Birds journeyRef={journeyRef} aboutRef={aboutRef} />
      </SafeBoundary>

      {/* Sparse, site-wide starfield: a few faint distant stars fixed to the
          viewport so the WHOLE site reads as deep space. Kept few + faint - the
          white stars self-mask over bright content (hero video, project shots)
          and shimmer through the dark gaps, parallaxing against the per-section
          stars. Sits below the grain/vignette + navbar. */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[6]">
        <StarField count={28} opacity={0.55} seed={97} />
      </div>

      {/* Site-wide film grain + vignette - unifies every section as one film. */}
      <CinematicOverlay />
    </LoadProvider>
  );
}
