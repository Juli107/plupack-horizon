import { useMemo } from 'react';
import {
  useGLTF,
  Instances,
  Instance,
  Center,
} from '@react-three/drei';
import * as THREE from 'three';

// Import optimized assets directly from src/assets/models/optimized
import foodContainerUrl from '../../assets/models/optimized/food_container.glb';
import tapeUrl from '../../assets/models/optimized/tape.glb';
import paperRollsUrl from '../../assets/models/optimized/paper_rolls.glb';
import detergentUrl from '../../assets/models/optimized/detergent.glb';
import plasticWrapUrl from '../../assets/models/optimized/plastic_wrap.glb';
import aluminumRollUrl from '../../assets/models/optimized/aluminum_roll.glb';
import filmStretchUrl from '../../assets/models/optimized/film_stretch.glb';
import plasticBagUrl from '../../assets/models/optimized/plastic_bag.glb';
import bubbleWrapUrl from '../../assets/models/optimized/bubble_wrap.glb';
import glovesUrl from '../../assets/models/optimized/gloves.glb';
import cartonUrl from '../../assets/models/optimized/carton.glb';

type GroupProps = any;
type QualityTier = 'high' | 'balanced' | 'low';

// Map filenames (keys) to imported URL strings (values)
const MODEL_URLS: Record<string, string> = {
  'food_container.glb': foodContainerUrl,
  'tape.glb': tapeUrl,
  'paper_rolls.glb': paperRollsUrl,
  'detergent.glb': detergentUrl,
  'plastic_wrap.glb': plasticWrapUrl,
  'aluminum_roll.glb': aluminumRollUrl,
  'film_stretch.glb': filmStretchUrl,
  'plastic_bag.glb': plasticBagUrl,
  'bubble_wrap.glb': bubbleWrapUrl,
  'gloves.glb': glovesUrl,
  'carton.glb': cartonUrl,
  'napkins.glb': '', // Procedural, no GLB
};

const PLASTIC_FILM_MODELS = new Set([
  'film_stretch.glb',
  'plastic_wrap.glb',
  'plastic_bag.glb',
  'bubble_wrap.glb',
  'tape.glb',
]);

const PAPER_MODELS = new Set(['carton.glb', 'paper_rolls.glb']);

const METAL_MODELS = new Set(['aluminum_roll.glb', 'food_container.glb']);

const CARDBOARD_MODELS = new Set(['carton.glb']);

function tuneTextureAnisotropy(
  material: THREE.MeshStandardMaterial,
  qualityTier: QualityTier
) {
  const targetAnisotropy = qualityTier === 'high' ? 8 : qualityTier === 'balanced' ? 6 : 4;
  const textureKeys: Array<
    keyof Pick<
      THREE.MeshStandardMaterial,
      'map' | 'normalMap' | 'roughnessMap' | 'metalnessMap' | 'aoMap'
    >
  > = ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap'];

  for (const key of textureKeys) {
    const texture = material[key];
    if (texture) {
      texture.anisotropy = Math.max(texture.anisotropy, targetAnisotropy);
    }
  }
}

function ensureColorTextureSpace(material: THREE.MeshStandardMaterial) {
  if (material.map) {
    material.map.colorSpace = THREE.SRGBColorSpace;
  }
}

function tuneSingleMaterial(
  material: THREE.Material,
  modelName: string,
  qualityTier: QualityTier
): THREE.Material {
  if (!(material instanceof THREE.MeshStandardMaterial)) {
    return material;
  }

  const tuned = material.clone();
  tuneTextureAnisotropy(tuned, qualityTier);
  ensureColorTextureSpace(tuned);

  tuned.envMapIntensity = Math.max(tuned.envMapIntensity ?? 1, 1.05);

  if (PLASTIC_FILM_MODELS.has(modelName)) {
    tuned.roughness = Math.min(tuned.roughness ?? 0.2, 0.18);
    tuned.metalness = Math.min(tuned.metalness ?? 0.08, 0.04);

    if (tuned instanceof THREE.MeshPhysicalMaterial) {
      tuned.transmission = Math.max(tuned.transmission ?? 0.6, 0.88);
      tuned.thickness = Math.min(
        Math.max(tuned.thickness ?? 0.5, 0.25),
        0.8
      );
      tuned.ior = tuned.ior ?? 1.46;
      tuned.clearcoat = Math.max(tuned.clearcoat ?? 0, 0.72);
      tuned.clearcoatRoughness = Math.min(
        tuned.clearcoatRoughness ?? 0.22,
        0.16
      );
      tuned.attenuationDistance = tuned.attenuationDistance ?? 2.4;
      tuned.attenuationColor =
        tuned.attenuationColor ?? new THREE.Color('#c6eaff');

      if (qualityTier === 'balanced') {
        tuned.transmission *= 0.86;
        tuned.clearcoat *= 0.85;
        tuned.envMapIntensity *= 0.9;
      }

      if (qualityTier === 'low') {
        tuned.transmission *= 0.7;
        tuned.thickness *= 0.7;
        tuned.clearcoat *= 0.65;
        tuned.clearcoatRoughness = Math.max(tuned.clearcoatRoughness, 0.28);
        tuned.envMapIntensity *= 0.8;
      }
    }
  } else if (METAL_MODELS.has(modelName)) {
    const useTrayMaterialProfile =
      modelName === 'food_container.glb' || modelName === 'aluminum_roll.glb';

    tuned.roughness = Math.min(tuned.roughness ?? 0.35, 0.28);
    tuned.metalness = Math.max(tuned.metalness ?? 0.5, 0.82);
    tuned.envMapIntensity = Math.max(tuned.envMapIntensity ?? 1.1, 1.35);
    tuned.color.lerp(new THREE.Color('#dbe2ea'), 0.45);
    tuned.emissive = tuned.emissive.clone().add(new THREE.Color('#1b2128'));
    tuned.emissiveIntensity = 0.08;

    if (useTrayMaterialProfile) {
      tuned.roughness = 0.28;
      tuned.metalness = 0.82;
      tuned.envMapIntensity = 1.35;
      tuned.color.set('#dbe2ea');

      if (modelName === 'aluminum_roll.glb') {
        tuned.map = null;
        tuned.metalnessMap = null;
        tuned.roughnessMap = null;
      }
    }

    if (tuned instanceof THREE.MeshPhysicalMaterial) {
      tuned.transmission = 0;
      tuned.thickness = 0;
      tuned.clearcoat = Math.max(tuned.clearcoat ?? 0, 0.1);
      tuned.clearcoatRoughness = Math.min(tuned.clearcoatRoughness ?? 0.28, 0.22);

      if (qualityTier === 'balanced') {
        tuned.clearcoat *= 0.85;
      }

      if (qualityTier === 'low') {
        tuned.clearcoat *= 0.65;
        tuned.envMapIntensity *= 0.9;
      }
    }
  } else if (PAPER_MODELS.has(modelName)) {
    tuned.roughness = Math.max(tuned.roughness ?? 0.5, 0.8);
    tuned.metalness = 0;
    tuned.envMapIntensity = Math.min(tuned.envMapIntensity ?? 0.35, 0.38);
  }

  if (CARDBOARD_MODELS.has(modelName)) {
    tuned.roughness = 1;
    tuned.metalness = 0;
    tuned.envMapIntensity = Math.min(tuned.envMapIntensity ?? 0.2, 0.14);
    tuned.color.lerp(new THREE.Color('#be8752'), 0.34);
    tuned.emissive = tuned.emissive.clone().add(new THREE.Color('#150b04'));
    tuned.emissiveIntensity = 0.03;

    if (!tuned.roughnessMap && tuned.map) {
      tuned.roughnessMap = tuned.map;
    }

    tuned.bumpMap = null;
    tuned.bumpScale = 0;

    if (tuned.normalMap) {
      tuned.normalScale = new THREE.Vector2(1.15, 1.15);
    }
  }

  if (
    tuned instanceof THREE.MeshPhysicalMaterial &&
    (PAPER_MODELS.has(modelName) || CARDBOARD_MODELS.has(modelName))
  ) {
    tuned.clearcoat = 0;
    tuned.clearcoatRoughness = 1;
    tuned.transmission = 0;
    tuned.thickness = 0;
    tuned.attenuationDistance = Infinity;
  }

  if (qualityTier === 'balanced') {
    tuned.envMapIntensity *= 0.92;
  }

  if (qualityTier === 'low') {
    tuned.envMapIntensity *= 0.82;
  }

  tuned.needsUpdate = true;
  return tuned;
}

function tuneMaterialSet(
  material: THREE.Material | THREE.Material[],
  modelName: string,
  qualityTier: QualityTier
) {
  if (Array.isArray(material)) {
    return material.map((item) => tuneSingleMaterial(item, modelName, qualityTier));
  }
  return tuneSingleMaterial(material, modelName, qualityTier);
}

export function preloadModels(names: string[]) {
  for (const name of names) {
    const url = MODEL_URLS[name];
    if (url) {
      useGLTF.preload(url);
    }
  }
}

// Helper to find the main mesh geometry and material for instancing
function useMainMesh(url: string, modelName: string, qualityTier: QualityTier) {
  const { scene } = useGLTF(url);
  return useMemo(() => {
    let foundGeometry: THREE.BufferGeometry | null = null;
    let foundMaterial: THREE.Material | THREE.Material[] | null = null;
    let largestVertexCount = -1;

    scene.traverse((node: any) => {
      if (node.isMesh && node.geometry) {
        const vertexCount =
          node.geometry.attributes?.position?.count ?? 0;
        if (vertexCount <= largestVertexCount) {
          return;
        }

        largestVertexCount = vertexCount;
        foundGeometry = node.geometry;
        foundMaterial = node.material ?? null;
      }
    });

    if (!foundGeometry || !foundMaterial) return null;
    return {
      geometry: foundGeometry,
      material: tuneMaterialSet(foundMaterial, modelName, qualityTier),
    };
  }, [modelName, qualityTier, scene, url]);
}

// FOOD CONTAINERS (Stack of 8)
export function FoodContainerStack(props: GroupProps) {
  const { qualityTier = 'high', ...groupProps } = props;
  // Use imported URL
  const data = useMainMesh(
    MODEL_URLS['food_container.glb'],
    'food_container.glb',
    qualityTier
  );
  if (!data) return null;

  return (
    <group {...groupProps}>
      <Center bottom>
        <Instances
          range={8}
          geometry={data.geometry}
          material={data.material}
          frustumCulled={false}
        >
          <Instance position={[0, 0.06, 0]} />
          <Instance position={[0, 0.04, 0]} />
          <Instance position={[0, 0.02, 0]} />
          <Instance position={[0, 0, 0]} />
          <Instance position={[0, -0.02, 0]} />
          <Instance position={[0, -0.04, 0]} />
          <Instance position={[0, -0.06, 0]} />
          <Instance position={[0, -0.08, 0]} />
        </Instances>
      </Center>
    </group>
  );
}

// TAPES (Group of 3)
export function TapeStack(props: GroupProps) {
  const { qualityTier = 'high', ...groupProps } = props;
  const data = useMainMesh(MODEL_URLS['tape.glb'], 'tape.glb', qualityTier);
  if (!data) return null;
  return (
    <group {...groupProps}>
      <Center bottom>
        <Instances
          range={3}
          geometry={data.geometry}
          material={data.material}
          frustumCulled={false}
        >
          <Instance
            position={[-0.06, 0.05, -0.15]}
            rotation={[0, 1, 0]}
          />
          <Instance position={[0, 0, 0]} />
          <Instance
            position={[-0.09, -0.1, -0.15]}
            rotation={[0, 3, 0]}
          />
        </Instances>
      </Center>
    </group>
  );
}

// PAPER ROLLS (Stack of 2)
export function PaperRollStack(props: GroupProps) {
  const { qualityTier = 'high', ...groupProps } = props;
  const data = useMainMesh(
    MODEL_URLS['paper_rolls.glb'],
    'paper_rolls.glb',
    qualityTier
  );
  if (!data) return null;

  return (
    <group {...groupProps}>
      <Center bottom>
        <Instances
          range={3}
          geometry={data.geometry}
          material={data.material}
          frustumCulled={false}
        >
          {/* Two on bottom, touching */}
          <Instance position={[0, 0, 0]} rotation={[0, 0, 0]} />
          <Instance position={[0, -0.12, 0]} rotation={[0, 0, 0]} />
        </Instances>
      </Center>
    </group>
  );
}

// NAPKINS (Procedural)
export function NapkinStack(props: GroupProps) {
  const { qualityTier = 'high', ...groupProps } = props;
  // Reduced size significantly: 1 -> 0.2
  const geometry = useMemo(
    () => new THREE.BoxGeometry(0.2, 0.002, 0.2),
    [],
  );

  const count = 40;

  return (
    <group {...groupProps}>
      <Center bottom>
        <Instances
          range={count}
          geometry={geometry}
          frustumCulled={false}
        >
          <meshStandardMaterial
            color="#ffffff"
            roughness={qualityTier === 'low' ? 0.66 : qualityTier === 'balanced' ? 0.6 : 0.55}
          />
          {Array.from({ length: count }).map((_, i) => (
            <Instance
              key={i}
              // Tighter stacking
              position={[0, (i - count / 2) * 0.004, 0]}
              rotation={[
                Math.sin(i * 0.5) * 0.02, // Subtle irregularity
                i * 0.05, // Slight fan
                Math.cos(i * 0.3) * 0.02,
              ]}
            />
          ))}
        </Instances>
      </Center>
    </group>
  );
}

// GENERIC SINGLE ITEM
export function SingleProduct({
  name,
  qualityTier = 'high',
  ...props
}: GroupProps & { name: string; qualityTier?: QualityTier }) {
  // Use imported URL via lookup
  const url = MODEL_URLS[name];
  // Fallback or error handling if needed, but for now strict lookup

  const { scene } = useGLTF(url);
  const cloned = useMemo(() => {
    const c = scene.clone();
    c.traverse((node: any) => {
      if (node.isMesh) {
        node.material = tuneMaterialSet(node.material, name, qualityTier);
      }
    });
    return c;
  }, [name, qualityTier, scene]);

  return (
    <group {...props}>
      <Center bottom>
        <primitive object={cloned} />
      </Center>
    </group>
  );
}

// COMPONENT MAPPING
export const PRODUCT_COMPONENTS: Record<
  string,
  React.ComponentType<any>
> = {
  'food_container.glb': FoodContainerStack,
  'tape.glb': TapeStack,
  'paper_rolls.glb': PaperRollStack,
  'napkins.glb': NapkinStack,
};

export function RenderProduct({
  name,
  qualityTier = 'high',
  ...props
}: GroupProps & { name: string; qualityTier?: QualityTier }) {
  const Component = PRODUCT_COMPONENTS[name];
  if (Component) {
    return <Component qualityTier={qualityTier} {...props} />;
  }
  return <SingleProduct name={name} qualityTier={qualityTier} {...props} />;
}
