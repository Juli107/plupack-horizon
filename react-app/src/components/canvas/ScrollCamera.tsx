import { PerspectiveCamera } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useLenis } from 'lenis/react';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  cameraKeyframes,
  findSurroundingKeyframes,
  interpolateKeyframes,
} from './cameraKeyframes';
import {
  getCameraDirectorEffectiveScrollPercent,
  setCameraDirectorPageScrollPercent,
} from './cameraDirector';

// ============================================
// SCROLL-SYNCED CAMERA CONTROLLER
// ============================================
// This component moves the camera based on scroll position
// using keyframes defined in cameraKeyframes.ts
// Uses Lenis scroll values for smooth syncing

const LERP_FACTOR = 0.08;
const FOV_EPSILON = 0.02;
const FOV_DAMPING = 24;
const FOV_MAX_SPEED = 90;
const INDUSTRY_SCROLL_START = 48;
const INDUSTRY_SCROLL_END = 74;
const INDUSTRY_MIN_CAMERA_TARGET_DISTANCE = 8;

export function ScrollCamera() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const { set } = useThree();

  // Current interpolated values (for smooth lerping)
  const currentPosition = useRef(new THREE.Vector3(0, 0, 10));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const currentRotation = useRef(new THREE.Euler(0, 0, 0));
  const currentFov = useRef(45);

  // Target values (from keyframes)
  const targetPosition = useRef(new THREE.Vector3(0, 0, 10));
  const targetLookAt = useRef<THREE.Vector3 | null>(
    new THREE.Vector3(0, 0, 0)
  );
  const targetRotation = useRef<THREE.Euler | null>(null);
  const targetFov = useRef(45);

  // Track if we're using lookAt or rotation
  const useLookAtRef = useRef(true);

  // Set this camera as the default
  useEffect(() => {
    if (cameraRef.current) {
      set({ camera: cameraRef.current });
    }
  }, [set]);

  // Use Lenis scroll for smooth, synced scrolling
  useLenis((lenis) => {
    // Get scroll progress (0 to 100 percent) from Lenis
    setCameraDirectorPageScrollPercent(lenis.progress * 100);
    const scrollPercent = getCameraDirectorEffectiveScrollPercent();

    // Find surrounding keyframes and interpolate
    const { from, to, t } = findSurroundingKeyframes(
      scrollPercent,
      cameraKeyframes
    );
    const interpolated = interpolateKeyframes(from, to, t);

    // Prevent brief "zoom-in" feeling in industries by keeping
    // a minimum camera-to-target distance during that section.
    if (
      scrollPercent >= INDUSTRY_SCROLL_START &&
      scrollPercent <= INDUSTRY_SCROLL_END &&
      interpolated.lookAt
    ) {
      const offset = interpolated.position.clone().sub(interpolated.lookAt);
      const distance = offset.length();

      if (distance < INDUSTRY_MIN_CAMERA_TARGET_DISTANCE) {
        if (distance > 1e-4) {
          offset.setLength(INDUSTRY_MIN_CAMERA_TARGET_DISTANCE);
        } else {
          offset.set(0, 0, INDUSTRY_MIN_CAMERA_TARGET_DISTANCE);
        }
        interpolated.position.copy(interpolated.lookAt.clone().add(offset));
      }
    }

    // Set target values
    targetPosition.current.copy(interpolated.position);
    targetFov.current = interpolated.fov;

    // Handle lookAt vs rotation
    if (interpolated.lookAt) {
      targetLookAt.current = interpolated.lookAt;
      targetRotation.current = null;
      useLookAtRef.current = true;
    } else if (interpolated.rotation) {
      targetRotation.current = interpolated.rotation;
      targetLookAt.current = null;
      useLookAtRef.current = false;
    }
  });

  useFrame((_, delta) => {
    if (!cameraRef.current) return;

    // Lerp position
    currentPosition.current.lerp(targetPosition.current, LERP_FACTOR);
    cameraRef.current.position.copy(currentPosition.current);

    // Handle rotation - either via lookAt or direct rotation
    if (useLookAtRef.current && targetLookAt.current) {
      // Lerp lookAt target
      currentLookAt.current.lerp(targetLookAt.current, LERP_FACTOR);
      cameraRef.current.lookAt(currentLookAt.current);
    } else if (targetRotation.current) {
      // Lerp rotation directly
      currentRotation.current.x = THREE.MathUtils.lerp(
        currentRotation.current.x,
        targetRotation.current.x,
        LERP_FACTOR
      );
      currentRotation.current.y = THREE.MathUtils.lerp(
        currentRotation.current.y,
        targetRotation.current.y,
        LERP_FACTOR
      );
      currentRotation.current.z = THREE.MathUtils.lerp(
        currentRotation.current.z,
        targetRotation.current.z,
        LERP_FACTOR
      );
      cameraRef.current.rotation.copy(currentRotation.current);
    }

    // Damped + rate-limited FOV keeps zoom transitions snappy
    // while preventing sudden lens spikes during aggressive scroll bursts.
    const dampFactor = 1 - Math.exp(-FOV_DAMPING * delta);
    const desiredStep = (targetFov.current - currentFov.current) * dampFactor;
    const maxStep = FOV_MAX_SPEED * delta;
    const clampedStep = THREE.MathUtils.clamp(desiredStep, -maxStep, maxStep);
    currentFov.current += clampedStep;

    if (
      Math.abs(cameraRef.current.fov - currentFov.current) >
      FOV_EPSILON
    ) {
      cameraRef.current.fov = currentFov.current;
      cameraRef.current.updateProjectionMatrix();
    }
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={[0, 0, 10]}
      fov={45}
      near={0.1}
      far={1000}
    />
  );
}
