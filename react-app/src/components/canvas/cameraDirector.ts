import { mapIndustryProgressToGlobalScroll } from './industryTimeline';

type CameraDirectorState = {
  pageScrollPercent: number;
  industryProgress: number;
  industrySectionProgress: number;
  industryVisible: boolean;
  industryActive: boolean;
};

const state: CameraDirectorState = {
  pageScrollPercent: 0,
  industryProgress: 0,
  industrySectionProgress: 0,
  industryVisible: false,
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

export function setCameraDirectorIndustrySectionProgress(value: number) {
  state.industrySectionProgress = clamp01(value);
}

export function setCameraDirectorIndustryVisible(value: boolean) {
  state.industryVisible = value;
}

export function setCameraDirectorIndustryActive(value: boolean) {
  state.industryActive = value;
}

export function getCameraDirectorEffectiveScrollPercent() {
  if (!state.industryActive) {
    return state.pageScrollPercent;
  }

  return mapIndustryProgressToGlobalScroll(state.industryProgress);
}

export function getCameraDirectorDebugState() {
  return {
    pageScrollPercent: state.pageScrollPercent,
    industryProgress: state.industryProgress,
    industrySectionProgress: state.industrySectionProgress,
    industryVisible: state.industryVisible,
    industryActive: state.industryActive,
    effectiveScrollPercent: getCameraDirectorEffectiveScrollPercent(),
  };
}
