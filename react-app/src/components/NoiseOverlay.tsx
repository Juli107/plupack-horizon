import { useEffect, useRef } from 'react';
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
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = document.createElement('div');
    containerRef.current = container;
    document.body.appendChild(container);

    let frameId = 0;

    const update = () => {
      frameId = 0;

      if (!overlayRef.current) return;
      overlayRef.current.style.height = `${getDocumentHeight()}px`;
    };

    const requestUpdate = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(update);
    };

    // Keep the overlay tall enough to cover the whole document
    // without forcing React re-renders during scroll.
    requestUpdate();
    window.addEventListener('resize', requestUpdate);

    // Observe DOM changes that could change document height
    const mo = new MutationObserver(requestUpdate);
    mo.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener('resize', requestUpdate);
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
      ref={overlayRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
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
