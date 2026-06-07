"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  useAnimations,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";
import { SETTLE } from "./constants";

/**
 * A flock of low-poly birds (Parrot, Flamingo, Stork) that flap their wings
 * (baked morph-target animations) and glide in from the HERO (over the video, as
 * dark silhouettes), brightening to WHITE as the About section arrives, then
 * DECELERATE to a rest in the mid-right of About and HOVER there. They never
 * descend to the bottom of the screen; the wing-flap + a gentle hover keep
 * running the whole time so the parked flock still feels alive.
 *
 * Two scroll signals drive it:
 *   - `scrollRef`  (0..1 across hero->about) drives the glide-in / settle.
 *   - `colorRef`   (0..1 as About enters view) drives the black -> white fade.
 *
 * Performance: tiny low-poly models, one shared material, DPR clamped, loop
 * paused only once you scroll past About. Holds 60fps.
 */

const MODELS = {
  parrot: "/models/Parrot.glb",
  flamingo: "/models/Flamingo.glb",
  stork: "/models/Stork.glb",
} as const;

// Silhouette (hero) and lit (about) colours, lerped by colorRef. The birds
// brighten from a near-black silhouette to WHITE as About arrives.
const SILHOUETTE = new THREE.Color("#05060a");
const WHITE = new THREE.Color("#f1f4f9");
const EMISSIVE_OFF = new THREE.Color("#000000");
const EMISSIVE_ON = new THREE.Color("#44474f");

// Yaw that makes a bird face the direction of rightward travel; leftward birds
// use FACE_YAW + PI. Each bird faces the way it actually moves, so varied
// directions never look reversed. If a model looks reversed, flip this sign.
const FACE_YAW = -Math.PI / 2;

// Camera rig (must match the <Canvas camera> below) - used to convert scrolled
// viewport-heights into world units for the page-locked rise.
const CAMERA_Z = 12;
const FOV = 45;
const HALF_FOV_TAN = Math.tan((FOV * Math.PI) / 180 / 2);

// Load entrance: each bird slides in from OFF-SCREEN LEFT, staggered, easing to
// its scroll-driven start position - so the flock sweeps in smoothly on load
// instead of popping into place.
const ENTRANCE_FROM = 16; // world units off-screen to the left
const ENTRANCE_DURATION = 2; // seconds for a bird to fully slide in
const ENTRANCE_STAGGER = 0.22; // seconds between successive birds

// SETTLE (journey progress at which the flock has fully arrived) is shared with
// the wrapper via ./constants. AFTER it, each bird's vertical position is LOCKED
// TO THE PAGE (see useFrame): it rises with the scroll so it scrolls up and away
// with the section like text, while the wing-flap keeps playing.

type BirdConfig = {
  url: string;
  size: number;
  z: number;
  /** Horizontal travel across the journey (world X at start -> end). */
  xStart: number;
  xEnd: number;
  /** Vertical travel: world Y at journey start (hero) and end (about bottom). */
  yStart: number;
  yEnd: number;
  /** Size multiplier across the journey (depth: grow = approach, shrink = recede). */
  scaleStart: number;
  scaleEnd: number;
  /** Lateral sway amplitude + speed (organic wander on top of the travel). */
  sway: [number, number];
  /** Idle vertical bob amplitude + speed. */
  bob: [number, number];
  /** Wing-flap playback speed. */
  flap: number;
  /** Phase offset so they don't sync. */
  phase: number;
};

// Each bird has its own independent parallax - different horizontal/vertical
// speeds and depths - so they drift apart rather than moving as one. All travel
// the SAME way (left -> right) so they face consistently. They all come to rest
// clustered in the MID-RIGHT of the frame (positive xEnd, yEnd near centre),
// spread a little so they don't overlap. Tweak xEnd/yEnd to reposition the
// resting flock; raise xEnd to push further right.
const FLOCK: BirdConfig[] = [
  // Near bird (foreground): glides in low, rests right-of-centre.
  {
    url: MODELS.parrot,
    size: 3.4,
    z: 1.6,
    xStart: -3.5,
    xEnd: 4.0,
    yStart: 3.4,
    yEnd: -1.2,
    scaleStart: 0.8,
    scaleEnd: 1.35,
    sway: [1.1, 0.5],
    bob: [0.5, 1.0],
    flap: 1.05,
    phase: 0,
  },
  // Mid bird: rests furthest right, slightly below centre.
  {
    url: MODELS.stork,
    size: 2.7,
    z: -0.8,
    xStart: -4.5,
    xEnd: 4.7,
    yStart: 1.8,
    yEnd: -2.5,
    scaleStart: 1.2,
    scaleEnd: 1.05,
    sway: [1.25, 0.38],
    bob: [0.45, 0.78],
    flap: 0.85,
    phase: 1.7,
  },
  // Far bird (back layer): rests upper-right, smaller (depth).
  {
    url: MODELS.flamingo,
    size: 2.0,
    z: -4,
    xStart: -1.5,
    xEnd: 3.4,
    yStart: 3.0,
    yEnd: -0.1,
    scaleStart: 0.65,
    scaleEnd: 1.0,
    sway: [0.95, 0.28],
    bob: [0.4, 0.66],
    flap: 0.7,
    phase: 3.2,
  },
];

function Bird({
  config,
  index,
  scrollRef,
  pastScrollRef,
  pointerRef,
  material,
}: {
  config: BirdConfig;
  index: number;
  scrollRef: RefObject<number>;
  pastScrollRef: RefObject<number>;
  pointerRef: RefObject<{ x: number; y: number }>;
  material: THREE.Material;
}) {
  const root = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(config.url);
  const { actions, names } = useAnimations(animations, root);

  // Center + normalise to a known wingspan and apply the shared material.
  const { scale, offset } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const s = config.size / maxDim;

    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.material = material;
        mesh.frustumCulled = false;
        mesh.castShadow = false;
        mesh.receiveShadow = false;
      }
    });

    return {
      scale: s,
      offset: new THREE.Vector3(-center.x * s, -center.y * s, -center.z * s),
    };
  }, [scene, config.size, material]);

  // Play the wing-flap clip.
  useEffect(() => {
    const first = names[0];
    if (!first) return;
    const action = actions[first];
    if (!action) return;
    action.reset().play();
    action.timeScale = config.flap;
    return () => {
      action.stop();
    };
  }, [actions, names, config.flap]);

  useFrame((state) => {
    const g = root.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const scroll = scrollRef.current ?? 0;
    const pointer = pointerRef.current ?? { x: 0, y: 0 };

    // Glide in from the hero and DECELERATE to a rest in the mid-right by the
    // time the journey is ~SETTLE through, then HOLD (travel clamps at 1) - the
    // flock never continues to the bottom. The sway/bob (clock-driven) keep
    // running while parked, so the stopped birds still hover and flap.
    const travel = THREE.MathUtils.clamp(scroll / SETTLE, 0, 1);
    const eased = 1 - Math.pow(1 - travel, 2.2); // easeOut: glide in, settle soft

    // Phase 2: once settled, the bird's VERTICAL position is LOCKED TO THE PAGE -
    // it rises by however many viewport-heights we've scrolled past the settle
    // point (visibleWorldH world units == one viewport tall at this depth), so it
    // scrolls up and away with the section exactly like the text. The flap + bob
    // keep running, so it stays alive while it scrolls off.
    const viewportsPast = pastScrollRef.current ?? 0;
    const visibleWorldH = 2 * (CAMERA_Z - config.z) * HALF_FOV_TAN;
    const pageRise = viewportsPast * visibleWorldH;

    // Entrance: slide in from off-screen LEFT once on load (staggered per bird),
    // easing to 0 so the flock sweeps smoothly into its start position.
    const entranceT = THREE.MathUtils.clamp(
      (t - index * ENTRANCE_STAGGER) / ENTRANCE_DURATION,
      0,
      1,
    );
    const entranceOffset = -Math.pow(1 - entranceT, 3) * ENTRANCE_FROM;

    const x =
      THREE.MathUtils.lerp(config.xStart, config.xEnd, eased) +
      Math.sin(t * config.sway[1] + config.phase) * config.sway[0] +
      pointer.x * (config.z > 0 ? 0.7 : 0.4) +
      entranceOffset;
    const y =
      THREE.MathUtils.lerp(config.yStart, config.yEnd, eased) +
      Math.cos(t * config.bob[1] + config.phase) * config.bob[0] +
      pointer.y * 0.2 +
      pageRise;

    g.position.set(x, y, config.z);

    // Size settles along with the glide-in (depth parallax).
    const s = THREE.MathUtils.lerp(config.scaleStart, config.scaleEnd, eased);
    g.scale.setScalar(s);

    // Face the bird's own travel direction so opposite-moving birds never look
    // reversed; bank into the side it's heading.
    const goingRight = config.xEnd >= config.xStart;
    g.rotation.y = goingRight ? FACE_YAW : FACE_YAW + Math.PI;
    const bank = Math.sin(t * config.sway[1] + config.phase) * 0.1;
    g.rotation.z = goingRight ? bank : -bank;
    g.rotation.x = -0.05 + Math.sin(t * config.bob[1]) * 0.05;
  });

  return (
    <group ref={root}>
      <primitive object={scene} scale={scale} position={offset} />
    </group>
  );
}

function Flock({
  scrollRef,
  pastScrollRef,
  colorRef,
  pointerRef,
}: {
  scrollRef: RefObject<number>;
  pastScrollRef: RefObject<number>;
  colorRef: RefObject<number>;
  pointerRef: RefObject<{ x: number; y: number }>;
}) {
  // One shared material whose colour/emissive lerps from silhouette to white.
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: SILHOUETTE.clone(),
        emissive: EMISSIVE_OFF.clone(),
        metalness: 0.3,
        roughness: 0.5,
        envMapIntensity: 1,
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);

  // Drive the black -> white transition once per frame (shared material).
  useFrame(() => {
    const c = THREE.MathUtils.clamp(colorRef.current ?? 0, 0, 1);
    material.color.lerpColors(SILHOUETTE, WHITE, c);
    material.emissive.lerpColors(EMISSIVE_OFF, EMISSIVE_ON, c);
  });

  return (
    <>
      {FLOCK.map((config, i) => (
        <Bird
          key={config.url}
          config={config}
          index={i}
          scrollRef={scrollRef}
          pastScrollRef={pastScrollRef}
          pointerRef={pointerRef}
          material={material}
        />
      ))}
    </>
  );
}

function Lighting() {
  return (
    <>
      {/* Bright enough that the lit (bronze) birds read clearly on black. */}
      <ambientLight intensity={0.7} />
      <spotLight
        position={[0, 9, 8]}
        angle={0.8}
        penumbra={1}
        intensity={260}
        distance={50}
        color="#fff3e0"
      />
      <directionalLight position={[-6, 3, 4]} intensity={2.2} color="#ffe8c8" />
      <directionalLight position={[5, -2, 2]} intensity={1} color="#bcd4ff" />
    </>
  );
}

export type BirdsSceneProps = {
  /** Journey progress 0..1 across hero->about (drives the glide-in). */
  scrollRef: RefObject<number>;
  /** Viewport-heights scrolled PAST the settle point (drives the page-locked rise). */
  pastScrollRef: RefObject<number>;
  /** About-enter progress 0..1 (drives black->bronze colour). */
  colorRef: RefObject<number>;
  pointerRef: RefObject<{ x: number; y: number }>;
  active: boolean;
  dpr?: number | [number, number];
};

export default function BirdsScene({
  scrollRef,
  pastScrollRef,
  colorRef,
  pointerRef,
  active,
  dpr = [1, 1.5],
}: BirdsSceneProps) {
  return (
    <Canvas
      dpr={dpr}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 12], fov: 45 }}
      style={{ pointerEvents: "none" }}
    >
      <Lighting />
      <Flock
        scrollRef={scrollRef}
        pastScrollRef={pastScrollRef}
        colorRef={colorRef}
        pointerRef={pointerRef}
      />
      <Environment resolution={128} environmentIntensity={0.6}>
        <Lightformer
          intensity={2.2}
          position={[0, 4, 4]}
          scale={[10, 5, 1]}
          color="#fff4e6"
        />
        <Lightformer
          intensity={1.5}
          position={[-5, 1, 2]}
          scale={[4, 8, 1]}
          color="#ffe8c8"
        />
      </Environment>
    </Canvas>
  );
}

useGLTF.preload(MODELS.parrot);
useGLTF.preload(MODELS.stork);
useGLTF.preload(MODELS.flamingo);
