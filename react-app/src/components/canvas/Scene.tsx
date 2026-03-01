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

export function Scene() {
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
        <Environment files={environmentFile} />
      ) : null}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      {/* Additional lights for the cylinder */}
      <pointLight
        position={[-5, 0, 5]}
        intensity={0.5}
        color="#4a90a4"
      />
      <pointLight
        position={[5, -2, 3]}
        intensity={0.3}
        color="#ffffff"
      />

      <group position={[0, -67.8, 0]}>
        <IndustryCylinder />
      </group>
    </>
  );
}
