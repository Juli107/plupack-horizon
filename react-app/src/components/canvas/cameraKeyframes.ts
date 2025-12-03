import * as THREE from 'three';

// ============================================
// CAMERA KEYFRAME CONFIGURATION
// ============================================
// Define camera states at different scroll percentages (0-100)
// The camera will smoothly interpolate between these keyframes

export interface CameraKeyframe {
  /** Scroll percentage (0-100) when this keyframe is active */
  scrollPercent: number;
  /** Camera position [x, y, z] - optional, inherits from previous keyframe if not set */
  position?: [number, number, number];
  /** Camera rotation in euler angles [x, y, z] (radians) - optional, ignored if lookAt is set */
  rotation?: [number, number, number];
  /** Point for camera to look at [x, y, z] - optional, overrides rotation */
  lookAt?: [number, number, number];
  /** Field of view (degrees) - optional, defaults to 45 or inherits from previous */
  fov?: number;

  // ============================================
  // ORBIT CONTROLS
  // ============================================
  // Use these for orbital camera movement around a target (e.g., cylinder)
  // When orbit is enabled, position is calculated from orbitCenter + angle

  /** Enable orbit mode - camera orbits around orbitCenter */
  orbit?: boolean;
  /** Center point to orbit around [x, y, z] */
  orbitCenter?: [number, number, number];
  /** Orbit angle in radians (0 = front, PI/2 = right, PI = back, etc.) */
  orbitAngle?: number;
  /** Distance from orbit center */
  orbitRadius?: number;
  /** Vertical offset from orbit center (camera height relative to center) */
  orbitHeight?: number;
  /** Tilt angle - how much camera looks down/up at the center (radians) */
  orbitTilt?: number;
}

// ============================================
// KEYFRAMES DEFINITION
// ============================================
// Add/modify keyframes here to control camera throughout the page
// The camera will lerp smoothly between consecutive keyframes

export const cameraKeyframes: CameraKeyframe[] = [
  // ============================================
  // HERO SECTION (0-15%)
  // ============================================
  {
    scrollPercent: 0,
    position: [0, 0, 10],
    rotation: [0, 0, 0],
    lookAt: [0, 0, 0],
    fov: 45,
  },
  {
    scrollPercent: 15,
    position: [0, -12, -10],
    lookAt: [0, -12, -10],
    fov: 45,
  },

  // ============================================
  // SERVICES & INDUSTRY DYNAMICS (20-54%)
  // ============================================

  // Hold Camera movement
  {
    scrollPercent: 20,
    position: [0, -30, 30],
    lookAt: [0, -30, 30],
  },

  {
    scrollPercent: 40,
    position: [0, -50, 0],
    lookAt: [0, -50, 0],
  },

  {
    scrollPercent: 50,
    position: [0, -50, 0],
    lookAt: [0, -50, 0],
  },

  // ============================================
  // INDUSTRIES (54-80%) - Orbital descent around the rod
  // ============================================

  // Start - Front view, top of rod
  {
    scrollPercent: 52,
    orbit: true,
    orbitCenter: [0, -58, 0],
    orbitAngle: Math.PI,
    orbitRadius: 8,
    orbitHeight: 0,
  },

  // Three-quarter rotation - Left side, near bottom
  {
    scrollPercent: 65,
    orbit: true,
    orbitCenter: [0, -62, 0],
    orbitAngle: Math.PI * 2.5, // 450 degrees - left side
    orbitRadius: 8,
    orbitHeight: 0,
  },

  // Full rotation - Back at front, bottom of rod
  {
    scrollPercent: 68,
    orbit: true,
    orbitCenter: [0, -67, 0],
    orbitAngle: Math.PI * 3, // 540 degrees - full rotation back to front
    orbitRadius: 8,
    orbitHeight: 0,
  },

  // End of rotation
  {
    scrollPercent: 70,
    orbit: false,
    position: [0, -70, -8],
    lookAt: [0, -70, 0],
  },

  // ============================================
  // TRANSITION TO FOOTER (75-100%)
  // ============================================
  {
    scrollPercent: 100,
  },
];

// ============================================
// INTERPOLATION UTILITIES
// ============================================

/** Default values for camera properties */
const DEFAULTS = {
  position: [0, 0, 10] as [number, number, number],
  fov: 45,
  rotation: [0, 0, 0] as [number, number, number],
  lookAt: [0, 0, 0] as [number, number, number],
  orbitCenter: [0, 0, 0] as [number, number, number],
  orbitAngle: 0,
  orbitRadius: 10,
  orbitHeight: 0,
  orbitTilt: 0,
};

/**
 * Calculate camera position from orbit parameters
 */
export function calculateOrbitPosition(
  center: [number, number, number],
  angle: number,
  radius: number,
  height: number
): THREE.Vector3 {
  const x = center[0] + Math.sin(angle) * radius;
  const y = center[1] + height;
  const z = center[2] + Math.cos(angle) * radius;
  return new THREE.Vector3(x, y, z);
}

/**
 * Resolve inherited properties from previous keyframes
 * If a property is not set, it inherits from the most recent keyframe that has it
 */
function resolveKeyframeValues(
  keyframe: CameraKeyframe,
  allKeyframes: CameraKeyframe[]
): CameraKeyframe & { position: [number, number, number] } {
  const sorted = [...allKeyframes].sort(
    (a, b) => a.scrollPercent - b.scrollPercent
  );
  const currentIndex = sorted.findIndex(
    (k) => k.scrollPercent === keyframe.scrollPercent
  );

  // Find inherited values by looking at previous keyframes
  let position = keyframe.position;
  let fov = keyframe.fov;
  let rotation = keyframe.rotation;
  let lookAt = keyframe.lookAt;
  let orbit = keyframe.orbit;
  let orbitCenter = keyframe.orbitCenter;
  let orbitAngle = keyframe.orbitAngle;
  let orbitRadius = keyframe.orbitRadius;
  let orbitHeight = keyframe.orbitHeight;
  let orbitTilt = keyframe.orbitTilt;

  // Look backwards through keyframes to find inherited values
  for (let i = currentIndex - 1; i >= 0; i--) {
    const prev = sorted[i];
    if (position === undefined && prev.position !== undefined) {
      position = prev.position;
    }
    if (fov === undefined && prev.fov !== undefined) {
      fov = prev.fov;
    }
    if (rotation === undefined && prev.rotation !== undefined) {
      rotation = prev.rotation;
    }
    if (lookAt === undefined && prev.lookAt !== undefined) {
      lookAt = prev.lookAt;
    }
    if (orbit === undefined && prev.orbit !== undefined) {
      orbit = prev.orbit;
    }
    if (orbitCenter === undefined && prev.orbitCenter !== undefined) {
      orbitCenter = prev.orbitCenter;
    }
    if (orbitAngle === undefined && prev.orbitAngle !== undefined) {
      orbitAngle = prev.orbitAngle;
    }
    if (orbitRadius === undefined && prev.orbitRadius !== undefined) {
      orbitRadius = prev.orbitRadius;
    }
    if (orbitHeight === undefined && prev.orbitHeight !== undefined) {
      orbitHeight = prev.orbitHeight;
    }
    if (orbitTilt === undefined && prev.orbitTilt !== undefined) {
      orbitTilt = prev.orbitTilt;
    }
  }

  return {
    ...keyframe,
    position: position ?? DEFAULTS.position,
    fov: fov ?? DEFAULTS.fov,
    rotation,
    lookAt,
    orbit,
    orbitCenter,
    orbitAngle,
    orbitRadius,
    orbitHeight,
    orbitTilt,
  };
}

/**
 * Find the two keyframes that surround the current scroll percentage
 */
export function findSurroundingKeyframes(
  scrollPercent: number,
  keyframes: CameraKeyframe[]
): {
  from: CameraKeyframe & { position: [number, number, number] };
  to: CameraKeyframe & { position: [number, number, number] };
  t: number;
} {
  // Clamp scroll percent
  const clampedPercent = Math.max(0, Math.min(100, scrollPercent));

  // Sort keyframes by scroll percent (should already be sorted, but just in case)
  const sorted = [...keyframes].sort(
    (a, b) => a.scrollPercent - b.scrollPercent
  );

  // Find surrounding keyframes
  let fromIndex = 0;
  let toIndex = 0;

  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].scrollPercent <= clampedPercent) {
      fromIndex = i;
    }
    if (sorted[i].scrollPercent >= clampedPercent) {
      toIndex = i;
      break;
    }
    toIndex = i;
  }

  const from = sorted[fromIndex];
  const to = sorted[toIndex];

  // Calculate interpolation factor (0 to 1) between the two keyframes
  let t = 0;
  if (from.scrollPercent !== to.scrollPercent) {
    t =
      (clampedPercent - from.scrollPercent) /
      (to.scrollPercent - from.scrollPercent);
  }

  // Resolve inherited values for both keyframes
  const resolvedFrom = resolveKeyframeValues(from, keyframes);
  const resolvedTo = resolveKeyframeValues(to, keyframes);

  return { from: resolvedFrom, to: resolvedTo, t };
}

/**
 * Interpolate between two keyframes based on factor t (0-1)
 * Note: from and to should be resolved keyframes with position guaranteed
 */
export function interpolateKeyframes(
  from: CameraKeyframe & { position: [number, number, number] },
  to: CameraKeyframe & { position: [number, number, number] },
  t: number
): {
  position: THREE.Vector3;
  rotation: THREE.Euler | null;
  lookAt: THREE.Vector3 | null;
  fov: number;
  isOrbiting: boolean;
} {
  // Smooth easing function (ease in-out)
  const easedT =
    t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

  // Check if we're in orbit mode
  const fromOrbit = from.orbit ?? false;
  const toOrbit = to.orbit ?? false;
  const isOrbiting = fromOrbit || toOrbit;

  let position: THREE.Vector3;
  let lookAt: THREE.Vector3 | null = null;

  // Helper function to get position from orbit parameters
  const getOrbitPosition = (kf: CameraKeyframe): THREE.Vector3 => {
    const center = kf.orbitCenter ?? [0, 0, 0];
    const angle = kf.orbitAngle ?? 0;
    const radius = kf.orbitRadius ?? 10;
    const height = kf.orbitHeight ?? 0;
    return calculateOrbitPosition(center, angle, radius, height);
  };

  // Helper function to get lookAt from orbit parameters
  const getOrbitLookAt = (kf: CameraKeyframe): THREE.Vector3 => {
    const center = kf.orbitCenter ?? [0, 0, 0];
    const radius = kf.orbitRadius ?? 10;
    const tilt = kf.orbitTilt ?? 0;
    return new THREE.Vector3(
      center[0],
      center[1] + Math.sin(tilt) * radius,
      center[2]
    );
  };

  if (fromOrbit && toOrbit) {
    // Both keyframes are orbiting - interpolate orbit parameters
    const fromCenter = from.orbitCenter ?? [0, 0, 0];
    const toCenter = to.orbitCenter ?? [0, 0, 0];
    const fromAngle = from.orbitAngle ?? 0;
    const toAngle = to.orbitAngle ?? 0;
    const fromRadius = from.orbitRadius ?? 10;
    const toRadius = to.orbitRadius ?? 10;
    const fromHeight = from.orbitHeight ?? 0;
    const toHeight = to.orbitHeight ?? 0;

    // Interpolate orbit parameters
    const center: [number, number, number] = [
      THREE.MathUtils.lerp(fromCenter[0], toCenter[0], easedT),
      THREE.MathUtils.lerp(fromCenter[1], toCenter[1], easedT),
      THREE.MathUtils.lerp(fromCenter[2], toCenter[2], easedT),
    ];
    const angle = THREE.MathUtils.lerp(fromAngle, toAngle, easedT);
    const radius = THREE.MathUtils.lerp(fromRadius, toRadius, easedT);
    const height = THREE.MathUtils.lerp(fromHeight, toHeight, easedT);

    // Calculate position from orbit
    position = calculateOrbitPosition(center, angle, radius, height);

    // LookAt is the orbit center (with optional tilt applied)
    const fromTilt = from.orbitTilt ?? 0;
    const toTilt = to.orbitTilt ?? 0;
    const tilt = THREE.MathUtils.lerp(fromTilt, toTilt, easedT);

    lookAt = new THREE.Vector3(
      center[0],
      center[1] + Math.sin(tilt) * radius,
      center[2]
    );
  } else if (fromOrbit && !toOrbit) {
    // Transitioning FROM orbit TO regular position
    const fromPos = getOrbitPosition(from);
    const toPos = new THREE.Vector3(...to.position);

    position = new THREE.Vector3(
      THREE.MathUtils.lerp(fromPos.x, toPos.x, easedT),
      THREE.MathUtils.lerp(fromPos.y, toPos.y, easedT),
      THREE.MathUtils.lerp(fromPos.z, toPos.z, easedT)
    );

    // Interpolate lookAt from orbit center to target lookAt
    const fromLookAt = getOrbitLookAt(from);
    if (to.lookAt) {
      const toLookAt = new THREE.Vector3(...to.lookAt);
      lookAt = new THREE.Vector3(
        THREE.MathUtils.lerp(fromLookAt.x, toLookAt.x, easedT),
        THREE.MathUtils.lerp(fromLookAt.y, toLookAt.y, easedT),
        THREE.MathUtils.lerp(fromLookAt.z, toLookAt.z, easedT)
      );
    } else {
      lookAt = fromLookAt;
    }
  } else if (!fromOrbit && toOrbit) {
    // Transitioning FROM regular position TO orbit
    const fromPos = new THREE.Vector3(...from.position);
    const toPos = getOrbitPosition(to);

    position = new THREE.Vector3(
      THREE.MathUtils.lerp(fromPos.x, toPos.x, easedT),
      THREE.MathUtils.lerp(fromPos.y, toPos.y, easedT),
      THREE.MathUtils.lerp(fromPos.z, toPos.z, easedT)
    );

    // Interpolate lookAt from source lookAt to orbit center
    const toLookAt = getOrbitLookAt(to);
    if (from.lookAt) {
      const fromLookAt = new THREE.Vector3(...from.lookAt);
      lookAt = new THREE.Vector3(
        THREE.MathUtils.lerp(fromLookAt.x, toLookAt.x, easedT),
        THREE.MathUtils.lerp(fromLookAt.y, toLookAt.y, easedT),
        THREE.MathUtils.lerp(fromLookAt.z, toLookAt.z, easedT)
      );
    } else {
      lookAt = toLookAt;
    }
  } else {
    // Standard position interpolation (neither orbiting)
    position = new THREE.Vector3(
      THREE.MathUtils.lerp(from.position[0], to.position[0], easedT),
      THREE.MathUtils.lerp(from.position[1], to.position[1], easedT),
      THREE.MathUtils.lerp(from.position[2], to.position[2], easedT)
    );

    // Interpolate lookAt if both have it
    if (from.lookAt && to.lookAt) {
      lookAt = new THREE.Vector3(
        THREE.MathUtils.lerp(from.lookAt[0], to.lookAt[0], easedT),
        THREE.MathUtils.lerp(from.lookAt[1], to.lookAt[1], easedT),
        THREE.MathUtils.lerp(from.lookAt[2], to.lookAt[2], easedT)
      );
    } else if (from.lookAt) {
      lookAt = new THREE.Vector3(...from.lookAt);
    } else if (to.lookAt) {
      lookAt = new THREE.Vector3(...to.lookAt);
    }
  }

  // Interpolate rotation if both have it (and no lookAt)
  let rotation: THREE.Euler | null = null;
  if (!lookAt && from.rotation && to.rotation) {
    rotation = new THREE.Euler(
      THREE.MathUtils.lerp(from.rotation[0], to.rotation[0], easedT),
      THREE.MathUtils.lerp(from.rotation[1], to.rotation[1], easedT),
      THREE.MathUtils.lerp(from.rotation[2], to.rotation[2], easedT)
    );
  } else if (!lookAt && from.rotation) {
    rotation = new THREE.Euler(...from.rotation);
  } else if (!lookAt && to.rotation) {
    rotation = new THREE.Euler(...to.rotation);
  }

  // Interpolate FOV
  const fromFov = from.fov ?? 45;
  const toFov = to.fov ?? 45;
  const fov = THREE.MathUtils.lerp(fromFov, toFov, easedT);

  return { position, rotation, lookAt, fov, isOrbiting };
}
