// Shared bird constants. Kept in their own module (no three.js / R3F imports) so
// the lightweight wrapper (birds.tsx) and the heavy WebGL scene (birds-scene.tsx)
// can both import them without the wrapper pulling the 3D bundle in eagerly.

/**
 * Journey progress (0..1 across hero -> about) at which the flock has fully
 * arrived at its resting spot. AFTER this, each bird's vertical position is
 * locked to the page scroll, so it scrolls up and away with the section.
 */
export const SETTLE = 0.7;
