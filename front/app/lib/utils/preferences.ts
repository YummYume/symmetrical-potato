export const hasPrefersReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') {
    return false;
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};
