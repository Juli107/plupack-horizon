import { Environment, Lightformer } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { dispatchSceneReady } from '../loadingEvents';
import { INDUSTRY_WORLD_Y } from './industryTimeline';
import { IndustryCylinder } from './IndustryCylinder';

// ============================================
// GLOBAL 3D SCENE
// ============================================
// All 3D elements positioned in world space
// Camera scrolls through them based on page scroll

type SceneProps = {
  isMobile: boolean;
  isTouchDevice: boolean;
  qualityTier: 'high' | 'balanced' | 'low';
};

function SceneReadySignal() {
  const hasDispatchedRef = useRef(false);

  useFrame(() => {
    if (hasDispatchedRef.current) {
      return;
    }

    hasDispatchedRef.current = true;
    dispatchSceneReady();
  });

  return null;
}

export function Scene({ isMobile, isTouchDevice, qualityTier }: SceneProps) {
  const mobileQualityTier = isMobile
    ? isTouchDevice
      ? 'low'
      : qualityTier
    : 'high';
  const environmentResolution =
    mobileQualityTier === 'low'
      ? 32
      : mobileQualityTier === 'balanced'
        ? 48
        : 64;
  const useReducedLights = mobileQualityTier !== 'high';
  const useMinimalLights = mobileQualityTier === 'low';

  return (
    <>
      <Environment
        background={false}
        resolution={isMobile ? environmentResolution : 128}
      >
        <Lightformer
          form="rect"
          intensity={isMobile ? 2.1 : 2.8}
          color="#f3f9ff"
          scale={[16, 10, 1]}
          position={[0, 2.8, 9]}
        />
        <Lightformer
          form="rect"
          intensity={isMobile ? 0.7 : 1}
          color="#b9e4ff"
          scale={[12, 6, 1]}
          position={[-8, 0, -6]}
          rotation={[0, Math.PI / 2.2, 0]}
        />
        <Lightformer
          form="rect"
          intensity={isMobile ? 1.35 : 1.8}
          color="#ffffff"
          scale={[10, 5, 1]}
          position={[0, -1.8, 8.5]}
        />
        <Lightformer
          form="ring"
          intensity={isMobile ? 0.35 : 0.55}
          color="#d7efff"
          scale={6}
          position={[0, -3, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
      </Environment>
      <ambientLight intensity={0.3} color="#dceaff" />
      <hemisphereLight
        intensity={useMinimalLights ? 0.46 : 0.54}
        color="#d9f5ff"
        groundColor="#3e5672"
      />

      <directionalLight
        color="#ffffff"
        intensity={isMobile ? 2.2 : 2.7}
        position={[8, INDUSTRY_WORLD_Y + 14.8, 14]}
      >
        <object3D attach="target" position={[0, INDUSTRY_WORLD_Y, 0]} />
      </directionalLight>

      <directionalLight
        color="#9cc6ff"
        intensity={isMobile ? (useReducedLights ? 0.35 : 0.55) : 0.75}
        position={[-12, INDUSTRY_WORLD_Y + 7.8, -10]}
      >
        <object3D attach="target" position={[0, INDUSTRY_WORLD_Y, 0]} />
      </directionalLight>

      {!useMinimalLights && (
        <directionalLight
          color="#fff4e3"
          intensity={isMobile ? (useReducedLights ? 0.56 : 0.8) : 1.15}
          position={[-4, INDUSTRY_WORLD_Y + 9.8, 14]}
        >
          <object3D
            attach="target"
            position={[-1.2, INDUSTRY_WORLD_Y + 0.4, 0]}
          />
        </directionalLight>
      )}

      {!useReducedLights && (
        <pointLight
          color="#8bdcff"
          intensity={isMobile ? 0.5 : 0.65}
          distance={40}
          decay={2}
          position={[-8, INDUSTRY_WORLD_Y + 7.8, -14]}
        />
      )}
      <spotLight
        castShadow={false}
        color="#f4fbff"
        intensity={isMobile ? 1.65 : 2}
        angle={0.48}
        penumbra={0.7}
        distance={54}
        decay={1.8}
        position={[2.8, INDUSTRY_WORLD_Y + 9.8, 16]}
      >
        <object3D attach="target" position={[0, INDUSTRY_WORLD_Y + 1, 0]} />
      </spotLight>

      {!useMinimalLights && (
        <spotLight
          castShadow={false}
          color="#a8dcff"
          intensity={isMobile ? (useReducedLights ? 0.54 : 0.78) : 1.08}
          angle={0.42}
          penumbra={0.9}
          distance={60}
          decay={2}
          position={[0, INDUSTRY_WORLD_Y + 4.3, -18]}
        >
          <object3D attach="target" position={[0, INDUSTRY_WORLD_Y + 1.3, 0]} />
        </spotLight>
      )}

      <group position={[0, INDUSTRY_WORLD_Y, 0]}>
        <IndustryCylinder
          isTouchDevice={isTouchDevice}
          qualityTier={mobileQualityTier}
        />
      </group>

      <SceneReadySignal />
    </>
  );
}
