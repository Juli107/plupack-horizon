import { useRef, useEffect, useState } from 'react';

// Image Imports
import industry1 from '../assets/industry_img/industry-1.webp';
import industry2 from '../assets/industry_img/industry-2.webp';
import industry3 from '../assets/industry_img/industry-3.webp';

import gastronomy1 from '../assets/industry_img/gastronomy-1.webp';
import gastronomy2 from '../assets/industry_img/gastronomy-2.webp';
import gastronomy3 from '../assets/industry_img/gastronomy-3.webp';

import institution1 from '../assets/industry_img/institution-1.webp';
import institution2 from '../assets/industry_img/institution-2.webp';
import institution3 from '../assets/industry_img/institution-3.webp';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

// Preload images for smoother transitions
const preloadImages = (images: string[]) => {
  images.forEach((src) => {
    const img = new Image();
    img.src = src;
  });
};

// Automatic slideshow component with instant transitions
const AutomaticSlideshow = ({ images }: { images: string[] }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev: number) => (prev + 1) % images.length);
    }, 800); // Change image every 800ms

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="absolute inset-0 w-full h-full">
      {images.map((src, index) => (
        <img
          key={src}
          src={src}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-none ${
            index === activeIndex ? 'opacity-100' : 'opacity-0'
          }`}
          loading={index === 0 ? 'eager' : 'lazy'}
          decoding="async"
        />
      ))}
    </div>
  );
};

export function IndustryDynamicsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const shopifyAssets = (window as any).SHOPIFY_DATA?.assets;

  const industryImages = [
    shopifyAssets?.industry1 || industry1,
    shopifyAssets?.industry2 || industry2,
    shopifyAssets?.industry3 || industry3,
  ];
  const gastronomyImages = [
    shopifyAssets?.gastronomy1 || gastronomy1,
    shopifyAssets?.gastronomy2 || gastronomy2,
    shopifyAssets?.gastronomy3 || gastronomy3,
  ];
  const institutionImages = [
    shopifyAssets?.institution1 || institution1,
    shopifyAssets?.institution2 || institution2,
    shopifyAssets?.institution3 || institution3,
  ];

  // Preload all images when component mounts
  useEffect(() => {
    preloadImages([
      ...industryImages,
      ...gastronomyImages,
      ...institutionImages,
    ]);
  }, []);

  useGSAP(
    () => {
      if (!containerRef.current || !sectionRef.current) return;

      const rows = containerRef.current.children;

      // Text and image reveal animations for each row
      Array.from(rows).forEach((row) => {
        const text = row.querySelectorAll('.text-reveal');
        const image = row.querySelectorAll('.reveal-image');

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: row,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        });

        tl.fromTo(
          text,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            stagger: 0.1,
          }
        );

        if (image.length > 0) {
          tl.fromTo(
            image,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.8,
              ease: 'power2.out',
              stagger: 0.15,
            },
            '-=0.5'
          );

          // Parallax effect
          gsap.to(image, {
            yPercent: 8,
            ease: 'none',
            scrollTrigger: {
              trigger: row,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.5,
            },
          });
        }
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen bg-[#146C90] text-white flex items-center justify-center py-24 overflow-hidden"
    >
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div
          ref={containerRef}
          className="flex flex-col gap-16 md:gap-24 w-full max-w-7xl mx-auto"
        >
          {/* Row 1: CADA INDUSTRIA + Wide Image */}
          <div className="flex flex-col md:flex-row items-start md:items-end gap-8 md:gap-16 border-b border-white/10 pb-12">
            <h2 className="text-reveal text-6xl md:text-8xl font-light font-['Montserrat'] leading-[0.9] tracking-tight shrink-0">
              CADA
              <br />
              INDUSTRIA
            </h2>
            <div className="reveal-image w-full md:flex-1 h-48 md:h-64 bg-white/10 relative overflow-hidden mix-blend-luminosity hover:mix-blend-normal transition-all duration-500 will-change-transform transform-gpu">
              <AutomaticSlideshow images={industryImages} />
            </div>
          </div>

          {/* Row 2: TIENE SU + DINAMICA + Square Image */}
          <div className="flex flex-col md:flex-row items-baseline gap-8 md:gap-16 relative border-b border-white/10 pb-12">
            <span className="text-reveal text-5xl md:text-7xl font-light font-['Montserrat'] tracking-tight shrink-0">
              TIENE SU
            </span>
            <div className="relative w-full">
              {/* Added text-shadow for contrast safety */}
              <span className="text-reveal text-7xl md:text-[10rem] font-black font-['Montserrat'] tracking-tighter text-[#5EEAD4] leading-[0.8] relative z-10 block drop-shadow-lg">
                DINÁMICA
              </span>
              {/* Image 2 behind DINAMICA */}
              <div className="reveal-image w-40 md:w-64 aspect-square bg-white/10 absolute right-0 md:right-20 top-1/2 -translate-y-1/2 z-0 mix-blend-luminosity hover:mix-blend-normal transition-all duration-500 will-change-transform transform-gpu">
                {/* Dark gradient overlay for contrast */}
                <div className="absolute inset-0 bg-linear-to-l from-black/40 to-transparent z-10 pointer-events-none"></div>
                <AutomaticSlideshow images={gastronomyImages} />
              </div>
            </div>
          </div>

          {/* Row 3: NOSOTROS SEGUIMOS + LA TUYA + Large Image */}
          <div className="flex flex-col md:flex-row items-end justify-between gap-12 w-full">
            <div className="flex flex-col">
              <h2 className="text-reveal text-6xl md:text-8xl font-light font-['Montserrat'] leading-[0.9] tracking-tight">
                NOSOTROS
              </h2>
              <h2 className="text-reveal text-6xl md:text-8xl font-light font-['Montserrat'] leading-[0.9] tracking-tight">
                SEGUIMOS
              </h2>
              <div className="flex items-center gap-6 mt-4">
                <span className="text-reveal text-6xl md:text-8xl font-bold font-['Montserrat'] tracking-tight text-[#5EEAD4]">
                  LA TUYA
                </span>
                <svg
                  className="text-reveal w-12 h-12 md:w-20 md:h-20 text-[#5EEAD4]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            <div className="reveal-image w-full md:w-[400px] h-[400px] md:h-[500px] bg-white/10 relative overflow-hidden mix-blend-luminosity hover:mix-blend-normal transition-all duration-500 will-change-transform transform-gpu">
              <AutomaticSlideshow images={institutionImages} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
