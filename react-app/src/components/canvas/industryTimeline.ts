function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

export const INDUSTRY_TIMELINE = {
  trigger: {
    visibilityStart: 'top bottom',
    visibilityEnd: 'bottom top',
    progressStart: 'top top',
    progressEnd: 'bottom top',
  },
  pageScroll: {
    start: 62,
    end: 86,
  },
  keyframes: {
    hold: 61.5,
    start: 62,
    midOne: 67,
    midTwo: 74,
    end: 86,
  },
  camera: {
    minTargetDistance: 8,
  },
} as const;

export function getIndustryPageScrollFromProgress(progress: number) {
  const normalizedProgress = clamp01(progress);
  const { start, end } = INDUSTRY_TIMELINE.pageScroll;
  return start + (end - start) * normalizedProgress;
}

export function mapIndustrySectionProgress(progress: number) {
  return clamp01(progress);
}

export function isIndustryScrollPercent(scrollPercent: number) {
  const { start, end } = INDUSTRY_TIMELINE.pageScroll;
  return scrollPercent >= start && scrollPercent <= end;
}
