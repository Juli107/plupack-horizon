function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

export const INDUSTRY_WORLD_Y = -8;
const INDUSTRY_GLOBAL_SCROLL_START_PERCENT = 57;
const INDUSTRY_GLOBAL_SCROLL_END_PERCENT = 86;

export const INDUSTRY_TIMELINE = {
  sectionTrigger: {
    visibilityRange: {
      start: 'top bottom',
      end: 'bottom top',
    },
    progressRange: {
      start: 'top 45%',
      end: 'bottom top',
    },
  },
  cameraMotion: {
    industryStartPercent: 61,
    industryMidOnePercent: 69,
    industryMidTwoPercent: 78,
    industryEndPercent: 84,
  },
} as const;

function validateIndustryTimelineConfig() {
  const {
    industryStartPercent,
    industryMidOnePercent,
    industryMidTwoPercent,
    industryEndPercent,
  } = INDUSTRY_TIMELINE.cameraMotion;

  const isValidOrder =
    industryStartPercent < industryMidOnePercent &&
    industryMidOnePercent < industryMidTwoPercent &&
    industryMidTwoPercent < industryEndPercent;

  if (!isValidOrder) {
    throw new Error(
      'Invalid INDUSTRY_TIMELINE.cameraMotion order. Expected industryStart < industryMidOne < industryMidTwo < industryEnd.',
    );
  }
}

validateIndustryTimelineConfig();

export function mapIndustryProgressToGlobalScroll(progress: number) {
  const normalizedProgress = clamp01(progress);
  return (
    INDUSTRY_GLOBAL_SCROLL_START_PERCENT +
    (INDUSTRY_GLOBAL_SCROLL_END_PERCENT -
      INDUSTRY_GLOBAL_SCROLL_START_PERCENT) *
      normalizedProgress
  );
}

export function normalizeIndustrySectionProgress(progress: number) {
  return clamp01(progress);
}
