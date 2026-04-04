import { useProgress } from '@react-three/drei';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
  CANVAS_CREATED_EVENT,
  HERO_READY_EVENT,
  dispatchLoadingComplete,
  SCENE_READY_EVENT,
} from './loadingEvents';

if (typeof document !== 'undefined') {
  const styleId = 'plupack-loading-critical';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .plupack-loading-screen {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100dvh !important;
        z-index: 2147483647 !important;
        margin: 0 !important;
        padding: 0 !important;
        box-sizing: border-box !important;
        overflow: hidden !important;
      }
      .plupack-loading-text {
        position: absolute !important;
        bottom: 32px !important;
        left: 32px !important;
        z-index: 20 !important;
        font-size: 128px !important;
        font-weight: 300 !important;
        letter-spacing: -0.05em !important;
        line-height: 1 !important;
        margin: 0 !important;
        padding: 0 !important;
        font-family: system-ui, -apple-system, sans-serif !important;
      }
      .plupack-loading-text--white {
        color: #ffffff !important;
      }
      .plupack-loading-text--blue {
        color: #084e85 !important;
      }
      @media (max-width: 768px) {
        .plupack-loading-text {
          font-size: 64px !important;
          bottom: 24px !important;
          left: 24px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

const COLS = 10;
const ROWS = 10;

function getDistanceFromCenter(index: number): number {
  const row = Math.floor(index / COLS);
  const col = index % COLS;
  const centerRow = (ROWS - 1) / 2;
  const centerCol = (COLS - 1) / 2;

  return Math.max(
    Math.abs(row - centerRow),
    Math.abs(col - centerCol),
  );
}

const MAX_DISTANCE = Math.max((ROWS - 1) / 2, (COLS - 1) / 2);

export function LoadingScreen() {
  const [phase, setPhase] = useState<'loading' | 'reveal' | 'done'>(
    'loading',
  );
  const [progress, setProgress] = useState(0);
  const [revealProgress, setRevealProgress] = useState(0);
  const [heroReady, setHeroReady] = useState(
    () => window.__PLUPACK_HERO_READY__ === true,
  );
  const [canvasCreated, setCanvasCreated] = useState(
    () => window.__PLUPACK_CANVAS_CREATED__ === true,
  );
  const [sceneReady, setSceneReady] = useState(
    () => window.__PLUPACK_SCENE_READY__ === true,
  );
  const [firstPaintComplete, setFirstPaintComplete] = useState(false);
  const [maxWaitElapsed, setMaxWaitElapsed] = useState(false);
  const [shouldStartReveal, setShouldStartReveal] = useState(false);
  const targetProgressRef = useRef(0);
  const hasStartedRevealRef = useRef(false);
  const { progress: assetProgress, total } = useProgress();

  useLayoutEffect(() => {
    const liquidLoader = document.getElementById(
      'liquid-loading-screen',
    );

    if (liquidLoader) {
      liquidLoader.style.display = 'none';
    }

    document.body.classList.add('react-loaded');
  }, []);

  useEffect(() => {
    const handleHeroReady = () => setHeroReady(true);
    const handleCanvasCreated = () => setCanvasCreated(true);
    const handleSceneReady = () => setSceneReady(true);

    window.addEventListener(HERO_READY_EVENT, handleHeroReady);
    window.addEventListener(CANVAS_CREATED_EVENT, handleCanvasCreated);
    window.addEventListener(SCENE_READY_EVENT, handleSceneReady);

    return () => {
      window.removeEventListener(HERO_READY_EVENT, handleHeroReady);
      window.removeEventListener(
        CANVAS_CREATED_EVENT,
        handleCanvasCreated,
      );
      window.removeEventListener(SCENE_READY_EVENT, handleSceneReady);
    };
  }, []);

  const readyForReveal =
    phase === 'loading' &&
    ((heroReady && firstPaintComplete) || maxWaitElapsed);

  useEffect(() => {
    let firstRaf = 0;
    let secondRaf = 0;

    firstRaf = window.requestAnimationFrame(() => {
      secondRaf = window.requestAnimationFrame(() => {
        setFirstPaintComplete(true);
      });
    });

    return () => {
      window.cancelAnimationFrame(firstRaf);
      window.cancelAnimationFrame(secondRaf);
    };
  }, []);

  useEffect(() => {
    if (phase !== 'loading') {
      return;
    }

    const maxWaitTimeoutId = window.setTimeout(() => {
      setMaxWaitElapsed(true);
    }, 1200);

    return () => {
      window.clearTimeout(maxWaitTimeoutId);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'loading') {
      return;
    }

    let target = 8;

    if (heroReady) {
      target = 24;
    }

    if (canvasCreated) {
      target = Math.max(target, 38);
    }

    if (total > 0) {
      const clampedAssetProgress = Math.max(
        0,
        Math.min(assetProgress, 100),
      );
      target = Math.max(
        target,
        38 + (clampedAssetProgress / 100) * 48,
      );
    } else if (canvasCreated) {
      target = Math.max(target, 50);
    }

    if (sceneReady) {
      target = Math.max(target, 92);
    }

    if (readyForReveal) {
      target = 100;
    }

    targetProgressRef.current = target;
  }, [
    assetProgress,
    canvasCreated,
    heroReady,
    phase,
    readyForReveal,
    sceneReady,
    total,
  ]);

  useEffect(() => {
    if (phase !== 'loading') {
      return;
    }

    let animationFrameId = 0;

    const animate = () => {
      setProgress((previousProgress) => {
        const targetProgress = targetProgressRef.current;

        if (previousProgress >= targetProgress) {
          return previousProgress;
        }

        const delta = Math.max(
          readyForReveal ? 1.25 : 0.35,
          (targetProgress - previousProgress) * 0.14,
        );

        return Math.min(previousProgress + delta, targetProgress);
      });

      animationFrameId = window.requestAnimationFrame(animate);
    };

    animationFrameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [phase, readyForReveal]);

  useEffect(() => {
    if (
      !readyForReveal ||
      phase !== 'loading' ||
      hasStartedRevealRef.current ||
      progress < 99.5
    ) {
      return;
    }

    hasStartedRevealRef.current = true;
    setShouldStartReveal(true);
  }, [phase, progress, readyForReveal]);

  useEffect(() => {
    if (!shouldStartReveal || phase !== 'loading') {
      return;
    }

    dispatchLoadingComplete();

    const revealDelayId = window.setTimeout(() => {
      setPhase('reveal');
    }, 120);

    return () => {
      window.clearTimeout(revealDelayId);
    };
  }, [phase, shouldStartReveal]);

  useEffect(() => {
    if (phase !== 'reveal') return;

    let startTime: number | null = null;
    let animationFrameId = 0;
    const duration = 850;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;

      const elapsed = timestamp - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - rawProgress, 2);

      setRevealProgress(easedProgress);

      if (rawProgress < 1) {
        animationFrameId = window.requestAnimationFrame(animate);
      } else {
        setPhase('done');
      }
    };

    animationFrameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [phase]);

  if (phase === 'done') return null;

  const displayedProgress = Math.round(progress);

  return createPortal(
    <div className="plupack-loading-screen">
      {phase === 'loading' && (
        <>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#084e85',
              clipPath: `inset(0 0 ${displayedProgress}% 0)`,
            }}
          >
            <div className="plupack-loading-text plupack-loading-text--white">
              {displayedProgress}%
            </div>
          </div>

          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#ffffff',
              clipPath: `inset(${100 - displayedProgress}% 0 0 0)`,
            }}
          >
            <div className="plupack-loading-text plupack-loading-text--blue">
              {displayedProgress}%
            </div>
          </div>
        </>
      )}

      {phase === 'reveal' && (
        <>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'grid',
              gridTemplateColumns: `repeat(${COLS}, 1fr)`,
              gridTemplateRows: `repeat(${ROWS}, 1fr)`,
              gap: 0,
              backgroundColor: 'transparent',
            }}
          >
            {Array.from({ length: ROWS * COLS }).map((_, i) => {
              const distance = getDistanceFromCenter(i);
              const normalizedDistance = distance / MAX_DISTANCE;
              const startThreshold = normalizedDistance * 0.6;
              const endThreshold = startThreshold + 0.4;

              let scale = 1;
              if (revealProgress > startThreshold) {
                const localProgress = Math.min(
                  (revealProgress - startThreshold) /
                    (endThreshold - startThreshold),
                  1,
                );
                scale = 1 - localProgress;
              }

              return (
                <div
                  key={i}
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#ffffff',
                    transform: `scale(${scale})`,
                  }}
                />
              );
            })}
          </div>

          <div
            className="plupack-loading-text plupack-loading-text--blue"
            style={{
              opacity: 1 - revealProgress,
            }}
          >
            100%
          </div>
        </>
      )}
    </div>,
    document.body,
  );
}
