import { useLenis } from 'lenis/react';
import { useRef } from 'react';
import { cameraKeyframes, findSurroundingKeyframes } from './canvas/cameraKeyframes';
import { getCameraDirectorDebugState } from './canvas/cameraDirector';

export function ScrollDebugger() {
  const elementRef = useRef<HTMLDivElement>(null);

  useLenis(({ scroll, limit }) => {
    if (elementRef.current) {
      const p = limit > 0 ? (scroll / limit) * 100 : 0;
      const pageScroll = Math.min(Math.max(p, 0), 100);
      const debugState = getCameraDirectorDebugState();
      const { from, to, t } = findSurroundingKeyframes(
        debugState.effectiveScrollPercent,
        cameraKeyframes,
      );

      elementRef.current.textContent = [
        `Page ${pageScroll.toFixed(1)}%`,
        `Eff ${debugState.effectiveScrollPercent.toFixed(1)}%`,
        `IndCam ${debugState.industryProgress.toFixed(3)} (${debugState.industryActive ? 'on' : 'off'})`,
        `IndSec ${debugState.industrySectionProgress.toFixed(3)}`,
        `IndVis ${debugState.industryVisible ? 'on' : 'off'}`,
        `KF ${from.scrollPercent} -> ${to.scrollPercent} (t=${t.toFixed(3)})`,
      ].join('\n');
    }
  });

  return (
    <div
      ref={elementRef}
      className="fixed top-24 right-4 z-[9999] bg-black/80 text-white px-3 py-2 rounded font-mono text-xs whitespace-pre pointer-events-none mix-blend-difference"
    >
      Page 0.0%
      {'\n'}Eff 0.0%
      {'\n'}IndCam 0.000 (off)
      {'\n'}IndSec 0.000
      {'\n'}IndVis off
      {'\n'}KF 0 -&gt; 0 (t=0.000)
    </div>
  );
}
