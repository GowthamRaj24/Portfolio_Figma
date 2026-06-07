"use client";

import { useEffect, useRef } from "react";
import { useReveal } from "@/components/loader/load-context";
import { MouseParallax } from "@/components/motion/mouse-parallax";

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { setAssetProgress, setAssetReady } = useReveal();

  // Report real load progress + readiness of the background video.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const reportProgress = () => {
      try {
        if (video.buffered.length && video.duration) {
          const end = video.buffered.end(video.buffered.length - 1);
          setAssetProgress(Math.min(99, (end / video.duration) * 100));
        }
      } catch {
        /* buffered can throw if not ready; ignore */
      }
    };

    const onReady = () => {
      setAssetReady(true);
      // Best-effort autoplay (muted autoplay is allowed by browsers).
      video.play().catch(() => {});
    };

    // Safety net for the case where the video element *does* get paused while
    // the tab is visible (resume it).
    const keepPlaying = () => {
      if (!document.hidden && video.paused) {
        video.play().catch(() => {});
      }
    };

    video.addEventListener("progress", reportProgress);
    video.addEventListener("loadedmetadata", reportProgress);
    video.addEventListener("canplaythrough", onReady);
    video.addEventListener("loadeddata", reportProgress);
    video.addEventListener("pause", keepPlaying);
    document.addEventListener("visibilitychange", keepPlaying);
    // Belt-and-suspenders: some browsers pause without firing a clean event.
    const interval = window.setInterval(keepPlaying, 1500);

    // If it is already buffered (cached), fire readiness immediately.
    if (video.readyState >= 4) onReady();

    return () => {
      video.removeEventListener("progress", reportProgress);
      video.removeEventListener("loadedmetadata", reportProgress);
      video.removeEventListener("canplaythrough", onReady);
      video.removeEventListener("loadeddata", reportProgress);
      video.removeEventListener("pause", keepPlaying);
      document.removeEventListener("visibilitychange", keepPlaying);
      window.clearInterval(interval);
    };
  }, [setAssetProgress, setAssetReady]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* A tiny scale (1.04) keeps the 4K video crisp while hiding the
          parallax offset edges. */}
      <MouseParallax strength={-14} scale={1.04} className="absolute inset-0">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          poster="/hero-bg.png"
          src="/evening-drive-and-windmills.3840x2160.mp4"
          muted
          loop
          autoPlay
          playsInline
          preload="auto"
          aria-hidden
          // Force the video onto its own composited layer (off the GPU hardware
          // overlay) so it keeps repainting under the fixed birds WebGL canvas.
          // Without this, the overlaid canvas freezes the video on one frame.
          style={{ transform: "translateZ(0)", willChange: "transform", backfaceVisibility: "hidden" }}
        />
      </MouseParallax>

      {/* Light top feather for navbar legibility (keeps footage crisp). */}
      <div className="hero-edge-scrim absolute inset-0" aria-hidden />

      {/* Bottom fade to pure black so the hero blends seamlessly into the
          next (black) section as you scroll. */}
      <div className="hero-bottom-fade absolute inset-x-0 bottom-0" aria-hidden />
    </div>
  );
}
