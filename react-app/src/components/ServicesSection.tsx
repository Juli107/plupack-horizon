import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef, useLayoutEffect } from 'react';

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    id: '01',
    title: 'UN SOLO PROVEEDOR, CERO FRICCIÓN',
    description:
      'Centralizamos todo tu embalaje (industria, gastronomía y salud) en un único punto de contacto. Eliminamos la gestión con múltiples proveedores para que recuperes ese tiempo operativo.',
  },
  {
    id: '02',
    title: 'PRECIOS ESTABLES Y ACUERDOS A LARGO PLAZO',
    description:
      'Olvidate de la variabilidad mensual. Ofrecemos cotizaciones fijas y contratos flexibles que te permiten planificar tus costos sin sorpresas ni aumentos imprevistos.',
  },
  {
    id: '03',
    title: 'STOCK INTELIGENTE Y ENTREGAS GARANTIZADAS',
    description:
      'Monitoreamos tu consumo para reponer automáticamente antes de que te falte (evitando quiebres de stock). Coordinamos entregas ágiles con seguimiento en tiempo real para asegurar tu continuidad.',
  },
  {
    id: '04',
    title: 'CALIDAD CONTROLADA Y RESPUESTA INMEDIATA',
    description:
      'Productos testeados bajo estándares estrictos. Y si algo surge, tenés un ejecutivo de cuenta asignado para resolverlo al instante.',
  },
];

export function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const horizontalRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    // Refresh ScrollTrigger after layout
    ScrollTrigger.refresh();
  }, []);

  useGSAP(
    () => {
      if (
        !sectionRef.current ||
        !triggerRef.current ||
        !horizontalRef.current
      )
        return;

      const horizontalSection = horizontalRef.current;

      // Get all the cards
      const cards = gsap.utils.toArray<HTMLElement>('.service-card');

      // Calculate the total width to scroll
      // We need to move the content so the last card is visible
      const getScrollDistance = () => {
        const totalWidth = horizontalSection.scrollWidth;
        const viewportWidth = window.innerWidth;
        return totalWidth - viewportWidth;
      };

      // Create the horizontal scroll animation
      const scrollTween = gsap.to(horizontalSection, {
        x: () => -getScrollDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: triggerRef.current,
          start: 'top top',
          end: () => `+=${getScrollDistance()}`,
          scrub: 0.5,
          pin: true,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });

      // Animate cards as they come into view during horizontal scroll
      cards.forEach((card) => {
        gsap.fromTo(
          card,
          {
            opacity: 0,
            y: 30,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              containerAnimation: scrollTween,
              start: 'left 80%',
              end: 'left 60%',
              scrub: true,
            },
          }
        );
      });

      // Title reveal animation (plays once when section enters)
      const titleElements = document.querySelectorAll(
        '.services-reveal-text'
      );
      gsap.fromTo(
        titleElements,
        {
          clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)',
          y: 20,
          opacity: 0,
        },
        {
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      return () => {
        scrollTween.scrollTrigger?.kill();
      };
    },
    { scope: sectionRef, dependencies: [] }
  );

  return (
    <section ref={sectionRef} className="relative">
      {/* This is the pinned container */}
      <div ref={triggerRef} className="overflow-hidden">
        {/* This is what moves horizontally */}
        <div
          ref={horizontalRef}
          className="flex min-h-screen bg-[#146C90] text-white"
          style={{ width: 'fit-content' }}
        >
          {/* First panel - Title Section */}
          <div className="w-screen h-screen flex flex-col justify-center items-center px-6 shrink-0">
            <div className="container mx-auto text-center">
              <h2 className="text-4xl md:text-6xl font-medium mb-4 leading-tight font-['Montserrat']">
                <span className="services-reveal-text block">
                  QUE LA FALTA DE UN INSUMO
                </span>
                <span className="services-reveal-text inline-block bg-white text-[#2D637E] px-4 py-1 mt-2 font-bold transform -skew-x-2">
                  NO FRENE TU PRODUCCIÓN
                </span>
              </h2>
              <p className="services-reveal-text text-xl md:text-2xl mt-8 font-['Montserrat'] uppercase tracking-widest opacity-90">
                Nosotros ofrecemos
              </p>
            </div>
          </div>

          {/* Cards Section */}
          <div className="flex items-center gap-8 px-8 shrink-0">
            {services.map((service) => (
              <div
                key={service.id}
                className="service-card w-[85vw] md:w-[600px] h-[450px] p-8 md:p-12 flex flex-col justify-between relative group shrink-0"
              >
                {/* Glassmorphism Background */}
                <div className="absolute inset-0 bg-white/10 backdrop-blur-md border border-white/20 shadow-lg rounded-sm transform transition-transform duration-500 group-hover:scale-[1.02]"></div>

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-6xl font-light font-['Montserrat'] opacity-50">
                      {service.id}
                    </span>
                  </div>

                  <div className="mt-auto">
                    <h3 className="text-2xl md:text-3xl font-medium mb-4 font-['Montserrat'] leading-tight min-h-[90px] flex items-end">
                      {service.title}
                    </h3>
                    <p className="text-base md:text-lg font-['Open_Sans'] opacity-90 leading-relaxed min-h-40">
                      {service.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {/* End spacer to ensure last card is fully visible */}
            <div className="w-[20vw] shrink-0"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
