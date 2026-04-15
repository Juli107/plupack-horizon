import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef, useState } from 'react';
import {
  ClipboardList,
  FileText,
  Headset,
  Route,
  Truck,
  UserPlus,
  type LucideIcon,
} from 'lucide-react';
import { useShopifyTheme } from '@/hooks/useShopifyTheme';

// ============================================
// TYPES
// ============================================
interface ProcessStep {
  number: string;
  title: string;
  subtitle?: string;
  Icon: LucideIcon;
}

// ============================================
// PROCESS STEPS DATA
// ============================================
const PROCESS_STEPS: ProcessStep[] = [
  { number: '01', title: 'Requerimiento de compra', Icon: ClipboardList },
  { number: '02', title: 'Cotización personalizada', Icon: FileText },
  { number: '03', title: 'Alta del cliente o proveedor', Icon: UserPlus },
  {
    number: '04',
    title: 'Coordinación de la entrega',
    subtitle: '*Garantizada en 10 días hábiles',
    Icon: Truck,
  },
  {
    number: '05',
    title: 'Seguimiento en tiempo real y envíos sin cargo',
    Icon: Route,
  },
  { number: '06', title: 'Asesoramiento post-entrega', Icon: Headset },
];

// Line height between steps (in pixels) - MASSIVE SPACING!
const LINE_HEIGHT = 180;

// ============================================
// PURCHASE PROCESS SECTION COMPONENT
// Non-sticky, scrolling section with generous spacing
// ============================================
export function PurchaseProcessSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const progressLinesRef = useRef<(HTMLDivElement | null)[]>([]);
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);
  const dotsRef = useRef<(HTMLDivElement | null)[]>([]);
  const { getFontFamily } = useShopifyTheme();
  const [currentStep, setCurrentStep] = useState(0);

  useGSAP(
    () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const steps = stepsRef.current.filter(
        Boolean
      ) as HTMLDivElement[];
      const dots = dotsRef.current.filter(
        Boolean
      ) as HTMLDivElement[];
      const progressLines = progressLinesRef.current.filter(
        Boolean
      ) as HTMLDivElement[];
      const numberEl = numberRef.current;

      if (steps.length === 0) return;

      // Set initial states - hide all steps except first
      gsap.set(steps.slice(1), { opacity: 0, y: 40 });
      gsap.set(steps[0], { opacity: 1, y: 0 });
      gsap.set(dots.slice(1), {
        scale: 0.4,
        backgroundColor: 'rgba(27, 75, 107, 0.1)',
      });
      gsap.set(dots[0], { scale: 1, backgroundColor: '#1B4B6B' });
      gsap.set(progressLines, {
        scaleY: 0,
        transformOrigin: 'top center',
      });

      // Animate each step as it enters viewport
      steps.forEach((step, i) => {
        if (i === 0) return; // First step is already visible

        const dot = dots[i];
        const progressLine = progressLines[i - 1];

        ScrollTrigger.create({
          trigger: step,
          start: 'top 75%',
          onEnter: () => {
            // Animate step appearing
            gsap.to(step, {
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease: 'power3.out',
            });

            // Animate dot
            if (dot) {
              gsap.to(dot, {
                scale: 1,
                backgroundColor: '#1B4B6B',
                duration: 0.5,
                ease: 'power2.out',
              });
            }

            // Animate progress line filling
            if (progressLine) {
              gsap.to(progressLine, {
                scaleY: 1,
                duration: 0.6,
                ease: 'power2.out',
              });
            }

            // Update number
            if (numberEl && i !== currentStep) {
              setCurrentStep(i);
              gsap.to(numberEl, {
                opacity: 0,
                y: -25,
                duration: 0.2,
                onComplete: () => {
                  numberEl.textContent = PROCESS_STEPS[i].number;
                  gsap.to(numberEl, {
                    opacity: 1,
                    y: 0,
                    duration: 0.2,
                  });
                },
              });
            }
          },
          onLeaveBack: () => {
            // Reverse animations when scrolling back up
            gsap.to(step, {
              opacity: 0,
              y: 40,
              duration: 0.4,
              ease: 'power2.in',
            });

            if (dot) {
              gsap.to(dot, {
                scale: 0.4,
                backgroundColor: 'rgba(27, 75, 107, 0.1)',
                duration: 0.3,
              });
            }

            if (progressLine) {
              gsap.to(progressLine, {
                scaleY: 0,
                duration: 0.3,
              });
            }

            // Update number back
            const prevIndex = Math.max(0, i - 1);
            if (numberEl) {
              setCurrentStep(prevIndex);
              gsap.to(numberEl, {
                opacity: 0,
                y: 25,
                duration: 0.15,
                onComplete: () => {
                  numberEl.textContent =
                    PROCESS_STEPS[prevIndex].number;
                  gsap.to(numberEl, {
                    opacity: 1,
                    y: 0,
                    duration: 0.15,
                  });
                },
              });
            }
          },
        });
      });

      return () => {
        ScrollTrigger.getAll().forEach((st) => {
          if (st.trigger && container.contains(st.trigger as Node)) {
            st.kill();
          }
        });
      };
    },
    {
      scope: containerRef,
      dependencies: [],
    }
  );

  return (
    <div
      ref={containerRef}
      className="relative z-20 py-28 md:py-40"
      style={{ backgroundColor: '#E8ECF2' }}
    >
      <div className="w-full max-w-6xl mx-auto px-6 md:px-12">
        {/* Title - centered */}
        <h2
          className="text-center font-bold mb-24 md:mb-32"
          style={{
            fontFamily: getFontFamily('heading'),
            color: '#1B4B6B',
            fontSize: 'clamp(2rem, 6vw, 3.5rem)',
            letterSpacing: '0.05em',
          }}
        >
          PROCESO DE
          <br />
          COMPRA
        </h2>

        {/* Main content - 3 column grid for perfect centering */}
        <div className="grid grid-cols-[64px_minmax(0,1fr)] md:grid-cols-[1fr_48px_1fr] items-start">
          {/* Left side - Big number (right aligned, sticky) */}
          <div className="hidden md:block h-full">
            <div className="sticky top-[30vh] flex justify-end pr-12 lg:pr-16">
              <span
                ref={numberRef}
                className="font-bold select-none"
                style={{
                  fontFamily: getFontFamily('heading'),
                  color: 'rgba(27, 75, 107, 0.2)',
                  fontSize: 'clamp(10rem, 20vw, 16rem)',
                  lineHeight: 0.85,
                }}
              >
                01
              </span>
            </div>
          </div>

          {/* Center - Timeline dots and lines */}
          <div className="flex flex-col items-center">
            {PROCESS_STEPS.map((_, index) => (
              <div
                key={index}
                className="flex flex-col items-center"
                style={{
                  minHeight:
                    index === PROCESS_STEPS.length - 1
                      ? 'auto'
                      : `${LINE_HEIGHT}px`,
                }}
              >
                {/* Dot — vertically centered against the 32px icon/title row */}
                <div
                  ref={(el) => {
                    dotsRef.current[index] = el;
                  }}
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{
                    marginTop: 8,
                    backgroundColor:
                      index === 0
                        ? '#1B4B6B'
                        : 'rgba(27, 75, 107, 0.1)',
                  }}
                />
                {/* Vertical line below dot, stretching to next dot */}
                {index < PROCESS_STEPS.length - 1 && (
                  <div className="relative w-0.5 flex-1">
                    {/* Background line */}
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundColor: 'rgba(27, 75, 107, 0.1)',
                      }}
                    />
                    {/* Progress line fill */}
                    <div
                      ref={(el) => {
                        progressLinesRef.current[index] = el;
                      }}
                      className="absolute inset-0 origin-top"
                      style={{
                        backgroundColor: '#1B4B6B',
                        transform: 'scaleY(0)',
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right side - Step texts with icons */}
          <div className="flex flex-col">
            {PROCESS_STEPS.map((step, index) => (
              <div
                key={index}
                ref={(el) => {
                  stepsRef.current[index] = el;
                }}
                className="flex"
                style={{
                  minHeight:
                    index === PROCESS_STEPS.length - 1
                      ? 'auto'
                      : `${LINE_HEIGHT}px`,
                  alignItems: 'flex-start',
                }}
              >
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{
                    width: 32,
                    height: 32,
                    border: '1px solid rgba(27, 75, 107, 0.25)',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(27, 75, 107, 0.06)',
                    marginRight: 3,
                  }}
                >
                  <step.Icon
                    size={16}
                    strokeWidth={2}
                    color="#1B4B6B"
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <p
                    className="font-semibold"
                    style={{
                      fontFamily: getFontFamily('body'),
                      color: '#1B4B6B',
                      fontSize: 'clamp(1.05rem, 2.3vw, 1.35rem)',
                      lineHeight: 1.3,
                    }}
                  >
                    {step.title}
                  </p>
                  {step.subtitle && (
                    <p
                      className="mt-1"
                      style={{
                        fontFamily: getFontFamily('body'),
                        color: 'rgba(27, 75, 107, 0.5)',
                        fontSize: 'clamp(0.8rem, 1.6vw, 0.95rem)',
                        fontStyle: 'italic',
                      }}
                    >
                      {step.subtitle}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
