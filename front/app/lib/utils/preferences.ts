/**
 * Check if the user has enabled the prefers-reduced-motion media query.
 */
export const hasPrefersReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') {
    return false;
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};
