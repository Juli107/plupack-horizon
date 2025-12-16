import * as THREE from 'three';

export const FROSTED_MATERIAL = new THREE.MeshPhysicalMaterial({
  color: '#b3f4ff', // Clean white base
  roughness: 0.35, // Frosted look
  metalness: 0.1, // Slight plastic sheen
  transmission: 0.8, // Semi-transparent (Vellum)
  thickness: 1.2, // Gives volume
  transparent: true,
  opacity: 1, // Let transmission handle transparency
  clearcoat: 0.2, // Slight coating
  clearcoatRoughness: 0.4,
  side: THREE.DoubleSide, // Render both sides
});

export function applyFrostedMaterial(
  scene: THREE.Group | THREE.Object3D
) {
  scene.traverse((node: any) => {
    if (node.isMesh) {
      const oldMat = node.material;
      const newMat = FROSTED_MATERIAL.clone();

      // Preserve normal map if it exists
      if (oldMat.normalMap) {
        newMat.normalMap = oldMat.normalMap;
        if (oldMat.normalScale)
          newMat.normalScale.copy(oldMat.normalScale);
      }

      node.material = newMat;
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });
}
