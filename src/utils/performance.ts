import { useEffect, useMemo, useState, type DependencyList } from 'react';

export type PerformanceProfile = {
  isMobile: boolean;
  isLowEnd: boolean;
  prefersReducedMotion: boolean;
  particleScale: number;
  confettiScale: number;
};

const getProfile = (): PerformanceProfile => {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isLowEnd: false,
      prefersReducedMotion: false,
      particleScale: 1,
      confettiScale: 1,
    };
  }

  const nav = window.navigator as Navigator & {
    deviceMemory?: number;
    hardwareConcurrency?: number;
  };
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const isSmallScreen = window.matchMedia('(max-width: 768px)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasLimitedMemory = typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4;
  const hasLimitedCpu = typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4;
  const isMobile = isCoarsePointer || isSmallScreen;
  const isLowEnd = prefersReducedMotion || hasLimitedMemory || hasLimitedCpu || (isMobile && window.devicePixelRatio > 2.5);

  return {
    isMobile,
    isLowEnd,
    prefersReducedMotion,
    particleScale: isLowEnd ? 0.5 : isMobile ? 0.72 : 1,
    confettiScale: isLowEnd ? 0.45 : isMobile ? 0.65 : 1,
  };
};

export const usePerformanceProfile = () => {
  const [profile, setProfile] = useState(getProfile);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => setProfile(getProfile()));
    };

    window.addEventListener('resize', update, { passive: true });
    window.addEventListener('orientationchange', update, { passive: true });

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  return profile;
};

export const useDocumentVisible = () => {
  const [isVisible, setIsVisible] = useState(() => typeof document === 'undefined' || !document.hidden);

  useEffect(() => {
    const update = () => setIsVisible(!document.hidden);
    document.addEventListener('visibilitychange', update, { passive: true });
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  return isVisible;
};

export const useStableParticles = <T>(factory: () => T[], deps: DependencyList = []) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
};
