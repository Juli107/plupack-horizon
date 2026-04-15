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
import {
  INDUSTRY_ITEM_NAMES,
  preloadIndustryWrapModel,
} from './canvas/industryAssets';
import { preloadModels } from './canvas/Products';

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
  const [shouldRenderNoiseOverlay, setShouldRenderNoiseOverlay] =
    useState(false);
  const industryPreloadTriggerRef = useRef<HTMLDivElement>(null);
  const industryAssetsPreloadedRef = useRef(false);

  // Lenis ref for GSAP integration
  const lenisRef = useRef<LenisRef>(null);

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
    const timeoutId = window.setTimeout(() => {
      setShouldRenderNoiseOverlay(true);
    }, 1100);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  // Sync Lenis with GSAP ScrollTrigger
  useLenisGSAP(lenisRef);

  // Mobile rotation can leave stale ScrollTrigger pin spacers (white gap after footer).
  // Recalculate only on meaningful viewport changes (width/orientation), not URL-bar height shifts.
  useEffect(() => {
    let refreshTimeoutId = 0;
    let rafId = 0;
    let nestedRafId = 0;

    let lastWidth = window.innerWidth;
    let lastOrientation =
      window.innerWidth > window.innerHeight
        ? 'landscape'
        : 'portrait';

    const scheduleLayoutRefresh = () => {
      window.clearTimeout(refreshTimeoutId);
      window.cancelAnimationFrame(rafId);
      window.cancelAnimationFrame(nestedRafId);

      refreshTimeoutId = window.setTimeout(() => {
        rafId = window.requestAnimationFrame(() => {
          nestedRafId = window.requestAnimationFrame(() => {
            lenisRef.current?.lenis?.resize?.();
            ScrollTrigger.refresh();
          });
        });
      }, 220);
    };

    const handleResize = () => {
      const nextWidth = window.innerWidth;
      const nextOrientation =
        window.innerWidth > window.innerHeight
          ? 'landscape'
          : 'portrait';

      const widthChanged = Math.abs(nextWidth - lastWidth) > 2;
      const orientationChanged = nextOrientation !== lastOrientation;

      if (!widthChanged && !orientationChanged) {
        return;
      }

      lastWidth = nextWidth;
      lastOrientation = nextOrientation;
      scheduleLayoutRefresh();
    };

    const handleOrientationChange = () => {
      scheduleLayoutRefresh();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener(
        'orientationchange',
        handleOrientationChange,
      );
      window.clearTimeout(refreshTimeoutId);
      window.cancelAnimationFrame(rafId);
      window.cancelAnimationFrame(nestedRafId);
    };
  }, []);

  // Header tint controller
  const { setHeaderTint } = useHeaderTintControl();

  useGSAP(() => {
    setHeaderTint('blue');

    let pollId = 0;
    let topTintTrigger: ScrollTrigger | null = null;
    let metricsTintTrigger: ScrollTrigger | null = null;
    let stockTintTrigger: ScrollTrigger | null = null;
    let preFooterTintTrigger: ScrollTrigger | null = null;

    const setupHeaderTintTriggers = () => {
      const metricsTrigger = document.querySelector(
        '.metrics-tint-trigger',
      );
      const stockTrigger = document.querySelector(
        '.stock-sustainability-trigger',
      );
      const preFooterTrigger = document.querySelector(
        '.pre-footer-trigger',
      );

      if (
        !metricsTrigger ||
        !stockTrigger ||
        !preFooterTrigger
      ) {
        return false;
      }

      const applyTintForCurrentPosition = () => {
        const viewportCenter =
          window.scrollY + window.innerHeight / 2;
        const isNearTop = window.scrollY <= 24;

        const metricsRect = metricsTrigger.getBoundingClientRect();
        const stockRect = stockTrigger.getBoundingClientRect();
        const preFooterRect = preFooterTrigger.getBoundingClientRect();

        const metricsTop = metricsRect.top + window.scrollY;
        const metricsBottom = metricsRect.bottom + window.scrollY;
        const stockTop = stockRect.top + window.scrollY;
        const preFooterBottom = preFooterRect.bottom + window.scrollY;

        const isInMetricsRange =
          viewportCenter >= metricsTop &&
          window.scrollY < metricsBottom;
        const isInStockRange =
          viewportCenter >= stockTop &&
          viewportCenter < preFooterBottom;

        setHeaderTint(
          isNearTop || isInMetricsRange || isInStockRange
            ? 'blue'
            : 'light',
        );
      };

      applyTintForCurrentPosition();

      topTintTrigger = ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: '+=24',
        onEnter: applyTintForCurrentPosition,
        onLeave: applyTintForCurrentPosition,
        onEnterBack: applyTintForCurrentPosition,
        onLeaveBack: applyTintForCurrentPosition,
      });

      metricsTintTrigger = ScrollTrigger.create({
        trigger: metricsTrigger,
        start: 'top center',
        end: 'bottom top',
        onEnter: applyTintForCurrentPosition,
        onLeave: applyTintForCurrentPosition,
        onEnterBack: applyTintForCurrentPosition,
        onLeaveBack: applyTintForCurrentPosition,
      });

      stockTintTrigger = ScrollTrigger.create({
        trigger: stockTrigger,
        start: 'top center',
        end: 'bottom center',
        onEnter: applyTintForCurrentPosition,
        onLeave: applyTintForCurrentPosition,
        onEnterBack: applyTintForCurrentPosition,
        onLeaveBack: applyTintForCurrentPosition,
      });

      preFooterTintTrigger = ScrollTrigger.create({
        trigger: preFooterTrigger,
        start: 'bottom 90%',
        onEnter: applyTintForCurrentPosition,
        onLeave: applyTintForCurrentPosition,
        onEnterBack: applyTintForCurrentPosition,
        onLeaveBack: applyTintForCurrentPosition,
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
      topTintTrigger?.kill();
      metricsTintTrigger?.kill();
      stockTintTrigger?.kill();
      preFooterTintTrigger?.kill();
    };
  }, []);

  useGSAP(() => {
    const triggerEl = industryPreloadTriggerRef.current;
    if (!triggerEl) return;

    const prewarmIndustryAssets = () => {
      if (industryAssetsPreloadedRef.current) return;
      industryAssetsPreloadedRef.current = true;
      preloadIndustryWrapModel();
      preloadModels(INDUSTRY_ITEM_NAMES);
    };

    const trigger = ScrollTrigger.create({
      trigger: triggerEl,
      start: 'top bottom',
      onEnter: prewarmIndustryAssets,
      onEnterBack: prewarmIndustryAssets,
    });

    const triggerTop =
      triggerEl.getBoundingClientRect().top + window.scrollY;
    if (window.scrollY + window.innerHeight >= triggerTop) {
      prewarmIndustryAssets();
    }

    return () => {
      trigger.kill();
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
        <LogoCarousel />
        <div
          className="w-full"
          style={{
            backgroundColor: '#084e85',
            height: 'clamp(3rem, 6vh, 5rem)',
          }}
        />
        <MetricsSection />
        <div
          ref={industryPreloadTriggerRef}
          className="pointer-events-none h-px w-full"
          aria-hidden="true"
        />
        <ServicesSection />
        {/* SECTION 1: The Logistics Proof - Map transition after horizontal scroll */}
        <LogisticsMapSection />
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
