import { useProgress } from '@react-three/drei';
import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { createPortal } from 'react-dom';

export function LoadingScreen() {
  const { progress, active } = useProgress();
  const [finished, setFinished] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [showSquares, setShowSquares] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const cols = 10;
  const rows = 10;

  useEffect(() => {
    console.log('Loading Screen v3.3 - Reliability Fixes');
    // Check if we've already loaded the experience in this session
    const hasLoaded = sessionStorage.getItem('plupack_loaded');

    if (hasLoaded) {
      // If already loaded, skip the loading screen entirely
      setFinished(true);
      return;
    }

    // Set a minimum loading time of 2 seconds
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useGSAP(() => {
    // Only animate when loading is complete (progress 100 or !active), min time elapsed, and not already finished
    const isLoadComplete = progress === 100 || !active;

    if (
      isLoadComplete &&
      minTimeElapsed &&
      !finished &&
      containerRef.current &&
      !showSquares
    ) {
      // Mark session as loaded
      sessionStorage.setItem('plupack_loaded', 'true');

      // Trigger the transition to squares
      setShowSquares(true);

      // We need a small delay to let React render the squares before animating them
      setTimeout(() => {
        console.log('Starting Squares Animation v3.3');
        const squares =
          gsap.utils.toArray<HTMLDivElement>('.loading-square');

        if (squares.length === 0) {
          console.error('No squares found for animation!');
          setFinished(true); // Fallback
          return;
        }

        // Force initial state to ensure GSAP takes control
        gsap.set(squares, { scale: 1, opacity: 1 });

        // Animate squares
        gsap.to(squares, {
          scale: 0,
          opacity: 0,
          duration: 0.5,
          stagger: {
            grid: [rows, cols],
            from: 'center',
            amount: 0.75, // Fast ripple effect
          },
          ease: 'power2.inOut',
          onComplete: () => {
            console.log('Animation Complete');
            setFinished(true);
          },
        });

        // Fade out the text
        gsap.to('.loading-text-final', {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out',
        });

        // Safety timeout: If animation somehow hangs, force finish after 3 seconds
        setTimeout(() => {
          // We can't easily check 'finished' state here due to closure,
          // but we can check if the element is still in DOM or just force it.
          // Better to just force it if it hasn't unmounted.
          console.warn('Animation safety timeout check');
          // We'll rely on the user seeing the console warning if it happens.
          // To actually force it, we'd need a ref to the finished state or similar.
          // For now, let's just trust the onComplete, but if we really want safety:
          setFinished(true);
        }, 3000);
      }, 200); // Increased delay to 200ms to ensure DOM is ready in Shopify
    }
  }, [progress, active, finished, minTimeElapsed, showSquares]);

  if (finished) return null;

  return createPortal(
    <div
      ref={containerRef}
      className="fixed inset-0 flex items-center justify-center pointer-events-none"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100dvh',
        zIndex: 2147483647,
        margin: 0,
        padding: 0,
      }}
    >
      {/* 
        Phase 1: Loading State 
        Visible only when squares are NOT shown
      */}
      {!showSquares && (
        <>
          {/* Layer 1: Blue Background & White Text */}
          <div className="absolute inset-0 bg-[#146C90] w-full h-full">
            <div className="absolute bottom-8 left-8 z-20 text-white">
              <div className="text-9xl font-light tracking-tighter">
                {Math.round(progress)}%
              </div>
            </div>
          </div>

          {/* Layer 2: White Fill & Blue Text (Clipped) */}
          <div
            className="absolute inset-0 w-full h-full bg-white"
            style={{
              clipPath: `inset(0 0 ${100 - progress}% 0)`,
              transition: 'clip-path 0.2s linear',
            }}
          >
            <div className="absolute bottom-8 left-8 z-20 text-[#146C90]">
              <div className="text-9xl font-light tracking-tighter">
                {Math.round(progress)}%
              </div>
            </div>
          </div>
        </>
      )}

      {/* 
        Phase 2: Reveal Animation 
        Grid of white squares that animate out
      */}
      {showSquares && (
        <>
          <div
            ref={gridRef}
            className="absolute inset-0 grid w-full h-full pointer-events-auto"
            style={{
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gridTemplateRows: `repeat(${rows}, 1fr)`,
            }}
          >
            {Array.from({ length: rows * cols }).map((_, i) => (
              <div
                key={i}
                className="loading-square"
                ref={(el) => {
                  if (el) {
                    // Manually set important style to override any Shopify theme CSS
                    el.style.setProperty(
                      'transition',
                      'none',
                      'important'
                    );
                    el.style.width = '100%';
                    el.style.height = '100%';
                    el.style.backgroundColor = 'white';
                  }
                }}
                style={{
                  // Fallback styles
                  willChange: 'transform, opacity',
                }}
              />
            ))}
          </div>

          {/* Final Text (Blue) - Fades out with squares */}
          <div className="loading-text-final absolute bottom-8 left-8 z-20 text-[#146C90]">
            <div className="text-9xl font-light tracking-tighter">
              100%
            </div>
          </div>
        </>
      )}
    </div>,
    document.body
  );
}
