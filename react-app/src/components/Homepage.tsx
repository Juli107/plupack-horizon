import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { LenisRef } from 'lenis/react';
import { ReactLenis, useLenis } from 'lenis/react';
import { useEffect, useRef, useState } from 'react';
import { EnvironmentSection } from './EnvironmentSection';
import { GlobalCanvas } from './GlobalCanvas';
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
  const [shouldRenderCanvas, setShouldRenderCanvas] =
    useState(false);
  const [shouldRenderTierOneSections, setShouldRenderTierOneSections] =
    useState(false);
  const [shouldRenderTierTwoSections, setShouldRenderTierTwoSections] =
    useState(false);
  const [shouldRenderTierThreeSections, setShouldRenderTierThreeSections] =
    useState(false);
  const [shouldRenderNoiseOverlay, setShouldRenderNoiseOverlay] =
    useState(false);

  // Lenis ref for GSAP integration
  const lenisRef = useRef<LenisRef>(null);
  const tierOneSentinelRef = useRef<HTMLDivElement | null>(null);
  const tierTwoSentinelRef = useRef<HTMLDivElement | null>(null);
  const tierThreeSentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let rafId = 0;
    let nestedRafId = 0;
    let idleCallbackId: number | null = null;
    let timeoutId = 0;
    let cancelled = false;

    const activateCanvas = () => {
      if (!cancelled) {
        setShouldRenderCanvas(true);
      }
    };

    rafId = window.requestAnimationFrame(() => {
      nestedRafId = window.requestAnimationFrame(() => {
        if (typeof window.requestIdleCallback === 'function') {
          idleCallbackId = window.requestIdleCallback(activateCanvas, {
            timeout: 700,
          });
          return;
        }

        timeoutId = window.setTimeout(activateCanvas, 0);
      });
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(rafId);
      window.cancelAnimationFrame(nestedRafId);

      if (
        idleCallbackId !== null &&
        typeof window.cancelIdleCallback === 'function'
      ) {
        window.cancelIdleCallback(idleCallbackId);
      }

      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    let tierOneTimeoutId = 0;
    let tierTwoTimeoutId = 0;
    let tierThreeTimeoutId = 0;
    let idleCallbackId: number | null = null;
    let tierOneObserver: IntersectionObserver | null = null;
    let cancelled = false;

    const activateTierOne = () => {
      if (cancelled) {
        return;
      }

      setShouldRenderTierOneSections(true);
    };

    const activateTierTwo = () => {
      if (cancelled) {
        return;
      }

      setShouldRenderTierTwoSections(true);
    };

    const activateTierThree = () => {
      if (cancelled) {
        return;
      }

      setShouldRenderTierThreeSections(true);
    };

    if (typeof window.requestIdleCallback === 'function') {
      idleCallbackId = window.requestIdleCallback(activateTierOne, {
        timeout: 1200,
      });
    } else {
      tierOneTimeoutId = window.setTimeout(activateTierOne, 700);
    }

    tierTwoTimeoutId = window.setTimeout(activateTierTwo, 2200);
    tierThreeTimeoutId = window.setTimeout(activateTierThree, 3600);

    if (tierOneSentinelRef.current) {
      tierOneObserver = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            activateTierOne();
            tierOneObserver?.disconnect();
          }
        },
        {
          root: null,
          rootMargin: '240px 0px',
          threshold: 0.01,
        }
      );

      tierOneObserver.observe(tierOneSentinelRef.current);
    }

    return () => {
      cancelled = true;
      window.clearTimeout(tierOneTimeoutId);
      window.clearTimeout(tierTwoTimeoutId);
      window.clearTimeout(tierThreeTimeoutId);
      tierOneObserver?.disconnect();

      if (
        idleCallbackId !== null &&
        typeof window.cancelIdleCallback === 'function'
      ) {
        window.cancelIdleCallback(idleCallbackId);
      }
    };
  }, []);

  useEffect(() => {
    if (!shouldRenderTierOneSections || shouldRenderTierTwoSections) {
      return;
    }

    const node = tierTwoSentinelRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldRenderTierTwoSections(true);
          observer.disconnect();
        }
      },
      {
        root: null,
        rootMargin: '360px 0px',
        threshold: 0.01,
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [shouldRenderTierOneSections, shouldRenderTierTwoSections]);

  useEffect(() => {
    if (!shouldRenderTierTwoSections || shouldRenderTierThreeSections) {
      return;
    }

    const node = tierThreeSentinelRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldRenderTierThreeSections(true);
          observer.disconnect();
        }
      },
      {
        root: null,
        rootMargin: '420px 0px',
        threshold: 0.01,
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [shouldRenderTierThreeSections, shouldRenderTierTwoSections]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setShouldRenderNoiseOverlay(true);
    }, 1100);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  // Sync Lenis with GSAP ScrollTrigger
  useLenisGSAP(lenisRef);

  // Header tint controller
  const { setHeaderTint } = useHeaderTintControl();

  useGSAP(() => {
    setHeaderTint('light');

    let pollId = 0;
    let stockTintTrigger: ScrollTrigger | null = null;
    let preFooterTintTrigger: ScrollTrigger | null = null;

    const setupHeaderTintTriggers = () => {
      const stockTrigger = document.querySelector(
        '.stock-sustainability-trigger',
      );
      const preFooterTrigger = document.querySelector(
        '.pre-footer-trigger',
      );

      if (!stockTrigger || !preFooterTrigger) {
        return false;
      }

      const stockRect = stockTrigger.getBoundingClientRect();
      const preFooterRect = preFooterTrigger.getBoundingClientRect();
      const viewportCenter = window.scrollY + window.innerHeight / 2;

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

      stockTintTrigger = ScrollTrigger.create({
        trigger: stockTrigger,
        start: 'top center',
        onEnter: () => setHeaderTint('blue'),
        onEnterBack: () => setHeaderTint('blue'),
        onLeaveBack: () => setHeaderTint('light'),
      });

      preFooterTintTrigger = ScrollTrigger.create({
        trigger: preFooterTrigger,
        start: 'bottom 90%',
        onEnter: () => setHeaderTint('light'),
        onLeaveBack: () => setHeaderTint('blue'),
      });

      return true;
    };

    if (!setupHeaderTintTriggers()) {
      pollId = window.setInterval(() => {
        if (setupHeaderTintTriggers()) {
          window.clearInterval(pollId);
        }
      }, 200);
    }

    return () => {
      window.clearInterval(pollId);
      stockTintTrigger?.kill();
      preFooterTintTrigger?.kill();
    };
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
        {shouldRenderCanvas ? (
          <GlobalCanvas />
        ) : null}
        <GlobalLightDarkOverlay />
        {import.meta.env.DEV ? <ScrollDebugger /> : null}

        {shouldRenderNoiseOverlay ? <NoiseOverlay /> : null}
        <Hero />
        <div
          ref={tierOneSentinelRef}
          style={{ height: 1, width: '100%' }}
          aria-hidden="true"
        />
        {shouldRenderTierOneSections ? (
          <>
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

            <div
              ref={tierTwoSentinelRef}
              style={{ height: 1, width: '100%' }}
              aria-hidden="true"
            />
            {shouldRenderTierTwoSections ? (
              <>
                {/* SECTION 1: The Logistics Proof - Map transition after horizontal scroll */}
                <LogisticsMapSection />
                <ProductsShowcaseSection />
                <IndustryDynamicsSection />
                <IndustrySections />

                <div
                  ref={tierThreeSentinelRef}
                  style={{ height: 1, width: '100%' }}
                  aria-hidden="true"
                />
                {shouldRenderTierThreeSections ? (
                  <>
                    {/* COMBINED: Stock explosion - Images persist across scroll */}
                    <StockSustainabilityWrapper />
                    <EnvironmentSection />
                    <PurchaseProcessSection />
                    <PreFooterSection />
                  </>
                ) : (
                  <div
                    style={{ height: '210vh', width: '100%' }}
                    aria-hidden="true"
                  />
                )}
              </>
            ) : (
              <div
                style={{ height: '220vh', width: '100%' }}
                aria-hidden="true"
              />
            )}
          </>
        ) : (
          <div
            style={{ height: '460vh', width: '100%' }}
            aria-hidden="true"
          />
        )}
      </main>
      {/* <div className="h-[603.99px]">Footer</div> */}
    </ReactLenis>
  );
}
