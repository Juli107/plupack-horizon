import { Environment, Lightformer } from '@react-three/drei';
import { useEffect } from 'react';
import {
  INDUSTRY_ITEM_NAMES,
  preloadIndustryWrapModel,
} from './industryAssets';
import { IndustryCylinder } from './IndustryCylinder';
import { preloadModels } from './Products';

// ============================================
// GLOBAL 3D SCENE
// ============================================
// All 3D elements positioned in world space
// Camera scrolls through them based on page scroll

type SceneProps = {
  isMobile: boolean;
};

export function Scene({ isMobile }: SceneProps) {
  useEffect(() => {
    const preloadTimeoutId = window.setTimeout(() => {
      preloadIndustryWrapModel();
      preloadModels(INDUSTRY_ITEM_NAMES);
    }, 1200);

    return () => {
      window.clearTimeout(preloadTimeoutId);
    };
  }, []);

  return (
    <>
      <Environment background={false} resolution={isMobile ? 64 : 128}>
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
        intensity={0.54}
        color="#d9f5ff"
        groundColor="#3e5672"
      />

      <directionalLight
        castShadow
        color="#ffffff"
        intensity={isMobile ? 2.2 : 2.7}
        position={[8, -53, 14]}
        shadow-mapSize-width={isMobile ? 512 : 1024}
        shadow-mapSize-height={isMobile ? 512 : 1024}
        shadow-bias={-0.00015}
        shadow-normalBias={0.02}
        shadow-camera-near={1}
        shadow-camera-far={120}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
      >
        <object3D attach="target" position={[0, -67.8, 0]} />
      </directionalLight>

      <directionalLight
        color="#9cc6ff"
        intensity={isMobile ? 0.55 : 0.75}
        position={[-12, -60, -10]}
      >
        <object3D attach="target" position={[0, -67.8, 0]} />
      </directionalLight>

      <directionalLight
        color="#fff4e3"
        intensity={isMobile ? 0.8 : 1.15}
        position={[-4, -58, 14]}
      >
        <object3D attach="target" position={[-1.2, -67.4, 0]} />
      </directionalLight>

      <pointLight
        color="#8bdcff"
        intensity={isMobile ? 0.5 : 0.65}
        distance={40}
        decay={2}
        position={[-8, -60, -14]}
      />
      <spotLight
        castShadow={false}
        color="#f4fbff"
        intensity={isMobile ? 1.65 : 2}
        angle={0.48}
        penumbra={0.7}
        distance={54}
        decay={1.8}
        position={[2.8, -58, 16]}
      >
        <object3D attach="target" position={[0, -66.8, 0]} />
      </spotLight>

      <spotLight
        castShadow={false}
        color="#a8dcff"
        intensity={isMobile ? 0.78 : 1.08}
        angle={0.42}
        penumbra={0.9}
        distance={60}
        decay={2}
        position={[0, -63.5, -18]}
      >
        <object3D attach="target" position={[0, -66.5, 0]} />
      </spotLight>

      <mesh
        position={[0, -72.4, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[36, 36]} />
        <shadowMaterial opacity={isMobile ? 0.2 : 0.28} />
      </mesh>

      <group position={[0, -67.8, 0]}>
        <IndustryCylinder />
      </group>
    </>
  );
}
