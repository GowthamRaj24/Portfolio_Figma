"use client";

import { useEffect, useRef } from "react";

/**
 * ReflectionVideo - the hero's evening footage continued as a night-graded
 * "reflection" across the TOP of the About section, so hero -> About reads as
 * one continuous scene meeting at a waterline.
 *
 * The user-supplied clip is already oriented, so it plays AS-IS. We dim it and
 * add a soft blur (a watery reflection), then MASK the bottom half to
 * transparent so it dissolves into the night behind the bio. Because the file
 * is large, an IntersectionObserver pauses playback whenever the reflection is
 * scrolled off-screen (no second big video decoding down in Projects/Skills).
 */
export function ReflectionVideo() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const video = videoRef.current;
    if (!wrap || !video) return;

    let visible = true;

    const tryPlay = () => {
      if (visible && !document.hidden && video.paused) {
        video.play().catch(() => {});
      }
    };

    // Only decode/play while the reflection is on (or near) screen.
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) tryPlay();
        else video.pause();
      },
      { rootMargin: "15% 0px" },
    );
    io.observe(wrap);

    document.addEventListener("visibilitychange", tryPlay);
    // Belt-and-suspenders: some browsers pause without a clean event.
    const interval = window.setInterval(tryPlay, 1500);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", tryPlay);
      window.clearInterval(interval);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 z-0 h-screen overflow-hidden"
      style={{
        // The reflection fades IN from dark at the top (so it blends seamlessly
        // into the hero's dark bottom at the seam) and fades OUT through the
        // lower half - one continuous dark-to-dark hand-off, hero -> about.
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0%, #000 16%, #000 42%, transparent 100%)",
        maskImage:
          "linear-gradient(to bottom, transparent 0%, #000 16%, #000 42%, transparent 100%)",
      }}
    >
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        src="/night-drive-and-windmills.mp4"
        muted
        loop
        autoPlay
        playsInline
        preload="auto"
        aria-hidden
        style={{
          // Own composited layer (keeps repainting under the WebGL birds), plus
          // a hair of scale to hide the soft-blur feathering at the edges.
          transform: "translateZ(0) scale(1.06)",
          willChange: "transform",
          backfaceVisibility: "hidden",
          filter: "blur(3px) brightness(0.82) saturate(0.95)",
          opacity: 0.6,
        }}
      />
      {/* A faint warm wash up top to marry the cool night clip to the section's
          warm palette (also fades out before the mask does). */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(10,8,6,0.26) 0%, rgba(10,8,6,0) 55%)",
        }}
      />
    </div>
  );
}
