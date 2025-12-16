import { useLenis } from 'lenis/react';
import { useRef } from 'react';

export function ScrollDebugger() {
  const elementRef = useRef<HTMLDivElement>(null);

  useLenis(({ scroll, limit }) => {
    if (elementRef.current) {
      const p = limit > 0 ? (scroll / limit) * 100 : 0;
      elementRef.current.textContent = `${Math.min(
        Math.max(p, 0),
        100
      ).toFixed(0)}%`;
    }
  });

  return (
    <div
      ref={elementRef}
      className="fixed top-24 right-4 z-[9999] bg-black/80 text-white px-3 py-1 rounded font-mono text-sm pointer-events-none mix-blend-difference"
    >
      0%
    </div>
  );
}
