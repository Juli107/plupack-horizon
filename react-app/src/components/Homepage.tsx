import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { LenisRef } from 'lenis/react';
import { ReactLenis, useLenis } from 'lenis/react';
import { useEffect, useRef } from 'react';
import { useShopifyTheme } from '../hooks/useShopifyTheme';
import { GlobalCanvas } from './GlobalCanvas';
import { Hero } from './hero/Hero';
import { IndustryDynamicsSection } from './IndustryDynamicsSection';
import { IndustrySections } from './IndustrySections';
import { NoiseOverlay } from './NoiseOverlay';
import { ServicesSection } from './ServicesSection';

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
// UTILITY FUNCTIONS
// ============================================

// Adjust hex color brightness
function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(
    255,
    Math.max(0, ((num >> 8) & 0x00ff) + amount)
  );
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b)
    .toString(16)
    .slice(1)}`;
}

// ============================================
// MAIN HOMEPAGE COMPONENT
// ============================================

interface HomepageProps {
  backgroundColor?: string;
  shopName?: string;
  accentColor?: string;
  headingText?: string;
  subheadingText?: string;
}

export function Homepage({
  backgroundColor = '#146C90',
  accentColor = '#ffffff',
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
        className="relative w-full overflow-x-hidden"
        style={{ backgroundColor: backgroundColor }}
      >
        {/* Global fixed 3D canvas - scroll synced camera */}
        <GlobalCanvas />

        <NoiseOverlay />
        <Hero />
        <ServicesSection />
        <IndustryDynamicsSection />
        <IndustrySections />

        {/* Additional scroll content for demo */}
        <ScrollSections
          backgroundColor={backgroundColor}
          accentColor={accentColor}
          setHeaderTint={setHeaderTint}
        />
      </main>
    </ReactLenis>
  );
}

// ============================================
// DEMO SCROLL SECTIONS
// ============================================

interface ScrollSectionsProps {
  backgroundColor: string;
  accentColor: string;
  setHeaderTint: (tint: 'light' | 'dark') => void;
}

function ScrollSections({
  backgroundColor,
  accentColor,
  setHeaderTint,
}: ScrollSectionsProps) {
  const section1Ref = useRef<HTMLDivElement>(null);
  const section2Ref = useRef<HTMLDivElement>(null);
  const whiteSectionRef = useRef<HTMLDivElement>(null);
  const section3Ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Reveal animations for each section
    const sections = [
      section1Ref.current,
      section2Ref.current,
      whiteSectionRef.current,
      section3Ref.current,
    ];

    sections.forEach((section) => {
      if (!section) return;

      const content = section.querySelector('.content');

      gsap.from(content, {
        y: 100,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });
    });

    // Header tint change for white section
    if (whiteSectionRef.current) {
      ScrollTrigger.create({
        trigger: whiteSectionRef.current,
        start: 'top 10%', // When white section reaches near top
        end: 'bottom 10%', // Until bottom of white section passes
        onEnter: () => setHeaderTint('dark'),
        onLeave: () => setHeaderTint('light'),
        onEnterBack: () => setHeaderTint('dark'),
        onLeaveBack: () => setHeaderTint('light'),
      });
    }
  }, [setHeaderTint]);

  // Get theme fonts from Shopify settings
  const { getFontFamily } = useShopifyTheme();

  const sectionStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  };

  const contentStyle: React.CSSProperties = {
    textAlign: 'center',
    color: accentColor,
    fontFamily: getFontFamily('body'), // Uses Shopify theme font
    padding: '2rem',
    maxWidth: '800px',
  };

  const headingStyle: React.CSSProperties = {
    fontSize: '3rem',
    marginBottom: '1rem',
    fontFamily: getFontFamily('heading'), // Uses Shopify heading font
  };

  return (
    <>
      <section
        ref={section1Ref}
        style={{
          ...sectionStyle,
          background: adjustColor(backgroundColor, -20),
        }}
      >
        <div className="content" style={contentStyle}>
          <h2 style={headingStyle}>Section One</h2>
          <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>
            This content animates in as you scroll. Lenis provides
            smooth scrolling, while GSAP ScrollTrigger handles the
            reveal animations.
          </p>
        </div>
      </section>

      <section
        ref={section2Ref}
        style={{
          ...sectionStyle,
          background: adjustColor(backgroundColor, -40),
        }}
      >
        <div className="content" style={contentStyle}>
          <h2 style={headingStyle}>Section Two</h2>
          <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>
            The 3D elements in the hero respond to scroll position
            through a shared ref, creating seamless 2D + 3D scroll
            interactions.
          </p>
        </div>
      </section>

      {/* White background section - header tint changes here */}
      <section
        ref={whiteSectionRef}
        style={{
          ...sectionStyle,
          background: '#ffffff',
        }}
      >
        <div
          className="content"
          style={{ ...contentStyle, color: '#333' }}
        >
          <h2 style={{ ...headingStyle, color: backgroundColor }}>
            White Section
          </h2>
          <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>
            Notice how the header changes from light text to dark text
            when you scroll over this white background section.
          </p>
        </div>
      </section>

      <section
        ref={section3Ref}
        style={{
          ...sectionStyle,
          background: adjustColor(backgroundColor, -60),
        }}
      >
        <div className="content" style={contentStyle}>
          <h2 style={headingStyle}>Section Three</h2>
          <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>
            All interactive content lives in React. Liquid handles
            basic structure and Shopify data injection - React handles
            the experience.
          </p>
        </div>
      </section>
    </>
  );
}
