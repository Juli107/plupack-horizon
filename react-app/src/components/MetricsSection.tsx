import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useShopifyTheme } from '@/hooks/useShopifyTheme';

gsap.registerPlugin(ScrollTrigger);

// ============================================
// METRICS DATA
// ============================================
interface Metric {
  value: number;
  suffix: string;
  label: string;
  description?: string;
  backgroundColor?: string;
  textColor?: 'dark' | 'light';
}

const METRICS: Metric[] = [
  { 
    value: 10, 
    suffix: '+', 
    label: 'años en el mercado',
    description: 'Experiencia y trayectoria comprobada'
  },
  { 
    value: 300, 
    suffix: '+', 
    label: 'clientes activos',
    description: 'Empresas de todos los rubros que confían en nuestra gestión día a día'
  },
  {
    value: 8,
    suffix: '+',
    label: 'sectores estratégicos abastecidos',
    description: 'Cobertura en industrias clave'
  },
];

// ============================================
// ANIMATED COUNTER
// ============================================
function AnimatedCounter({
  value,
  suffix,
  label,
  description,
  delay,
  getFontFamily,
  backgroundColor,
  textColor,
}: Metric & {
  delay: number;
  getFontFamily: (type: 'heading' | 'body') => string;
  backgroundColor: string;
  textColor: 'dark' | 'light';
}) {
  const counterRef = useRef<HTMLSpanElement>(null);
  const itemRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (hasAnimated) return;
    const el = itemRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasAnimated(true);
          observer.disconnect();

          const counterEl = counterRef.current;
          if (!counterEl) return;

          const counter = { val: 0 };
          gsap.to(counter, {
            val: value,
            duration: 2,
            delay,
            ease: 'power2.out',
            onUpdate: () => {
              counterEl.textContent =
                Math.round(counter.val * 10) / 10 + suffix;
            },
          });
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAnimated, value, suffix, delay]);

  const isDark = textColor === 'dark';

  return (
    <div
      ref={itemRef}
      className="metric-item rounded-3xl p-8 lg:p-12 flex flex-col justify-between h-full min-h-[250px]"
      style={{
        backgroundColor,
      }}
    >
      <div>
        <span
          ref={counterRef}
          className="font-bold block"
          style={{
            fontFamily: getFontFamily('heading'),
            color: isDark ? '#1B4B6B' : '#FFFFFF',
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            lineHeight: 1,
          }}
        >
          0{suffix}
        </span>
      </div>
      <div>
        <span
          className="font-bold block uppercase mb-2"
          style={{
            fontFamily: getFontFamily('heading'),
            color: isDark ? '#1B4B6B' : '#FFFFFF',
            fontSize: 'clamp(0.85rem, 1.5vw, 1.1rem)',
            letterSpacing: '0.05em',
          }}
        >
          {label}
        </span>
        {description && (
          <span
            className="text-sm block"
            style={{
              fontFamily: getFontFamily('body'),
              color: isDark ? '#4A6B8A' : 'rgba(255, 255, 255, 0.75)',
              fontSize: 'clamp(0.75rem, 1.1vw, 0.9rem)',
              lineHeight: 1.5,
            }}
          >
            {description}
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================
// METRICS SECTION
// ============================================
export function MetricsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { getFontFamily } = useShopifyTheme();

  useGSAP(
    () => {
      if (!containerRef.current) return;

      const items =
        containerRef.current.querySelectorAll('.metric-item');
      gsap.set(items, { y: 30, opacity: 0 });

      gsap.to(items, {
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
    },
    { scope: sectionRef },
  );

  return (
    <div
      ref={sectionRef}
      className="relative z-20 w-full"
      style={{ backgroundColor: '#E8ECF2' }}
    >
      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        {/* Title Section */}
        <div className="text-center mb-16 lg:mb-20">
          <h2
            className="font-bold mb-4"
            style={{
              fontFamily: getFontFamily('heading'),
              color: '#1B4B6B',
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              lineHeight: 1.2,
            }}
          >
            Impacto Medible, Resultados Reales
          </h2>
          <p
            style={{
              fontFamily: getFontFamily('body'),
              color: '#4A6B8A',
              fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
            }}
          >
            Datos que demuestran nuestro compromiso con cada cliente
          </p>
        </div>

        {/* Bento Grid - 3 items */}
        <div
          ref={containerRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
        >
          {/* Item 1 - Large left card (años en el mercado) */}
          <div
            className="md:row-span-2"
          >
            <AnimatedCounter
              {...METRICS[0]}
              delay={0}
              getFontFamily={getFontFamily}
              backgroundColor="#1B4B6B"
              textColor="light"
            />
          </div>

          {/* Item 2 - Top right (clientes activos) */}
          <div>
            <AnimatedCounter
              {...METRICS[1]}
              delay={0.12}
              getFontFamily={getFontFamily}
              backgroundColor="#F0F4F8"
              textColor="dark"
            />
          </div>

          {/* Item 3 - Bottom right (sectores) */}
          <div>
            <AnimatedCounter
              {...METRICS[2]}
              delay={0.24}
              getFontFamily={getFontFamily}
              backgroundColor="#0F2B48"
              textColor="light"
            />
          </div>

          {/* Mobile fallback */}
          <div className="md:hidden col-span-full">
            <div className="grid grid-cols-1 gap-6">
              {METRICS.map((metric, index) => (
                <div key={metric.label}>
                  <AnimatedCounter
                    {...metric}
                    delay={index * 0.12}
                    getFontFamily={getFontFamily}
                    backgroundColor={
                      index === 0
                        ? '#1B4B6B'
                        : index === 1
                        ? '#F0F4F8'
                        : '#0F2B48'
                    }
                    textColor={
                      index === 1 ? 'dark' : 'light'
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
