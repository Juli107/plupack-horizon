import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import noiseImage from '../assets/noise.webp';

// NoiseOverlay - repeating noise texture that scrolls with the page
// Renders into document.body and keeps its height synced to the document
// so the noise appears to scroll with the page content.
function getDocumentHeight() {
  return Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight,
    document.documentElement.clientHeight,
  );
}

export function NoiseOverlay() {
  // Shopify provides the asset URL in production
  // Falls back to local import for dev server
  const shopifyNoiseUrl = (window as any).SHOPIFY_DATA?.assets
    ?.noiseTexture;
  const noiseUrl = shopifyNoiseUrl || noiseImage;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [docHeight, setDocHeight] = useState<number>(() =>
    typeof document !== 'undefined' ? getDocumentHeight() : 0,
  );

  useEffect(() => {
    const container = document.createElement('div');
    containerRef.current = container;
    document.body.appendChild(container);

    const update = () => setDocHeight(getDocumentHeight());

    // update initially and on window resize/scroll
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, { passive: true });

    // Observe DOM changes that could change document height
    const mo = new MutationObserver(update);
    mo.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update);
      mo.disconnect();
      if (containerRef.current && containerRef.current.parentNode) {
        containerRef.current.parentNode.removeChild(
          containerRef.current,
        );
      }
      containerRef.current = null;
    };
  }, []);

  if (!containerRef.current) return null;

  const overlay = (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: docHeight || '100vh',
        zIndex: 50,
        pointerEvents: 'none',
        mixBlendMode: 'soft-light',
        backgroundImage: `url(${noiseUrl})`,
        backgroundRepeat: 'repeat',
        backgroundAttachment: 'scroll',
        opacity: 0.08,
      }}
    />
  );

  return createPortal(overlay, containerRef.current);
}
