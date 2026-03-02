import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useShopifyTheme } from '@/hooks/useShopifyTheme';

gsap.registerPlugin(ScrollTrigger);

// ============================================
// PLACEHOLDER ICON
// ============================================
function PlaceholderIcon({ size = 48 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center"
      style={{
        width: size,
        height: size,
        border: '2px dashed rgba(94, 234, 212, 0.4)',
        borderRadius: '8px',
      }}
    >
      <svg
        width={size * 0.5}
        height={size * 0.5}
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(94, 234, 212, 0.5)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    </div>
  );
}

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
  const { getFontFamily } = useShopifyTheme();

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      const title = titleRef.current;
      const content = contentRef.current;
      if (!title || !content) return;

      gsap.set(title, { y: 40, opacity: 0 });

      const items = content.querySelectorAll('.env-animate');
      gsap.set(items, { y: 25, opacity: 0 });

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
        {/* Title */}
        <h2
          ref={titleRef}
          className="font-bold text-center mb-12 md:mb-16"
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

        {/* Content */}
        <div
          ref={contentRef}
          className="flex flex-col md:flex-row gap-10 md:gap-16 items-start"
        >
          {/* Left: Text content */}
          <div className="flex-1 w-full">
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

          {/* Right: Image placeholder */}
          <div className="env-animate w-full md:w-[420px] shrink-0">
            <div
              className="w-full aspect-[4/3] flex flex-col items-center justify-center gap-3"
              style={{
                border: '2px dashed rgba(94, 234, 212, 0.25)',
                borderRadius: '12px',
                backgroundColor: 'rgba(94, 234, 212, 0.03)',
              }}
            >
              <PlaceholderIcon size={48} />
              <span
                className="text-[10px] uppercase tracking-[0.2em]"
                style={{ color: 'rgba(94, 234, 212, 0.35)' }}
              >
                Imagen pendiente
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
