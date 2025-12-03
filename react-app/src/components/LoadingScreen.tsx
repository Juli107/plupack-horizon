import { useProgress } from '@react-three/drei';
import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export function LoadingScreen() {
  const { progress, active } = useProgress();
  const [finished, setFinished] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [showSquares, setShowSquares] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Number of columns and rows for the grid
  const cols = 10;
  const rows = 10;

  useEffect(() => {
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
        const squares =
          gsap.utils.toArray<HTMLDivElement>('.loading-square');

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
            setFinished(true);
          },
        });
      }, 50);
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
        height: '100dvh', // Dynamic viewport height for mobile/Shopify
        zIndex: 2147483647, // Max z-index
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
          {/* Blue Background */}
          <div className="absolute inset-0 bg-[#146C90] w-full h-full" />

          {/* White Fill Animation */}
          <div
            className="absolute top-0 left-0 w-full bg-white transition-[height] duration-200 ease-linear"
            style={{ height: `${progress}%` }}
          />

          {/* Loading Content (Progress) */}
          <div className="absolute bottom-8 left-8 z-20 text-[#146C90] mix-blend-difference">
            <div className="text-8xl font-light tracking-tighter">
              {Math.round(progress)}%
            </div>
          </div>
        </>
      )}

      {/* 
        Phase 2: Reveal Animation 
        Grid of white squares that animate out
      */}
      {showSquares && (
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
              className="loading-square w-full h-full bg-white"
            />
          ))}
        </div>
      )}
    </div>,
    document.body
  );
}
