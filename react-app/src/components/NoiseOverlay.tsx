import noiseImage from '../assets/noise.webp';

export function NoiseOverlay() {
  // Shopify provides the asset URL in production
  // Falls back to local import for dev server
  const shopifyNoiseUrl = (window as any).SHOPIFY_DATA?.assets
    ?.noiseTexture;
  const noiseUrl = shopifyNoiseUrl || noiseImage;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        zIndex: 50,
        pointerEvents: 'none',
        mixBlendMode: 'soft-light',
        backgroundImage: `url(${noiseUrl})`,
        backgroundRepeat: 'repeat-y',
        backgroundSize: '100% auto',
        backgroundPosition: 'top center',
        backgroundAttachment: 'scroll',
        opacity: 0.08,
      }}
    />
  );
}
