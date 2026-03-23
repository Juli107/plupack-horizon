const INDUSTRY_PAGE_SCROLL_START = 58;
const INDUSTRY_PAGE_SCROLL_END = 78;

type CameraDirectorState = {
  pageScrollPercent: number;
  industryProgress: number;
  industryActive: boolean;
};

const state: CameraDirectorState = {
  pageScrollPercent: 0,
  industryProgress: 0,
  industryActive: false,
};

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

export function setCameraDirectorPageScrollPercent(value: number) {
  state.pageScrollPercent = clampPercent(value);
}

export function setCameraDirectorIndustryProgress(value: number) {
  state.industryProgress = clamp01(value);
}

export function setCameraDirectorIndustryActive(value: boolean) {
  state.industryActive = value;
}

export function getCameraDirectorEffectiveScrollPercent() {
  if (!state.industryActive) {
    return state.pageScrollPercent;
  }

  return (
    INDUSTRY_PAGE_SCROLL_START +
    (INDUSTRY_PAGE_SCROLL_END - INDUSTRY_PAGE_SCROLL_START) *
      state.industryProgress
  );
}
