import { Canvas } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import { ScrollCamera } from './canvas/ScrollCamera';
import { Scene } from './canvas/Scene';
import { dispatchCanvasCreated } from './loadingEvents';

type QualityTier = 'high' | 'balanced' | 'low';

const QUALITY_LEVELS: QualityTier[] = ['high', 'balanced', 'low'];

// ============================================
// GLOBAL CANVAS COMPONENT
// ============================================
// Fixed viewport-sized canvas that stays in place
// while content scrolls over/under it

export function GlobalCanvas() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [dynamicDprMax, setDynamicDprMax] = useState(2);
  const [qualityTier, setQualityTier] = useState<QualityTier>('high');

  const declineStreakRef = useRef(0);
  const inclineStreakRef = useRef(0);

  const targetDprMax = isMobile
    ? isTouchDevice
      ? 1
      : 1.25
    : 2;

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

  useEffect(() => {
    if (!isMobile) {
      setQualityTier('high');
      declineStreakRef.current = 0;
      inclineStreakRef.current = 0;
      return;
    }

    setQualityTier(isTouchDevice ? 'low' : 'high');
    declineStreakRef.current = 0;
    inclineStreakRef.current = 0;
  }, [isMobile, isTouchDevice]);

  const downgradeQualityTier = () => {
    setQualityTier((prev) => {
      const currentIndex = QUALITY_LEVELS.indexOf(prev);
      const nextIndex = Math.min(currentIndex + 1, QUALITY_LEVELS.length - 1);
      return QUALITY_LEVELS[nextIndex] ?? prev;
    });
  };

  const upgradeQualityTier = () => {
    setQualityTier((prev) => {
      const currentIndex = QUALITY_LEVELS.indexOf(prev);
      const nextIndex = Math.max(currentIndex - 1, 0);
      return QUALITY_LEVELS[nextIndex] ?? prev;
    });
  };

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

            if (!isMobile) {
              return;
            }

            declineStreakRef.current += 1;
            inclineStreakRef.current = 0;

            if (declineStreakRef.current >= 2) {
              downgradeQualityTier();
              declineStreakRef.current = 0;
            }
          }}
          onIncline={() => {
            setDynamicDprMax((prev) =>
              Math.min(targetDprMax, prev + 0.2)
            );

            if (!isMobile) {
              return;
            }

            inclineStreakRef.current += 1;
            declineStreakRef.current = 0;

            if (inclineStreakRef.current >= 3) {
              upgradeQualityTier();
              inclineStreakRef.current = 0;
            }
          }}
        />
        {/* Camera is controlled by ScrollCamera using keyframes */}
        <ScrollCamera isMobile={isMobile} isTouchDevice={isTouchDevice} />
        <Scene
          isMobile={isMobile}
          isTouchDevice={isTouchDevice}
          qualityTier={qualityTier}
        />
      </Canvas>
    </div>
  );
}
