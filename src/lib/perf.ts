/**
 * Device performance tiering. Used to scale DOWN expensive effects (WebGL
 * resolution, particle counts, backdrop-blur, grain) on phones / low-end
 * hardware WITHOUT removing any of the animations. Desktop stays full quality.
 *
 * All checks are SSR-safe (return the desktop/full answer when there is no
 * window) and cheap (matchMedia / navigator reads, no listeners here).
 */

export function isCoarsePointer(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

export function isSmallScreen(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(max-width: 768px)").matches;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * The "mobile / low-power" tier: a touch device, a small screen, few CPU cores,
 * or little RAM. Heavy WebGL + blur should be dialed back when this is true.
 */
export function isMobileTier(): boolean {
  if (typeof window === "undefined") return false;
  const cores = navigator.hardwareConcurrency || 8;
  // deviceMemory is non-standard but widely available on Android Chrome.
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  return isCoarsePointer() || isSmallScreen() || cores <= 4 || mem <= 4;
}

/** Effective device-pixel-ratio cap for a WebGL surface, by tier. */
export function webglPixelRatio(): number {
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  return isMobileTier() ? Math.min(dpr, 1) : Math.min(dpr, 1.5);
}
