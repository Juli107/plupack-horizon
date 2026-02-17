import { Environment } from '@react-three/drei';
import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { CAROUSEL_ITEMS, Carousel } from '../hero/Carousel';
import { preloadModels } from './Products';

const INDUSTRY_ITEM_NAMES = [
  'film_stretch.glb',
  'tape.glb',
  'carton.glb',
  'bubble_wrap.glb',
  'aluminum_roll.glb',
  'food_container.glb',
  'plastic_bag.glb',
  'plastic_wrap.glb',
  'paper_rolls.glb',
  'napkins.glb',
  'gloves.glb',
  'detergent.glb',
];

const INDUSTRY_PRELOAD_SCROLL_THRESHOLD = 0.42;

const IndustryCylinder = lazy(() =>
  import('./IndustryCylinder').then((module) => ({
    default: module.IndustryCylinder,
  })),
);

const cityEnvironment = import('@pmndrs/assets/hdri/city.exr').then(
  (module) => module.default as string
);

// ============================================
// GLOBAL 3D SCENE
// ============================================
// All 3D elements positioned in world space
// Camera scrolls through them based on page scroll

export function Scene() {
  const [environmentFile, setEnvironmentFile] = useState<string | null>(
    null
  );
  const [shouldRenderIndustryCylinder, setShouldRenderIndustryCylinder] =
    useState(false);
  const hasEnabledIndustryRef = useRef(false);

  useEffect(() => {
    preloadModels(CAROUSEL_ITEMS);

    const enableIndustryAssets = async () => {
      if (hasEnabledIndustryRef.current) {
        return;
      }

      hasEnabledIndustryRef.current = true;
      setShouldRenderIndustryCylinder(true);

      const { preloadIndustryWrapModel } = await import(
        './industryAssets'
      );
      preloadIndustryWrapModel();
      preloadModels(INDUSTRY_ITEM_NAMES);
    };

    const maybeEnableIndustryAssets = () => {
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      if (scrollableHeight <= 0) {
        return;
      }

      const scrollProgress = window.scrollY / scrollableHeight;
      if (scrollProgress >= INDUSTRY_PRELOAD_SCROLL_THRESHOLD) {
        void enableIndustryAssets();
      }
    };

    const preloadTimeoutId = window.setTimeout(() => {
      void enableIndustryAssets();
    }, 3500);

    window.addEventListener('scroll', maybeEnableIndustryAssets, {
      passive: true,
    });
    maybeEnableIndustryAssets();

    let mounted = true;
    cityEnvironment.then((file) => {
      if (mounted) {
        setEnvironmentFile(file);
      }
    });

    return () => {
      mounted = false;
      window.clearTimeout(preloadTimeoutId);
      window.removeEventListener('scroll', maybeEnableIndustryAssets);
    };
  }, []);

  return (
    <>
      {environmentFile ? <Environment files={environmentFile} /> : null}
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

      {/* Hero Section 3D Content (scroll position ~0) */}
      {/* Carousel positioned so it appears at the hero section */}
      <group position={[0, -7.6, 0]}>
        <Carousel radius={11} />
      </group>

      {shouldRenderIndustryCylinder ? (
        <group position={[0, -67.8, 0]}>
          <Suspense fallback={null}>
            <IndustryCylinder />
          </Suspense>
        </group>
      ) : null}
    </>
  );
}
