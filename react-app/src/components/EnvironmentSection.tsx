import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useShopifyTheme } from '@/hooks/useShopifyTheme';
import warehouseImage from '@/assets/warehouse-environment.webp';

gsap.registerPlugin(ScrollTrigger);

// ============================================
// CHECKLIST DATA
// ============================================
const CHECKLIST_ITEMS = [
  'Envases y embalajes reciclables',
  'Reducción de huella de carbono logística',
  'Optimización de rutas de distribución',
  'Reutilización de materiales de empaque',
];

// ============================================
// ENVIRONMENT SECTION — T28-T30
// ============================================
export function EnvironmentSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const { getFontFamily } = useShopifyTheme();

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      const title = titleRef.current;
      const content = contentRef.current;
      const image = imageRef.current;
      if (!title || !content || !image) return;

      gsap.set(title, { y: 40, opacity: 0 });

      const items = content.querySelectorAll('.env-animate');
      gsap.set(items, { y: 25, opacity: 0 });
      gsap.set(image, { y: 0, scale: 1.12, transformOrigin: 'center center' });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          toggleActions: 'play none none none',
        },
      });

      tl.to(title, {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: 'power3.out',
      });

      tl.to(
        items,
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power3.out',
        },
        '-=0.3'
      );

      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      if (!prefersReducedMotion) {
        gsap.fromTo(
          image,
          { y: -56 },
          {
            y: 56,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      }
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative z-20 w-full"
      style={{
        backgroundColor: '#0A3D54',
        paddingTop: 'clamp(5rem, 10vh, 7rem)',
        paddingBottom: 'clamp(5rem, 10vh, 7rem)',
        paddingLeft: '1.5rem',
        paddingRight: '1.5rem',
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Content */}
        <div
          ref={contentRef}
          className="flex flex-col md:flex-row gap-10 md:gap-16 items-stretch"
        >
          {/* Left: Image */}
          <div className="w-full md:w-[420px] shrink-0">
            <div
              className="w-full h-full overflow-hidden"
              style={{
                boxShadow: '0 28px 60px rgba(1, 17, 25, 0.26)',
                minHeight: '100%',
              }}
            >
              <img
                ref={imageRef}
                src={warehouseImage}
                alt="Depósito logístico de PLUPack"
                className="block w-full h-full object-cover"
                style={{ objectPosition: 'center 38%' }}
                loading="lazy"
              />
            </div>
          </div>

          {/* Right: Text content */}
          <div className="flex-1 w-full">
            <h2
              ref={titleRef}
              className="font-bold mb-8 md:mb-10"
              style={{
                fontFamily: getFontFamily('heading'),
                color: '#FFFFFF',
                fontSize: 'clamp(1.6rem, 4vw, 2.5rem)',
                lineHeight: 1.15,
                letterSpacing: '0.04em',
              }}
            >
              COMPROMETIDOS CON
              <br />
              EL MEDIO AMBIENTE
            </h2>

            <p
              className="env-animate mb-8"
              style={{
                fontFamily: getFontFamily('body'),
                color: 'rgba(255, 255, 255, 0.75)',
                fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)',
                lineHeight: 1.75,
              }}
            >
              Trabajamos bajo un modelo de economía circular, priorizando
              materiales reciclables y procesos logísticos que reducen el
              impacto ambiental. Cada decisión operativa está orientada
              hacia la sustentabilidad.
            </p>

            {/* Checklist */}
            <ul className="flex flex-col gap-3.5">
              {CHECKLIST_ITEMS.map((item) => (
                <li
                  key={item}
                  className="env-animate flex items-center gap-3"
                >
                  <div
                    className="flex items-center justify-center shrink-0"
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(94, 234, 212, 0.12)',
                    }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#5EEAD4"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <span
                    style={{
                      fontFamily: getFontFamily('body'),
                      color: 'rgba(255, 255, 255, 0.85)',
                      fontSize: 'clamp(0.85rem, 1.5vw, 0.95rem)',
                    }}
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>


        </div>
      </div>
    </section>
  );
}
