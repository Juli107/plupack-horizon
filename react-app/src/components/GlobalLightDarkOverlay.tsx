import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export function GlobalLightDarkOverlay() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = document.createElement('div');
    containerRef.current = container;
    document.body.appendChild(container);

    return () => {
      if (containerRef.current?.parentNode) {
        containerRef.current.parentNode.removeChild(
          containerRef.current,
        );
      }
      containerRef.current = null;
    };
  }, []);

  if (!containerRef.current) return null;

  return createPortal(
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        mixBlendMode: 'overlay',

        inset: 0,
        zIndex: 45,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '-8%',
          background:
            'radial-gradient(48% 40% at 20% 14%, rgba(255, 255, 255, 0.38) 0%, rgba(190, 228, 245, 0.22) 34%, rgba(8, 78, 133, 0) 74%)',
          opacity: 0.8,
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(74% 66% at 84% 86%, rgba(7, 34, 58, 0) 20%, rgba(7, 34, 58, 0.16) 62%, rgba(7, 34, 58, 0.28) 100%)',
          opacity: 0.6,
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(130% 120% at 50% 46%, rgba(10, 61, 84, 0) 0%, rgba(10, 61, 84, 0) 56%, rgba(7, 30, 56, 0.1) 80%, rgba(7, 30, 56, 0.18) 100%)',
          opacity: 0.9,
        }}
      />
    </div>,
    containerRef.current,
  );
}
