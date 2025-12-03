import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef, useEffect } from 'react';

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

gsap.registerPlugin(ScrollTrigger);

// Preload images for smoother transitions
const preloadImages = (images: string[]) => {
  images.forEach((src) => {
    const img = new Image();
    img.src = src;
  });
};

// Scroll-synced slideshow component
const ScrollSlideshow = ({
  images,
  slideshowRef,
}: {
  images: string[];
  slideshowRef: React.RefObject<HTMLDivElement | null>;
}) => {
  return (
    <div
      ref={slideshowRef}
      className="absolute inset-0 w-full h-full will-change-transform"
    >
      {images.map((src, index) => (
        <img
          key={src}
          src={src}
          alt=""
          data-index={index}
          className="slideshow-image absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: index === 0 ? 1 : 0,
            willChange: 'opacity',
          }}
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

  // Refs for each slideshow container
  const industrySlideRef = useRef<HTMLDivElement>(null);
  const gastronomySlideRef = useRef<HTMLDivElement>(null);
  const institutionSlideRef = useRef<HTMLDivElement>(null);

  const industryImages = [industry1, industry2, industry3];
  const gastronomyImages = [gastronomy1, gastronomy2, gastronomy3];
  const institutionImages = [
    institution1,
    institution2,
    institution3,
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

      // Scroll-synced slideshow animation helper
      const createScrollSlideshow = (
        slideRef: React.RefObject<HTMLDivElement | null>,
        imageCount: number
      ) => {
        if (!slideRef.current) return;

        const images = slideRef.current.querySelectorAll(
          '.slideshow-image'
        );
        if (images.length === 0) return;

        // Create a timeline that cycles through images based on section scroll
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        });

        // Animate through each image
        images.forEach((img, index) => {
          const nextIndex = (index + 1) % imageCount;
          const progress = index / imageCount;

          if (index < imageCount - 1) {
            // Fade out current, fade in next
            tl.to(
              img,
              {
                opacity: 0,
                duration: 0.1,
                ease: 'power1.inOut',
              },
              progress + 0.8 / imageCount
            );
            tl.to(
              images[nextIndex],
              {
                opacity: 1,
                duration: 0.1,
                ease: 'power1.inOut',
              },
              progress + 0.8 / imageCount
            );
          }
        });
      };

      // Initialize scroll-synced slideshows
      createScrollSlideshow(industrySlideRef, industryImages.length);
      createScrollSlideshow(
        gastronomySlideRef,
        gastronomyImages.length
      );
      createScrollSlideshow(
        institutionSlideRef,
        institutionImages.length
      );
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
              <ScrollSlideshow
                images={industryImages}
                slideshowRef={industrySlideRef}
              />
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
                <ScrollSlideshow
                  images={gastronomyImages}
                  slideshowRef={gastronomySlideRef}
                />
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
              <ScrollSlideshow
                images={institutionImages}
                slideshowRef={institutionSlideRef}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
