import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useShopifyTheme } from '@/hooks/useShopifyTheme';

gsap.registerPlugin(ScrollTrigger);

// ============================================
// PRE-FOOTER SECTION COMPONENT
// ============================================
export function PreFooterSection() {
  const { getFontFamily } = useShopifyTheme();
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Animate content on scroll
  useGSAP(
    () => {
      if (!sectionRef.current || !contentRef.current) return;

      gsap.fromTo(
        contentRef.current.children,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        },
      );
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="pre-footer-trigger relative z-20 w-full min-h-[90vh] flex items-center justify-center overflow-hidden"
    >
      {/* Blur Overlay - sits above the 3D canvas (GlobalCanvas is z-10) */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundColor: 'rgba(30, 67, 119, 0.25)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      />

      {/* Content Container */}
      <div
        ref={contentRef}
        className="relative z-10 flex flex-col items-center justify-center text-center px-6 md:px-12 py-20"
      >
        {/* Main Headline */}
        <h2
          className="text-4xl md:text-6xl lg:text-[90px] font-bold uppercase tracking-tight leading-[1] text-white mb-2"
          style={{ fontFamily: getFontFamily('heading') }}
        >
          Centralizá tu abastecimiento.
        </h2>

        {/* Subheadline */}
        <p
          className="text-2xl md:text-4xl lg:text-[56px] font-medium uppercase tracking-tight leading-[1.1] text-white/70 mb-12"
          style={{ fontFamily: getFontFamily('heading') }}
        >
          Simplificá tu gestión.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <a
            href="/collections/all"
            className="px-10 py-3 bg-white text-[#0B6386] rounded-[10px] font-semibold hover:bg-gray-100 transition-colors uppercase text-sm tracking-wider"
            style={{ fontFamily: getFontFamily('body') }}
          >
            Ver productos
          </a>
        </div>
      </div>
    </section>
  );
}
