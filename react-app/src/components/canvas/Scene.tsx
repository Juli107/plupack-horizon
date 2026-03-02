import { Environment } from '@react-three/drei';
import { useEffect, useState } from 'react';
import {
  INDUSTRY_ITEM_NAMES,
  preloadIndustryWrapModel,
} from './industryAssets';
import { IndustryCylinder } from './IndustryCylinder';
import { preloadModels } from './Products';

const cityEnvironment = import('@pmndrs/assets/hdri/city.exr').then(
  (module) => module.default as string,
);

// ============================================
// GLOBAL 3D SCENE
// ============================================
// All 3D elements positioned in world space
// Camera scrolls through them based on page scroll

type SceneProps = {
  isMobile: boolean;
};

export function Scene({ isMobile }: SceneProps) {
  const [environmentFile, setEnvironmentFile] = useState<
    string | null
  >(null);

  useEffect(() => {
    const preloadTimeoutId = window.setTimeout(() => {
      preloadIndustryWrapModel();
      preloadModels(INDUSTRY_ITEM_NAMES);
    }, 1200);

    let mounted = true;
    cityEnvironment.then((file) => {
      if (mounted) {
        setEnvironmentFile(file);
      }
    });

    return () => {
      mounted = false;
      window.clearTimeout(preloadTimeoutId);
    };
  }, []);

  return (
    <>
      {environmentFile ? (
        <Environment files={environmentFile} background={false} />
      ) : null}
      <ambientLight intensity={0.18} color="#c8d8ff" />
      <hemisphereLight
        intensity={0.34}
        color="#d9f5ff"
        groundColor="#3e5672"
      />

      <directionalLight
        castShadow
        color="#ffffff"
        intensity={isMobile ? 1.35 : 1.65}
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
        intensity={isMobile ? 1.35 : 1.6}
        angle={0.48}
        penumbra={0.7}
        distance={54}
        decay={1.8}
        position={[2.8, -58, 16]}
      >
        <object3D attach="target" position={[0, -66.8, 0]} />
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
