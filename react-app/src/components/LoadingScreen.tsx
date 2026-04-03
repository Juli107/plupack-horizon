import { useEffect, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// Immediately inject critical CSS
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

// Calculate distance from center for each cell
function getDistanceFromCenter(index: number): number {
  const row = Math.floor(index / COLS);
  const col = index % COLS;
  const centerRow = (ROWS - 1) / 2;
  const centerCol = (COLS - 1) / 2;
  // Chebyshev distance (max of row/col distance) for square ripple
  return Math.max(
    Math.abs(row - centerRow),
    Math.abs(col - centerCol),
  );
}

// Max distance is from center to corner
const MAX_DISTANCE = Math.max((ROWS - 1) / 2, (COLS - 1) / 2);

export function LoadingScreen() {
  const [phase, setPhase] = useState<'loading' | 'reveal' | 'done'>(
    'loading',
  );
  const [progress, setProgress] = useState(0);
  const [revealProgress, setRevealProgress] = useState(0);
  const [isProgressComplete, setIsProgressComplete] = useState(false);

  // Hide Liquid loading screen and mark as React loaded
  useLayoutEffect(() => {
    // Hide the Liquid loading screen immediately
    const liquidLoader = document.getElementById(
      'liquid-loading-screen',
    );
    if (liquidLoader) {
      liquidLoader.style.display = 'none';
    }
    // Add class to body so CSS knows React has loaded
    document.body.classList.add('react-loaded');
  }, []);

  // Phase 1: Animate progress from 0 to 100 - step by step
  useEffect(() => {
    const duration = 1000; // Total time for 0-100
    const stepTime = duration / 100; // Time per number (10ms each)
    let currentProgress = 0;

    const interval = setInterval(() => {
      currentProgress += 1;
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsProgressComplete(true);
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (phase === 'loading' && isProgressComplete) {
      const revealDelayId = window.setTimeout(() => {
        setPhase('reveal');
      }, 300);

      return () => {
        window.clearTimeout(revealDelayId);
      };
    }

    return;
  }, [isProgressComplete, phase]);

  // Phase 2: Ripple reveal animation
  useEffect(() => {
    if (phase !== 'reveal') return;

    let startTime: number | null = null;
    const duration = 1000;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);
      // Ease out for smooth deceleration
      const easedProgress = 1 - Math.pow(1 - rawProgress, 2);

      setRevealProgress(easedProgress);

      if (rawProgress < 1) {
        requestAnimationFrame(animate);
      } else {
        setPhase('done');
      }
    };

    requestAnimationFrame(animate);
  }, [phase]);

  if (phase === 'done') return null;

  return createPortal(
    <div className="plupack-loading-screen">
      {/* Phase 1: Loading progress */}
      {phase === 'loading' && (
        <>
          {/* Blue background with white text - shrinks from bottom */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#084e85',
              clipPath: `inset(0 0 ${progress}% 0)`,
            }}
          >
            <div className="plupack-loading-text plupack-loading-text--white">
              {progress}%
            </div>
          </div>

          {/* White area revealed from bottom with blue text */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#ffffff',
              clipPath: `inset(${100 - progress}% 0 0 0)`,
            }}
          >
            <div className="plupack-loading-text plupack-loading-text--blue">
              {progress}%
            </div>
          </div>
        </>
      )}

      {/* Phase 2: Square grid ripple from center - transparent bg reveals content */}
      {phase === 'reveal' && (
        <>
          {/* Grid of squares - white squares on transparent background */}
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
              // Normalize distance to 0-1 range
              const normalizedDistance = distance / MAX_DISTANCE;
              // Calculate when this square should start and end its animation
              // Squares closer to center animate first
              const startThreshold = normalizedDistance * 0.6; // stagger start times
              const endThreshold = startThreshold + 0.4; // each square takes 0.4 of the total time

              // Calculate scale for this square based on current progress
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

          {/* Text fading out */}
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
