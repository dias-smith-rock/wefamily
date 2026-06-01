import Image from "next/image";
import {
  HERO_SCREENSHOT_HEIGHT,
  HERO_SCREENSHOT_WIDTH,
  HERO_SCREENSHOTS,
} from "@/lib/brand/screenshots";

type HeroScreenshotsProps = {
  alt: string;
  scrollHint: string;
};

export function HeroScreenshots({ alt, scrollHint }: HeroScreenshotsProps) {
  return (
    <div className="relative mt-16 w-full overflow-hidden rounded-[2.5rem] border border-gray-200/90 bg-gradient-to-br from-slate-100 via-white to-blue-50/80 px-4 py-10 shadow-2xl shadow-gray-200/60 sm:px-6 md:py-14">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(59,130,246,0.12), transparent 70%)",
        }}
      />

      <div className="relative flex snap-x snap-mandatory items-end justify-start gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] md:justify-center md:gap-5 md:overflow-visible [&::-webkit-scrollbar]:hidden">
        {HERO_SCREENSHOTS.map((src, index) => {
          const isCenter = index === Math.floor(HERO_SCREENSHOTS.length / 2);
          return (
            <figure
              key={src}
              className={`group shrink-0 snap-center scroll-ml-4 first:scroll-ml-0 md:scroll-ml-0 ${
                isCenter ? "md:-translate-y-3 md:scale-[1.04]" : "md:opacity-95"
              }`}
            >
              <div className="overflow-hidden rounded-[1.75rem] border-[5px] border-slate-900 bg-slate-900 shadow-xl shadow-slate-900/25 ring-1 ring-white/20 transition duration-300 group-hover:shadow-2xl group-hover:shadow-slate-900/30 md:rounded-[2rem] md:border-[6px]">
                <Image
                  src={src}
                  alt={`${alt} ${index + 1}`}
                  width={HERO_SCREENSHOT_WIDTH}
                  height={HERO_SCREENSHOT_HEIGHT}
                  sizes="(max-width: 768px) 72vw, 220px"
                  className="block h-auto w-[min(72vw,220px)] max-w-none"
                  priority={index <= 1}
                />
              </div>
            </figure>
          );
        })}
      </div>

      <p className="relative mt-6 text-center text-xs text-slate-400 md:hidden">
        {scrollHint}
      </p>
    </div>
  );
}
