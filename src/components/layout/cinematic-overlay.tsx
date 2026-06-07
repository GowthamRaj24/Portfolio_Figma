/**
 * Site-wide cinematic grade: a soft vignette + animated film grain laid over
 * the entire page (below the navbar/loader). This is the single biggest thing
 * that makes the hero and every dark section read as ONE graded film rather
 * than separate pages. Fixed + pointer-events-none, so it never interferes.
 */
export function CinematicOverlay() {
  return (
    <>
      <div aria-hidden className="vignette pointer-events-none fixed inset-0 z-40" />
      <div
        aria-hidden
        className="film-grain pointer-events-none fixed -inset-[20%] z-40"
      />
    </>
  );
}
