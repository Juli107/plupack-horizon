import { Canvas } from '@react-three/fiber';
import { useEffect, useMemo, useState } from 'react';
import { PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import { ScrollCamera } from './canvas/ScrollCamera';
import { Scene } from './canvas/Scene';
import { dispatchCanvasCreated } from './loadingEvents';

// ============================================
// GLOBAL CANVAS COMPONENT
// ============================================
// Fixed viewport-sized canvas that stays in place
// while content scrolls over/under it

export function GlobalCanvas() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [dynamicDprMax, setDynamicDprMax] = useState(2);

  const targetDprMax = isMobile ? 1.25 : 2;

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobile(mediaQuery.matches);

    update();
    mediaQuery.addEventListener('change', update);

    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const update = () => {
      setIsTouchDevice(
        window.matchMedia('(pointer: coarse)').matches ||
          window.matchMedia('(hover: none)').matches ||
          navigator.maxTouchPoints > 0,
      );
    };

    update();

    const coarsePointerQuery = window.matchMedia('(pointer: coarse)');
    const hoverQuery = window.matchMedia('(hover: none)');

    coarsePointerQuery.addEventListener('change', update);
    hoverQuery.addEventListener('change', update);

    return () => {
      coarsePointerQuery.removeEventListener('change', update);
      hoverQuery.removeEventListener('change', update);
    };
  }, []);

  const dpr = useMemo<[number, number]>(
    () => [1, Math.min(dynamicDprMax, targetDprMax)],
    [dynamicDprMax, targetDprMax]
  );

  useEffect(() => {
    setDynamicDprMax(targetDprMax);
  }, [targetDprMax]);

  return (
    <div className="fixed inset-0 z-10 pointer-events-none w-screen h-screen">
      <Canvas
        dpr={dpr}
        performance={{ min: 0.6 }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = isMobile ? 1.2 : 1.36;
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.shadowMap.enabled = false;

          if (window.__PLUPACK_CANVAS_CREATED__) {
            return;
          }

          window.__PLUPACK_CANVAS_READY__ = true;
          dispatchCanvasCreated();
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
            setDynamicDprMax((prev) => Math.max(1, prev - 0.2));
          }}
          onIncline={() => {
            setDynamicDprMax((prev) =>
              Math.min(targetDprMax, prev + 0.2)
            );
          }}
        />
        {/* Camera is controlled by ScrollCamera using keyframes */}
        <ScrollCamera isMobile={isMobile} isTouchDevice={isTouchDevice} />
        <Scene isMobile={isMobile} isTouchDevice={isTouchDevice} />
      </Canvas>
    </div>
  );
}
