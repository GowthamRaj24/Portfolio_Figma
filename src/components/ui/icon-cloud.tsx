"use client";

import React, { useEffect, useRef, useState } from "react";
import { renderToString } from "react-dom/server";

interface Icon {
  x: number;
  y: number;
  z: number;
  scale: number;
  opacity: number;
  id: number;
}

interface IconCloudProps {
  icons?: React.ReactNode[];
  images?: string[];
  /** Internal canvas resolution (px). Higher = crisper when displayed large. */
  size?: number;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function IconCloud({ icons, images, size = 400 }: IconCloudProps) {
  // All the original magic numbers were tuned for a 400px canvas; derive them
  // from `size` so the sphere is identical at any resolution.
  const R = size / 4; // sphere radius
  const ICON = size / 10; // icon box
  const HALF = ICON / 2;
  const DEPTH_OFFSET = size / 2;
  const DEPTH_RANGE = (size * 3) / 4;
  const OPA_OFFSET = (size * 3) / 8;
  const OPA_RANGE = size / 2;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [iconPositions, setIconPositions] = useState<Icon[]>([]);

  // Interaction state lives in REFS - so pointer moves never re-render React and
  // the render loop below runs exactly ONCE (reading these each frame). This is
  // what keeps it smooth + responsive at high resolution.
  const rotationRef = useRef({ x: 0, y: 0 });
  const mouseRef = useRef({ x: 0, y: 0 });
  const draggingRef = useRef(false);
  const lastRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef<{
    x: number;
    y: number;
    startX: number;
    startY: number;
    startTime: number;
    duration: number;
  } | null>(null);

  const iconCanvasesRef = useRef<HTMLCanvasElement[]>([]);
  const imagesLoadedRef = useRef<boolean[]>([]);

  // Build the offscreen icon canvases once.
  useEffect(() => {
    if (!icons && !images) return;
    const items = icons ?? images ?? [];
    imagesLoadedRef.current = new Array(items.length).fill(false);

    iconCanvasesRef.current = items.map((item, index) => {
      const offscreen = document.createElement("canvas");
      offscreen.width = ICON;
      offscreen.height = ICON;
      const offCtx = offscreen.getContext("2d");
      if (offCtx) {
        if (images) {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = items[index] as string;
          img.onload = () => {
            offCtx.clearRect(0, 0, offscreen.width, offscreen.height);
            offCtx.beginPath();
            offCtx.arc(HALF, HALF, HALF, 0, Math.PI * 2);
            offCtx.closePath();
            offCtx.clip();
            offCtx.drawImage(img, 0, 0, ICON, ICON);
            imagesLoadedRef.current[index] = true;
          };
        } else {
          offCtx.scale(ICON / 100, ICON / 100);
          const svgString = renderToString(item as React.ReactElement);
          const img = new Image();
          img.src = "data:image/svg+xml;base64," + btoa(svgString);
          img.onload = () => {
            offCtx.clearRect(0, 0, offscreen.width, offscreen.height);
            offCtx.drawImage(img, 0, 0);
            imagesLoadedRef.current[index] = true;
          };
        }
      }
      return offscreen;
    });
  }, [icons, images, ICON, HALF]);

  // Fibonacci-sphere positions.
  useEffect(() => {
    const items = icons ?? images ?? [];
    const numIcons = items.length || 20;
    const offset = 2 / numIcons;
    const increment = Math.PI * (3 - Math.sqrt(5));
    const next: Icon[] = [];
    for (let i = 0; i < numIcons; i++) {
      const y = i * offset - 1 + offset / 2;
      const r = Math.sqrt(1 - y * y);
      const phi = i * increment;
      next.push({
        x: Math.cos(phi) * r * R,
        y: y * R,
        z: Math.sin(phi) * r * R,
        scale: 1,
        opacity: 1,
        id: i,
      });
    }
    setIconPositions(next);
  }, [icons, images, R]);

  // Map a client point into the canvas's INTERNAL coordinate space (the canvas
  // is displayed scaled via CSS).
  const toCanvas = (clientX: number, clientY: number) => {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * c.width,
      y: ((clientY - rect.top) / rect.height) * c.height,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current;
    if (!c) return;
    c.setPointerCapture(e.pointerId); // keep getting moves even off-canvas
    const p = toCanvas(e.clientX, e.clientY);
    mouseRef.current = p;

    // Tap an icon -> glide it to the front. Otherwise begin a free drag.
    const rot = rotationRef.current;
    const cosX = Math.cos(rot.x);
    const sinX = Math.sin(rot.x);
    const cosY = Math.cos(rot.y);
    const sinY = Math.sin(rot.y);
    for (const icon of iconPositions) {
      const rotatedX = icon.x * cosY - icon.z * sinY;
      const rotatedZ = icon.x * sinY + icon.z * cosY;
      const rotatedY = icon.y * cosX + rotatedZ * sinX;
      const screenX = c.width / 2 + rotatedX;
      const screenY = c.height / 2 + rotatedY;
      const scale = (rotatedZ + DEPTH_OFFSET) / DEPTH_RANGE;
      const radius = HALF * scale;
      const dx = p.x - screenX;
      const dy = p.y - screenY;
      if (dx * dx + dy * dy < radius * radius) {
        const targetX = -Math.atan2(
          icon.y,
          Math.sqrt(icon.x * icon.x + icon.z * icon.z),
        );
        const targetY = Math.atan2(icon.x, icon.z);
        const dist = Math.hypot(targetX - rot.x, targetY - rot.y);
        targetRef.current = {
          x: targetX,
          y: targetY,
          startX: rot.x,
          startY: rot.y,
          startTime: performance.now(),
          duration: Math.min(2000, Math.max(800, dist * 1000)),
        };
        return;
      }
    }

    draggingRef.current = true;
    targetRef.current = null;
    lastRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    mouseRef.current = toCanvas(e.clientX, e.clientY);
    if (draggingRef.current) {
      const dx = e.clientX - lastRef.current.x;
      const dy = e.clientY - lastRef.current.y;
      rotationRef.current = {
        x: rotationRef.current.x + dy * 0.005,
        y: rotationRef.current.y + dx * 0.005,
      };
      lastRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const endDrag = (e: React.PointerEvent<HTMLCanvasElement>) => {
    draggingRef.current = false;
    const c = canvasRef.current;
    if (c?.hasPointerCapture(e.pointerId)) c.releasePointerCapture(e.pointerId);
  };

  const handlePointerLeave = () => {
    // Settle to a gentle idle when the cursor isn't over the globe.
    const c = canvasRef.current;
    if (c && !draggingRef.current) {
      mouseRef.current = { x: c.width / 2, y: c.height / 2 };
    }
  };

  // ONE render loop - reads the refs each frame.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    mouseRef.current = { x: canvas.width / 2, y: canvas.height / 2 };
    let raf = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const maxDistance = Math.hypot(centerX, centerY);
      const mp = mouseRef.current;
      const dx = mp.x - centerX;
      const dy = mp.y - centerY;
      const distance = Math.hypot(dx, dy);
      const speed = 0.0016 + (distance / maxDistance) * 0.008;

      const target = targetRef.current;
      if (target) {
        const progress = Math.min(
          1,
          (performance.now() - target.startTime) / target.duration,
        );
        const eased = easeOutCubic(progress);
        rotationRef.current = {
          x: target.startX + (target.x - target.startX) * eased,
          y: target.startY + (target.y - target.startY) * eased,
        };
        if (progress >= 1) targetRef.current = null;
      } else if (!draggingRef.current) {
        // Mouse-follow nudge + a constant gentle idle spin.
        rotationRef.current = {
          x: rotationRef.current.x + (dy / canvas.height) * speed,
          y: rotationRef.current.y + (dx / canvas.width) * speed + 0.0016,
        };
      }

      const cosX = Math.cos(rotationRef.current.x);
      const sinX = Math.sin(rotationRef.current.x);
      const cosY = Math.cos(rotationRef.current.y);
      const sinY = Math.sin(rotationRef.current.y);

      iconPositions.forEach((icon, index) => {
        const rotatedX = icon.x * cosY - icon.z * sinY;
        const rotatedZ = icon.x * sinY + icon.z * cosY;
        const rotatedY = icon.y * cosX + rotatedZ * sinX;
        const scale = (rotatedZ + DEPTH_OFFSET) / DEPTH_RANGE;
        const opacity = Math.max(
          0.2,
          Math.min(1, (rotatedZ + OPA_OFFSET) / OPA_RANGE),
        );

        ctx.save();
        ctx.translate(centerX + rotatedX, centerY + rotatedY);
        ctx.scale(scale, scale);
        ctx.globalAlpha = opacity;
        if (icons || images) {
          if (
            iconCanvasesRef.current[index] &&
            imagesLoadedRef.current[index]
          ) {
            ctx.drawImage(
              iconCanvasesRef.current[index],
              -HALF,
              -HALF,
              ICON,
              ICON,
            );
          }
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, HALF, 0, Math.PI * 2);
          ctx.fillStyle = "#4444ff";
          ctx.fill();
          ctx.fillStyle = "white";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = `${HALF}px Arial`;
          ctx.fillText(`${icon.id + 1}`, 0, 0);
        }
        ctx.restore();
      });

      raf = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(raf);
  }, [
    iconPositions,
    icons,
    images,
    ICON,
    HALF,
    DEPTH_OFFSET,
    DEPTH_RANGE,
    OPA_OFFSET,
    OPA_RANGE,
  ]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={handlePointerLeave}
      className="cursor-grab touch-pan-y rounded-lg active:cursor-grabbing"
      aria-label="Interactive 3D Icon Cloud"
      role="img"
    />
  );
}
