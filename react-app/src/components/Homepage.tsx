import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { LenisRef } from 'lenis/react';
import { ReactLenis, useLenis } from 'lenis/react';
import { Suspense, lazy, useEffect, useRef } from 'react';
import { GlobalCanvas } from './GlobalCanvas';
import { Hero } from './hero/Hero';
import { NoiseOverlay } from './NoiseOverlay';
import { ProductsShowcaseSection } from './ProductsShowcaseSection';
import { ServicesSection } from './ServicesSection';
import { LogoCarousel } from './LogoCarousel';
import { ScrollDebugger } from './ScrollDebugger';

const LogisticsMapSection = lazy(() =>
  import('./LogisticsMapSection').then((module) => ({
    default: module.LogisticsMapSection,
  })),
);

const IndustryDynamicsSection = lazy(() =>
  import('./IndustryDynamicsSection').then((module) => ({
    default: module.IndustryDynamicsSection,
  })),
);

const IndustrySections = lazy(() =>
  import('./IndustrySections').then((module) => ({
    default: module.IndustrySections,
  })),
);

const StockSustainabilityWrapper = lazy(() =>
  import('./StockSustainabilityWrapper').then((module) => ({
    default: module.StockSustainabilityWrapper,
  })),
);

const PurchaseProcessSection = lazy(() =>
  import('./PurchaseProcessSection').then((module) => ({
    default: module.PurchaseProcessSection,
  })),
);

const PreFooterSection = lazy(() =>
  import('./PreFooterSection').then((module) => ({
    default: module.PreFooterSection,
  })),
);

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

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

function SectionFallback({ className }: { className: string }) {
  return <div aria-hidden="true" className={className} />;
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
  backgroundColor = '#146C90',
  headingText: _headingText,
  subheadingText: _subheadingText,
}: HomepageProps) {
  // Lenis ref for GSAP integration
  const lenisRef = useRef<LenisRef>(null);

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
        <GlobalCanvas />
        {import.meta.env.DEV ? <ScrollDebugger /> : null}

        <NoiseOverlay />
        <Hero />
        <LogoCarousel />
        <ServicesSection />
        {/* SECTION 1: The Logistics Proof - Map transition after horizontal scroll */}
        <Suspense fallback={<SectionFallback className="h-[200vh]" />}>
          <LogisticsMapSection />
        </Suspense>
        {/* <div className="h-[875.24px]">Products</div> */}
        <ProductsShowcaseSection />
        <Suspense fallback={<SectionFallback className="min-h-screen" />}>
          <IndustryDynamicsSection />
        </Suspense>
        <Suspense fallback={<SectionFallback className="min-h-screen" />}>
          <IndustrySections />
        </Suspense>
        {/* COMBINED: Stock + Sustainability - Images persist across both phases */}
        <Suspense fallback={<SectionFallback className="min-h-screen" />}>
          <StockSustainabilityWrapper />
        </Suspense>
        <Suspense fallback={<SectionFallback className="min-h-screen" />}>
          <PurchaseProcessSection />
        </Suspense>
        <Suspense fallback={<SectionFallback className="min-h-screen" />}>
          <PreFooterSection />
        </Suspense>
      </main>
      {/* <div className="h-[603.99px]">Footer</div> */}
    </ReactLenis>
  );
}
