import { useRef } from 'react';
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
  const hasAnimatedRef = useRef(false);

  useGSAP(
    () => {
      const el = itemRef.current;
      const counterEl = counterRef.current;
      if (!el || !counterEl) return;

      counterEl.textContent = `0${suffix}`;
      const counter = { val: 0 };
      let lastRenderedValue = 0;

      const tween = gsap.to(counter, {
        val: value,
        duration: 1.6,
        delay,
        ease: 'power2.out',
        paused: true,
        snap: { val: 1 },
        onUpdate: () => {
          const nextValue = Math.round(counter.val);
          if (nextValue === lastRenderedValue) return;
          lastRenderedValue = nextValue;
          counterEl.textContent = `${nextValue}${suffix}`;
        },
      });

      const trigger = ScrollTrigger.create({
        trigger: el,
        start: 'top 82%',
        once: true,
        onEnter: () => {
          if (hasAnimatedRef.current) return;
          hasAnimatedRef.current = true;
          tween.play();
        },
      });

      return () => {
        trigger.kill();
        tween.kill();
      };
    },
    { scope: itemRef },
  );

  const isDark = textColor === 'dark';

  return (
    <div
      ref={itemRef}
      className="metric-item rounded-lg p-8 lg:p-12 flex flex-col justify-between h-full min-h-[250px] transform-gpu will-change-transform will-change-opacity"
      style={{
        backgroundColor,
        contain: 'layout paint',
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
            fontVariantNumeric: 'tabular-nums',
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
      gsap.set(items, { y: 24, autoAlpha: 0, force3D: true });

      gsap.to(items, {
        y: 0,
        autoAlpha: 1,
        duration: 0.55,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 85%',
          once: true,
        },
        clearProps: 'transform,opacity,visibility',
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
          className="metrics-grid"
        >
          {METRICS.map((metric, index) => (
            <div
              key={metric.label}
              className={
                index === 0 ? 'md:row-span-2' : undefined
              }
            >
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
                textColor={index === 1 ? 'dark' : 'light'}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
