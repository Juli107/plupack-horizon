import noiseImage from '../assets/noise.webp';

/**
 * NoiseOverlay - Fixed noise texture overlay across entire page
 *
 * Creates a film grain effect using:
 * - 15% opacity
 * - Soft light blend mode
 * - Fixed position (doesn't scroll)
 * - Pointer events disabled (click-through)
 */
export function NoiseOverlay() {
  // Shopify provides the asset URL in production
  // Falls back to local import for dev server
  const shopifyNoiseUrl = (window as any).SHOPIFY_DATA?.assets
    ?.noiseTexture;
  const noiseUrl = shopifyNoiseUrl || noiseImage;

  return (
    <div
      className="fixed inset-0 z-9 pointer-events-none opacity-8 bg-repeat"
      style={{
        mixBlendMode: 'soft-light',
        backgroundImage: `url(${noiseUrl})`,
      }}
    />
  );
}
