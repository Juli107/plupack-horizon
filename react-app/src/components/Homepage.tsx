import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { LenisRef } from 'lenis/react';
import { ReactLenis, useLenis } from 'lenis/react';
import { useEffect, useRef } from 'react';
import { GlobalCanvas } from './GlobalCanvas';
import { Hero } from './hero/Hero';
import { IndustryDynamicsSection } from './IndustryDynamicsSection';
import { IndustrySections } from './IndustrySections';
import { LogisticsMapSection } from './LogisticsMapSection';
import { NoiseOverlay } from './NoiseOverlay';
import { PreFooterSection } from './PreFooterSection';
import { PurchaseProcessSection } from './PurchaseProcessSection';
import { ServicesSection } from './ServicesSection';
import { StockSustainabilityWrapper } from './StockSustainabilityWrapper';
import { LogoCarousel } from './LogoCarousel';
import { ScrollDebugger } from './ScrollDebugger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// ============================================
// HEADER TINT CONTROLLER
// ============================================
// This hook communicates with the Liquid header to change its tint
// based on which section the user is viewing

type HeaderTint = 'light' | 'dark';

function useHeaderTintControl() {
  useEffect(() => {
    const header = document.querySelector(
      '#header-component'
    ) as HTMLElement;
    if (!header) return;

    // Add transition for smooth tint changes
    header.style.transition = 'all 0.4s ease';

    return () => {
      // Cleanup: remove any added classes
      header.classList.remove(
        'header--tint-light',
        'header--tint-dark'
      );
    };
  }, []);

  // Function to change header tint - can be called from ScrollTrigger
  const setHeaderTint = (tint: HeaderTint) => {
    const header = document.querySelector('#header-component');
    if (!header) return;

    if (tint === 'dark') {
      header.classList.add('header--tint-dark');
      header.classList.remove('header--tint-light');
    } else {
      header.classList.add('header--tint-light');
      header.classList.remove('header--tint-dark');
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
        <ScrollDebugger />

        <NoiseOverlay />
        <Hero />
        <LogoCarousel />
        <ServicesSection />
        {/* SECTION 1: The Logistics Proof - Map transition after horizontal scroll */}
        <LogisticsMapSection />
        <IndustryDynamicsSection />
        <IndustrySections />
        {/* COMBINED: Stock + Sustainability - Images persist across both phases */}
        <StockSustainabilityWrapper />
        <PurchaseProcessSection />
        <PreFooterSection />
      </main>
      <div className="h-[603.99px]">Footer</div>
    </ReactLenis>
  );
}
