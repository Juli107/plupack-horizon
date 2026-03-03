import { Canvas } from '@react-three/fiber';
import { useEffect, useMemo, useState } from 'react';
import { PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import { ScrollCamera } from './canvas/ScrollCamera';
import { Scene } from './canvas/Scene';

const CANVAS_READY_EVENT = 'plupack:canvas-ready';

// ============================================
// GLOBAL CANVAS COMPONENT
// ============================================
// Fixed viewport-sized canvas that stays in place
// while content scrolls over/under it

export function GlobalCanvas() {
  const [isMobile, setIsMobile] = useState(false);
  const [dynamicDprMax, setDynamicDprMax] = useState(2);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobile(mediaQuery.matches);

    update();
    mediaQuery.addEventListener('change', update);

    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  const dpr = useMemo<[number, number]>(
    () => (isMobile ? [1, Math.min(dynamicDprMax, 1.4)] : [1, dynamicDprMax]),
    [dynamicDprMax, isMobile]
  );

  useEffect(() => {
    setDynamicDprMax(isMobile ? 1.4 : 2);
  }, [isMobile]);

  return (
    <div className="fixed inset-0 z-10 pointer-events-none w-screen h-screen">
      <Canvas
        dpr={dpr}
        shadows
        performance={{ min: 0.6 }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = isMobile ? 1.2 : 1.36;
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = isMobile
            ? THREE.BasicShadowMap
            : THREE.PCFSoftShadowMap;

          if (window.__PLUPACK_CANVAS_READY__) {
            return;
          }

          window.__PLUPACK_CANVAS_READY__ = true;
          window.dispatchEvent(new Event(CANVAS_READY_EVENT));
        }}
        gl={{
          antialias: !isMobile,
          alpha: true,
          powerPreference: isMobile ? 'default' : 'high-performance',
          stencil: false,
        }}
        className="bg-transparent pointer-events-none"
      >
        <PerformanceMonitor
          onDecline={() => {
            setDynamicDprMax((prev) => Math.max(1, prev - 0.25));
          }}
          onIncline={() => {
            setDynamicDprMax((prev) =>
              Math.min(isMobile ? 1.4 : 2, prev + 0.25)
            );
          }}
        />
        {/* Camera is controlled by ScrollCamera using keyframes */}
        <ScrollCamera />
        <Scene isMobile={isMobile} />
      </Canvas>
    </div>
  );
}
