function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

export const INDUSTRY_TIMELINE = {
  world: {
    anchorY: -8,
  },
  sectionTrigger: {
    visibilityRange: {
      start: 'top bottom',
      end: 'bottom top',
    },
    progressRange: {
      start: 'top top',
      end: 'bottom top',
    },
  },
  cameraRemap: {
    globalScrollRange: {
      startPercent: 56,
      endPercent: 86,
    },
  },
  cameraMotion: {
    preIndustryHoldPercent: 58,
    industryStartPercent: 60,
    industryMidOnePercent: 67,
    industryMidTwoPercent: 74,
    industryEndPercent: 86,
    minTargetDistance: 8,
  },
} as const;

function validateIndustryTimelineConfig() {
  const {
    preIndustryHoldPercent,
    industryStartPercent,
    industryMidOnePercent,
    industryMidTwoPercent,
    industryEndPercent,
  } = INDUSTRY_TIMELINE.cameraMotion;

  const isValidOrder =
    preIndustryHoldPercent < industryStartPercent &&
    industryStartPercent < industryMidOnePercent &&
    industryMidOnePercent < industryMidTwoPercent &&
    industryMidTwoPercent < industryEndPercent;

  if (!isValidOrder) {
    throw new Error(
      'Invalid INDUSTRY_TIMELINE.cameraMotion order. Expected preIndustryHold < industryStart < industryMidOne < industryMidTwo < industryEnd.',
    );
  }
}

validateIndustryTimelineConfig();

export function mapIndustryProgressToGlobalScroll(progress: number) {
  const normalizedProgress = clamp01(progress);
  const { startPercent, endPercent } =
    INDUSTRY_TIMELINE.cameraRemap.globalScrollRange;
  return (
    startPercent + (endPercent - startPercent) * normalizedProgress
  );
}

export function mapGlobalScrollToIndustryProgress(scrollPercent: number) {
  const { startPercent, endPercent } =
    INDUSTRY_TIMELINE.cameraRemap.globalScrollRange;
  const span = endPercent - startPercent;

  if (span <= 0) {
    return 0;
  }

  return clamp01((scrollPercent - startPercent) / span);
}

export function normalizeIndustrySectionProgress(progress: number) {
  return clamp01(progress);
}

export function isWithinIndustryGlobalScroll(scrollPercent: number) {
  const { startPercent, endPercent } =
    INDUSTRY_TIMELINE.cameraRemap.globalScrollRange;
  return scrollPercent >= startPercent && scrollPercent <= endPercent;
}
