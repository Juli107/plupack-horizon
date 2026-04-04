export const HERO_READY_EVENT = 'plupack:hero-ready';
export const CANVAS_CREATED_EVENT = 'plupack:canvas-created';
export const SCENE_READY_EVENT = 'plupack:scene-ready';
export const LOADING_COMPLETE_EVENT = 'plupack:loading-complete';

type LoadingFlag =
  | '__PLUPACK_HERO_READY__'
  | '__PLUPACK_CANVAS_CREATED__'
  | '__PLUPACK_SCENE_READY__'
  | '__PLUPACK_LOADING_COMPLETE__';

function markLoadingFlag(flag: LoadingFlag) {
  window[flag] = true;
}

export function dispatchHeroReady() {
  markLoadingFlag('__PLUPACK_HERO_READY__');
  window.dispatchEvent(new Event(HERO_READY_EVENT));
}

export function dispatchCanvasCreated() {
  markLoadingFlag('__PLUPACK_CANVAS_CREATED__');
  window.dispatchEvent(new Event(CANVAS_CREATED_EVENT));
}

export function dispatchSceneReady() {
  markLoadingFlag('__PLUPACK_SCENE_READY__');
  window.dispatchEvent(new Event(SCENE_READY_EVENT));
}

export function dispatchLoadingComplete() {
  markLoadingFlag('__PLUPACK_LOADING_COMPLETE__');
  window.dispatchEvent(new Event(LOADING_COMPLETE_EVENT));
}
