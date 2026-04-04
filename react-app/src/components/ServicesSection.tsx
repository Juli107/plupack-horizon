import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import {
  useRef,
  useLayoutEffect,
  useCallback,
} from 'react';
import {
  BadgeDollarSign,
  Boxes,
  ShieldCheck,
  Truck,
  type LucideIcon,
} from 'lucide-react';

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  Icon: LucideIcon;
}

const services: ServiceItem[] = [
  {
    id: '01',
    title: 'CENTRALIZACIÓN DE PROVEEDORES',
    description:
      'Un solo punto de contacto para el abastecimiento de sus insumos no productivos. Optimizando la gestión y reduciendo tiempos administrativos.',
    Icon: Boxes,
  },
  {
    id: '02',
    title: 'PRECIOS ESTABLES Y ACUERDOS A LARGO PLAZO',
    description:
      'Ofrecemos cotizaciones fijas y contratos flexibles que permiten planificar y evitar aumentos imprevistos.',
    Icon: BadgeDollarSign,
  },
  {
    id: '03',
    title: 'STOCK INTELIGENTE Y ENTREGAS GARANTIZADAS',
    description:
      'Control de inventario y reposición automática para evitar quiebres de stock. Compromiso en los plazos de entrega y seguimiento en tiempo real para asegurar la continuidad de su operación.',
    Icon: Truck,
  },
  {
    id: '04',
    title: 'CALIDAD CONTROLADA Y ASESORAMIENTO',
    description:
      'Productos evaluados bajo estándares estrictos y un ejecutivo dedicado que acompaña tu operación con soporte directo y resolución inmediata.',
    Icon: ShieldCheck,
  },
];

// Lightweight 3D Tilt Card - uses CSS transforms for performance
function TiltCard({ service }: { service: ServiceItem }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const lastUpdate = useRef(0);
  const frameRef = useRef<number | null>(null);
  const rotationRef = useRef({ rotateX: 0, rotateY: 0 });

  const applyTransform = useCallback(() => {
    frameRef.current = null;

    if (!cardRef.current) return;

    const { rotateX, rotateY } = rotationRef.current;
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }, []);

  const scheduleTransform = useCallback(() => {
    if (frameRef.current !== null) return;

    frameRef.current = window.requestAnimationFrame(applyTransform);
  }, [applyTransform]);

  useLayoutEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Throttle to ~30fps for performance
      const now = Date.now();
      if (now - lastUpdate.current < 33) return;
      lastUpdate.current = now;

      if (!cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate rotation (max 8 degrees - reduced for subtlety)
      rotationRef.current = {
        rotateX: ((y - centerY) / centerY) * -8,
        rotateY: ((x - centerX) / centerX) * 8,
      };

      scheduleTransform();
    },
    [scheduleTransform],
  );

  const handleMouseLeave = useCallback(() => {
    rotationRef.current = { rotateX: 0, rotateY: 0 };
    scheduleTransform();
  }, [scheduleTransform]);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="service-card w-[85vw] md:w-[600px] max-w-[85vw] md:max-w-[600px] [@media(min-width:768px)_and_(min-height:900px)]:w-[680px] [@media(min-width:768px)_and_(min-height:900px)]:max-w-[680px] [@media(min-width:1024px)_and_(max-height:760px)]:w-[640px] [@media(min-width:1024px)_and_(max-height:760px)]:max-w-[640px] h-[450px] p-8 md:p-12 [@media(max-height:760px)]:h-[390px] [@media(max-height:760px)]:p-6 flex flex-col justify-between relative group shrink-0"
      style={{
        transformStyle: 'preserve-3d',
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
        transition: 'transform 0.15s ease-out',
        willChange: 'transform',
      }}
    >
      {/* Glassmorphism Background */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 100%)',
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-6">
          <span className="text-6xl font-light font-['Montserrat'] opacity-50">
            {service.id}
          </span>
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
            style={{
              border: '1px solid rgba(255,255,255,0.35)',
              backgroundColor: 'rgba(255,255,255,0.12)',
            }}
          >
            <service.Icon
              size={22}
              strokeWidth={1.9}
              color="rgba(255,255,255,0.92)"
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="mt-auto">
          <h3 className="text-2xl md:text-3xl font-medium mb-4 font-['Montserrat'] leading-tight min-h-[90px] [@media(max-height:760px)]:min-h-[70px] flex items-end">
            {service.title}
          </h3>
          <p className="text-base font-['Open_Sans'] opacity-90 leading-relaxed min-h-40 [@media(max-height:760px)]:min-h-28">
            {service.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const horizontalRef = useRef<HTMLDivElement>(null);

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
          },
        );
      });

      // Title reveal animation (plays once when section enters)
      const titleElements = document.querySelectorAll(
        '.services-reveal-text',
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
        },
      );

      return () => {
        scrollTween.scrollTrigger?.kill();
      };
    },
    { scope: sectionRef, dependencies: [] },
  );

  return (
    <section ref={sectionRef} className="relative">
      {/* This is the pinned container */}
      <div ref={triggerRef} className="overflow-hidden">
        {/* This is what moves horizontally */}
        <div
          ref={horizontalRef}
          className="flex min-h-screen text-white"
          style={{ width: 'fit-content' }}
        >
          {/* First panel - Title Section */}
          <div className="w-screen h-screen flex flex-col justify-center items-center px-6 shrink-0">
            <div className="container mx-auto text-center">
              <h2 className="text-4xl md:text-6xl font-medium mb-4 leading-tight font-['Montserrat']">
                <span className="services-reveal-text block">
                  QUE LA FALTA DE UN INSUMO
                </span>
                <span className="services-reveal-text inline-block bg-white text-[#084e85] px-4 py-1 mt-2 font-bold transform -skew-x-2">
                  NO FRENE TU OPERACIÓN
                </span>
              </h2>
              <p className="services-reveal-text mt-8 text-lg md:text-xl opacity-90 max-w-3xl mx-auto font-['Open_Sans']">
                Gestionamos los insumos que no generan ingresos
                directos, pero cuya ausencia puede afectar tiempos,
                entregas y servicio. Con fabricación propia y
                logística eficiente, convertimos el abastecimiento en
                una variable controlada.
              </p>
            </div>
          </div>

          {/* Cards Section */}
          <div className="flex items-center gap-8 px-8 shrink-0">
            {services.map((service) => (
              <TiltCard key={service.id} service={service} />
            ))}
            {/* End spacer to ensure last card is fully visible */}
            <div className="w-[20vw] shrink-0"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
