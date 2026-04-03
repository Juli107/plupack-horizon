import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { LenisRef } from 'lenis/react';
import { ReactLenis, useLenis } from 'lenis/react';
import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
} from 'react';
import { EnvironmentSection } from './EnvironmentSection';
import { GlobalLightDarkOverlay } from './GlobalLightDarkOverlay';
import { Hero } from './hero/Hero';
import { IndustryDynamicsSection } from './IndustryDynamicsSection';
import { IndustrySections } from './IndustrySections';
import { LogisticsMapSection } from './LogisticsMapSection';
import { LogoCarousel } from './LogoCarousel';
import { MetricsSection } from './MetricsSection';
import { NoiseOverlay } from './NoiseOverlay';
import { PreFooterSection } from './PreFooterSection';
import { ProductsShowcaseSection } from './ProductsShowcaseSection';
import { PurchaseProcessSection } from './PurchaseProcessSection';
import { ScrollDebugger } from './ScrollDebugger';
import { ServicesSection } from './ServicesSection';
import { StockSustainabilityWrapper } from './StockSustainabilityWrapper';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const GlobalCanvas = lazy(() =>
  import('./GlobalCanvas').then((module) => ({
    default: module.GlobalCanvas,
  }))
);

// ============================================
// HEADER TINT CONTROLLER
// ============================================
// This hook communicates with the Liquid header to change its tint
// based on which section the user is viewing

type HeaderTint = 'light' | 'dark' | 'blue';

function useHeaderTintControl() {
  useEffect(() => {
    const header = document.querySelector(
      '#header-component',
    ) as HTMLElement;
    if (!header) return;

    // Add transition for smooth tint changes
    header.style.transition = 'all 0.4s ease';

    return () => {
      // Cleanup: remove any added classes
      header.classList.remove(
        'header--tint-light',
        'header--tint-dark',
      );
    };
  }, []);

  // Function to change header tint - can be called from ScrollTrigger
  const setHeaderTint = (tint: HeaderTint) => {
    const header = document.querySelector('#header-component');
    if (!header) return;

    header.classList.remove(
      'header--tint-light',
      'header--tint-dark',
      'header--tint-blue',
    );

    if (tint === 'dark') {
      header.classList.add('header--tint-dark');
    } else if (tint === 'blue') {
      header.classList.add('header--tint-blue');
    } else {
      header.classList.add('header--tint-light');
    }
  };

  return { setHeaderTint };
}

// ============================================
// LENIS GSAP INTEGRATION HOOK
// ============================================
// This hook syncs Lenis with GSAP ScrollTrigger
function useLenisGSAP(lenisRef: React.RefObject<LenisRef | null>) {
  useEffect(() => {
    // Add Lenis raf to GSAP ticker
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }
    gsap.ticker.add(update);

    // Disable lag smoothing for immediate responsiveness
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
    };
  }, [lenisRef]);

  // Use useLenis to sync with ScrollTrigger (runs on every scroll)
  useLenis(() => {
    ScrollTrigger.update();
  });
}

function useDeferredCanvasMount() {
  const [shouldMountCanvas, setShouldMountCanvas] = useState(false);

  useEffect(() => {
    if (shouldMountCanvas) return;

    let idleId: number | null = null;
    let fallbackId: ReturnType<typeof globalThis.setTimeout> | null =
      null;

    const mountCanvas = () => {
      setShouldMountCanvas(true);
    };

    const handleFirstInteraction = () => {
      mountCanvas();
    };

    window.addEventListener('scroll', handleFirstInteraction, {
      passive: true,
      once: true,
    });
    window.addEventListener('pointerdown', handleFirstInteraction, {
      passive: true,
      once: true,
    });

    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(mountCanvas, {
        timeout: 1800,
      });
    } else {
      fallbackId = globalThis.setTimeout(mountCanvas, 1200);
    }

    return () => {
      window.removeEventListener('scroll', handleFirstInteraction);
      window.removeEventListener('pointerdown', handleFirstInteraction);

      if (idleId !== null && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId);
      }

      if (fallbackId !== null) {
        globalThis.clearTimeout(fallbackId);
      }
    };
  }, [shouldMountCanvas]);

  return shouldMountCanvas;
}

// ============================================
// MAIN HOMEPAGE COMPONENT
// ============================================

interface HomepageProps {
  backgroundColor?: string;
  shopName?: string;
  headingText?: string;
  subheadingText?: string;
}

export function Homepage({
  backgroundColor = '#084e85',
  headingText: _headingText,
  subheadingText: _subheadingText,
}: HomepageProps) {
  // Lenis ref for GSAP integration
  const lenisRef = useRef<LenisRef>(null);
  const shouldMountCanvas = useDeferredCanvasMount();

  // Sync Lenis with GSAP ScrollTrigger
  useLenisGSAP(lenisRef);

  // Header tint controller
  const { setHeaderTint } = useHeaderTintControl();

  useGSAP(() => {
    setHeaderTint('light');

    // Initial state check - set based on current scroll position
    const stockTrigger = document.querySelector(
      '.stock-sustainability-trigger',
    );
    const preFooterTrigger = document.querySelector(
      '.pre-footer-trigger',
    );

    if (stockTrigger && preFooterTrigger) {
      const stockRect = stockTrigger.getBoundingClientRect();
      const preFooterRect = preFooterTrigger.getBoundingClientRect();
      const viewportCenter = window.scrollY + window.innerHeight / 2;

      // Convert to document-relative positions
      const stockTop = stockRect.top + window.scrollY;
      const preFooterBottom = preFooterRect.bottom + window.scrollY;

      if (
        viewportCenter >= stockTop &&
        viewportCenter < preFooterBottom
      ) {
        setHeaderTint('blue');
      } else {
        setHeaderTint('light');
      }
    }

    // Change to blue when entering StockSustainabilityWrapper
    ScrollTrigger.create({
      trigger: '.stock-sustainability-trigger',
      start: 'top center',
      onEnter: () => setHeaderTint('blue'),
      onEnterBack: () => setHeaderTint('blue'),
      onLeaveBack: () => setHeaderTint('light'),
    });

    // Back to light when PreFooter section is almost fully visible
    ScrollTrigger.create({
      trigger: '.pre-footer-trigger',
      start: 'bottom 90%',
      onEnter: () => setHeaderTint('light'),
      onLeaveBack: () => setHeaderTint('blue'),
    });
  }, []);

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        prevent: (node) =>
          node instanceof HTMLElement
            ? node.closest('[data-lenis-prevent]') !== null
            : false,
        autoRaf: false,
      }}
    >
      <main
        className="relative w-full"
        style={{
          backgroundColor: backgroundColor,
          overflowX: 'clip',
        }}
      >
        {/* Global fixed 3D canvas - scroll synced camera */}
        {shouldMountCanvas ? (
          <Suspense fallback={null}>
            <GlobalCanvas />
          </Suspense>
        ) : null}
        <GlobalLightDarkOverlay />
        {import.meta.env.DEV ? <ScrollDebugger /> : null}

        <NoiseOverlay />
        <Hero />
        <LogoCarousel />
        <div
          className="w-full"
          style={{
            backgroundColor: '#084e85',
            height: 'clamp(3rem, 6vh, 5rem)',
          }}
        />
        <MetricsSection />
        <ServicesSection />
        {/* SECTION 1: The Logistics Proof - Map transition after horizontal scroll */}
        <LogisticsMapSection />
        {/* <div className="h-[875.24px]">Products</div> */}
        <ProductsShowcaseSection />
        <IndustryDynamicsSection />
        <IndustrySections />
        {/* COMBINED: Stock explosion - Images persist across scroll */}
        <StockSustainabilityWrapper />
        <EnvironmentSection />
        <PurchaseProcessSection />
        <PreFooterSection />
      </main>
      {/* <div className="h-[603.99px]">Footer</div> */}
    </ReactLenis>
  );
}
