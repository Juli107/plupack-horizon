import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { RenderProduct } from './Products';
import { industryWrapUrl } from './industryAssets';
import { getCameraDirectorDebugState } from './cameraDirector';

const PRE_ROTATE_LIFT_START_OFFSET_Y = -3;
const PRE_ROTATE_LIFT_END_OFFSET_Y = 0;
const PRE_ROTATE_LIFT_END_INDUSTRY_PROGRESS = 0.13;

// Helper types for individual item configuration
type ItemConfig = {
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
};

type QualityTier = 'high' | 'balanced' | 'low';

type IndustryCylinderProps = {
  isTouchDevice: boolean;
  qualityTier: QualityTier;
};

// Manually defined positions based on previous circular logic (radius ~1.8)
// User can now tweak each item individually.
const TOP_ITEMS: ItemConfig[] = [
  {
    name: 'film_stretch.glb',
    position: [-2.1, 11.5, 0],
    rotation: [-0.2, 3, -0.3],
  },
  {
    name: 'tape.glb',
    position: [-0.1, 10.5, 0.2],
    rotation: [0.3, -3, 0],
  },
  {
    name: 'carton.glb',
    position: [1.4, 12, 1],
    rotation: [0.6, -Math.PI / 1.7, 0],
  },
  {
    name: 'bubble_wrap.glb',
    position: [-0.5, 12.4, 2.3],
    rotation: [0.7, 0, 0],
  },
];

const MID_ITEMS: ItemConfig[] = [
  {
    name: 'aluminum_roll.glb',
    position: [1.8, 3.5, 1],
    rotation: [0, -0.7, 1],
  },
  {
    name: 'food_container.glb',
    position: [0.8, 5.2, 0],
    rotation: [-0.6, -2.09, 0],
  },
  {
    name: 'plastic_bag.glb',
    position: [-0.6, 4.6, 0],
    rotation: [-0.3, 0, 0],
  },

  {
    name: 'plastic_wrap.glb',
    position: [-1.8, 5.2, 0],
    rotation: [-0.9, 1, 2],
  },
];

const BOT_ITEMS: ItemConfig[] = [
  {
    name: 'paper_rolls.glb',
    position: [-1, 0, -0.7],
    rotation: [0.8, -2, 0.3],
  },
  {
    name: 'napkins.glb',
    position: [-0.3, -3.2, 0.2],
    rotation: [0.7, 0, -0.8],
  },
  {
    name: 'gloves.glb',
    position: [-0, -1.6, -1.5],
    rotation: [0, 2, 0],
  },
  {
    name: 'detergent.glb',
    position: [0, -0.5, 1],
    rotation: [0, 1.7, -0.2],
  },
];

const ALL_ITEMS: ItemConfig[] = [...TOP_ITEMS, ...MID_ITEMS, ...BOT_ITEMS];

export function IndustryCylinder({
  isTouchDevice,
  qualityTier,
  ...props
}: IndustryCylinderProps) {
  const cylinderRef = useRef<THREE.Group>(null);
  const liftGroupRef = useRef<THREE.Group>(null);

  const clamp01 = (value: number) => {
    return Math.max(0, Math.min(1, value));
  };

  useFrame(() => {
    if (!cylinderRef.current || !liftGroupRef.current) {
      return;
    }

    const { industrySectionProgress, industryVisible } =
      getCameraDirectorDebugState();
    const sectionProgress = industrySectionProgress;

    const liftProgress =
      PRE_ROTATE_LIFT_END_INDUSTRY_PROGRESS > 0
        ? clamp01(
            sectionProgress /
              PRE_ROTATE_LIFT_END_INDUSTRY_PROGRESS,
          )
        : 1;
    const liftedY = THREE.MathUtils.lerp(
      PRE_ROTATE_LIFT_START_OFFSET_Y,
      PRE_ROTATE_LIFT_END_OFFSET_Y,
      liftProgress,
    );
    liftGroupRef.current.position.y = liftedY;
    cylinderRef.current.visible = industryVisible;
  });

  const { scene } = useGLTF(industryWrapUrl);
  const wrapperModel = useMemo(() => {
    const useBalancedProfile = qualityTier === 'balanced';
    const useLowProfile = qualityTier === 'low';
    const cloned = scene.clone();
    cloned.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        (obj as THREE.Mesh).material = new THREE.MeshPhysicalMaterial(
          {
            color: '#d9f4ff',
            transparent: true,
            opacity: useLowProfile ? 0.22 : 0.26,
            roughness: useLowProfile ? 0.14 : 0.08,
            metalness: 0,
            transmission: useLowProfile ? 0.75 : useBalancedProfile ? 0.84 : 0.92,
            thickness: useLowProfile ? 0.2 : useBalancedProfile ? 0.3 : 0.38,
            ior: 1.46,
            clearcoat: useLowProfile ? 0.45 : 0.8,
            clearcoatRoughness: useLowProfile ? 0.22 : 0.12,
            envMapIntensity: useLowProfile ? 0.95 : useBalancedProfile ? 1.1 : 1.25,
            attenuationColor: '#bfe9ff',
            attenuationDistance: useLowProfile ? 1.7 : 2.2,
            side: THREE.DoubleSide,
            depthWrite: false,
          }
        );
        (obj as THREE.Mesh).castShadow = false;
        (obj as THREE.Mesh).receiveShadow = false;
      }
    });
    return cloned;
  }, [qualityTier, scene]);

  return (
    <group ref={cylinderRef} {...props}>
      <group ref={liftGroupRef}>
        <primitive
          object={wrapperModel}
          scale={2.5}
          position={[0, -3.5, 0]}
          rotation={[0, 0, 0]}
        />

        {ALL_ITEMS.map((item, index) => (
          <RenderProduct
            key={`${item.name}-${index}`}
            name={item.name}
            qualityTier={qualityTier}
            position={item.position}
            rotation={item.rotation}
            scale={6}
          />
        ))}
      </group>
    </group>
  );
}
