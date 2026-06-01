"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  HERO_SCREENSHOT_HEIGHT,
  HERO_SCREENSHOT_WIDTH,
  HERO_SCREENSHOTS,
} from "@/lib/brand/screenshots";

type HeroScreenshotsProps = {
  alt: string;
  scrollHint: string;
  prevLabel: string;
  nextLabel: string;
};

export function HeroScreenshots({
  alt,
  scrollHint,
  prevLabel,
  nextLabel,
}: HeroScreenshotsProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const syncFromScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const { scrollLeft, scrollWidth, clientWidth } = track;
    setCanScrollPrev(scrollLeft > 4);
    setCanScrollNext(scrollLeft + clientWidth < scrollWidth - 4);

    const slides = track.querySelectorAll<HTMLElement>("[data-slide-index]");
    if (!slides.length) return;

    const trackCenter = scrollLeft + clientWidth / 2;
    let closest = 0;
    let minDistance = Number.POSITIVE_INFINITY;

    slides.forEach((slide, index) => {
      const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
      const distance = Math.abs(slideCenter - trackCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closest = index;
      }
    });

    setActiveIndex(closest);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    syncFromScroll();

    const onScroll = () => syncFromScroll();
    track.addEventListener("scroll", onScroll, { passive: true });

    const ro = new ResizeObserver(() => syncFromScroll());
    ro.observe(track);

    return () => {
      track.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [syncFromScroll]);

  const scrollToIndex = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;

    const clamped = Math.max(0, Math.min(index, HERO_SCREENSHOTS.length - 1));
    const slide = track.querySelector<HTMLElement>(
      `[data-slide-index="${clamped}"]`,
    );
    if (!slide) return;

    const targetLeft =
      slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2;

    track.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: "smooth",
    });
  }, []);

  return (
    <div className="relative mt-16 w-full rounded-[2.5rem] border border-gray-200/90 bg-gradient-to-br from-slate-100 via-white to-blue-50/80 py-8 shadow-2xl shadow-gray-200/60 sm:py-10 md:py-12">
      <div
        className="pointer-events-none absolute inset-0 rounded-[2.5rem] opacity-60"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(59,130,246,0.12), transparent 70%)",
        }}
      />

      <div
        className={`pointer-events-none absolute inset-y-8 start-0 z-10 w-12 rounded-s-[2.5rem] bg-gradient-to-r from-slate-50/95 to-transparent transition-opacity duration-300 sm:w-16 ${
          canScrollPrev ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden
      />
      <div
        className={`pointer-events-none absolute inset-y-8 end-0 z-10 w-12 rounded-e-[2.5rem] bg-gradient-to-l from-blue-50/95 to-transparent transition-opacity duration-300 sm:w-16 ${
          canScrollNext ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden
      />

      <button
        type="button"
        onClick={() => scrollToIndex(activeIndex - 1)}
        disabled={!canScrollPrev}
        aria-label={prevLabel}
        className="absolute start-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200/90 bg-white/95 text-slate-700 shadow-md backdrop-blur-sm transition hover:bg-white disabled:pointer-events-none disabled:opacity-0 sm:start-4 sm:h-11 sm:w-11"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => scrollToIndex(activeIndex + 1)}
        disabled={!canScrollNext}
        aria-label={nextLabel}
        className="absolute end-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200/90 bg-white/95 text-slate-700 shadow-md backdrop-blur-sm transition hover:bg-white disabled:pointer-events-none disabled:opacity-0 sm:end-4 sm:h-11 sm:w-11"
      >
        <ChevronRight className="h-5 w-5" aria-hidden />
      </button>

      <div
        ref={trackRef}
        className="relative flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain scroll-smooth px-10 py-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-6 sm:px-14 md:px-16 [&::-webkit-scrollbar]:hidden"
        style={{ scrollPaddingInline: "2.5rem" }}
        role="region"
        aria-roledescription="carousel"
        aria-label={alt}
      >
        {HERO_SCREENSHOTS.map((src, index) => (
          <figure
            key={src}
            data-slide-index={index}
            className="w-[min(72vw,240px)] shrink-0 snap-center sm:w-[260px]"
          >
            <div
              className={`overflow-hidden rounded-[1.75rem] border-[5px] border-slate-900 bg-slate-900 shadow-xl shadow-slate-900/20 ring-1 ring-white/20 transition-[transform,opacity,box-shadow] duration-300 md:rounded-[2rem] md:border-[6px] ${
                index === activeIndex
                  ? "scale-100 opacity-100 shadow-2xl shadow-slate-900/30"
                  : "scale-[0.96] opacity-80"
              }`}
            >
              <Image
                src={src}
                alt={`${alt} ${index + 1}`}
                width={HERO_SCREENSHOT_WIDTH}
                height={HERO_SCREENSHOT_HEIGHT}
                sizes="(max-width: 640px) 72vw, 260px"
                className="block h-auto w-full"
                priority={index <= 1}
                draggable={false}
              />
            </div>
          </figure>
        ))}
      </div>

      <div className="relative mt-6 flex flex-col items-center gap-3">
        <div className="flex items-center justify-center gap-2">
          {HERO_SCREENSHOTS.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => scrollToIndex(index)}
              aria-label={`${alt} ${index + 1}`}
              aria-current={index === activeIndex ? "true" : undefined}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? "w-6 bg-blue-600"
                  : "w-2 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
        <p className="text-center text-xs text-slate-400">{scrollHint}</p>
      </div>
    </div>
  );
}
