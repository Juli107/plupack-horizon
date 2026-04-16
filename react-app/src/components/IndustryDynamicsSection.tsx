import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useShopifyTheme } from '@/hooks/useShopifyTheme';

// ============================================
// INDUSTRY DYNAMICS SECTION — T21 REDESIGN
// Clean text-only transition section.
// Title: "ATENCIÓN A MEDIDA"
// Subtitle: "NOS ADAPTAMOS A LA NECESIDAD DE TU EMPRESA"
// No images, no CTA.
// ============================================
export function IndustryDynamicsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const { getFontFamily } = useShopifyTheme();

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      const title = titleRef.current;
      const subtitle = subtitleRef.current;

      if (!title || !subtitle) return;

      // Initial hidden states
      gsap.set(title, { y: 60, opacity: 0 });
      gsap.set(subtitle, { y: 40, opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          toggleActions: 'play none none none',
        },
      });

      // Title fades/slides up
      tl.to(
        title,
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
        },
      );

      // Subtitle follows
      tl.to(
        subtitle,
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
        },
        '-=0.5',
      );
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="industry-dynamics"
      ref={sectionRef}
      className="relative w-full flex items-center justify-center overflow-hidden"
      style={{
        backgroundColor: '#084e85',
        minHeight: 'auto',
        padding: 'clamp(3.25rem, 8vh, 7rem) 1.25rem',
      }}
    >
      <div className="relative z-10 text-center w-full max-w-4xl mx-auto px-4 sm:px-6">
        {/* Title */}
        <h2
          ref={titleRef}
          className="font-bold uppercase tracking-wider mb-6 sm:mb-8"
          style={{
            fontFamily: getFontFamily('heading'),
            color: '#FFFFFF',
            fontSize: 'clamp(1.9rem, 7.4vw, 4.5rem)',
            lineHeight: 0.95,
            letterSpacing: '0.045em',
          }}
        >
          ATENCIÓN A MEDIDA
        </h2>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="font-medium uppercase tracking-[0.08em] sm:tracking-widest"
          style={{
            fontFamily: getFontFamily('body'),
            color: 'rgba(255, 255, 255, 0.82)',
            fontSize: 'clamp(0.85rem, 2.5vw, 1.35rem)',
            lineHeight: 1.45,
            letterSpacing: '0.08em',
          }}
        >
          NOS ADAPTAMOS A LA NECESIDAD DE TU EMPRESA
        </p>
      </div>
    </section>
  );
}
