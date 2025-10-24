"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { BANNERS, type Banner } from "../../data/banners";
import { useLanguageContext } from "../../contexts/language-context";
import { getBannerCopy } from "../../lib/translations";

const MIN_HEIGHT_CLASSES =
  "min-h-[120px] sm:min-h-[160px] md:min-h-[200px] lg:min-h-[240px]";
const AUTO_ADVANCE_DELAY = 6500;
const BASE_WIDTH = 1440;
const BASE_HEIGHT = 360;
const CAROUSEL_MAX_WIDTH_CLASS = "max-w-[1440px]";

export function BannerCarousel() {
  const { language } = useLanguageContext();
  const copy = getBannerCopy(language);

  const slides = useMemo(
    () => BANNERS.filter((banner) => Boolean(banner.image)),
    [],
  );
  const slideCount = slides.length;
  const hasMultipleSlides = slideCount > 1;

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!hasMultipleSlides) return undefined;
    const timer = window.setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % slideCount);
    }, AUTO_ADVANCE_DELAY);
    return () => window.clearTimeout(timer);
  }, [activeIndex, hasMultipleSlides, slideCount]);

  const goToIndex = useCallback(
    (index: number) => {
      if (!hasMultipleSlides) return;
      const wrappedIndex = (index + slideCount) % slideCount;
      setActiveIndex(wrappedIndex);
    },
    [hasMultipleSlides, slideCount],
  );

  const handlePrev = useCallback(() => {
    goToIndex(activeIndex - 1);
  }, [activeIndex, goToIndex]);

  const handleNext = useCallback(() => {
    goToIndex(activeIndex + 1);
  }, [activeIndex, goToIndex]);

  if (slideCount === 0) {
    return (
      <section className="mt-10">
        <div className="mx-auto flex h-56 w-full max-w-6xl flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-300 bg-white text-center shadow-[0_16px_40px_rgba(0,0,0,0.06)]">
          <h3 className="text-base font-semibold text-neutral-700">
            {copy.emptyTitle}
          </h3>
          <p className="mt-2 text-sm text-neutral-500">{copy.emptySubtitle}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-10">
      <div
        className={`relative mx-auto w-full ${CAROUSEL_MAX_WIDTH_CLASS} px-6`}
      >
        <div
          className={`relative w-full overflow-hidden rounded-[32px] shadow-[0_24px_60px_rgba(0,0,0,0.18)] ${MIN_HEIGHT_CLASSES}`}
          style={{ aspectRatio: `${BASE_WIDTH}/${BASE_HEIGHT}` }}
          aria-roledescription="carousel"
          aria-live="polite"
        >
          <div
            className="flex h-full w-full transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {slides.map((slide, index) => (
              <CarouselSlide
                key={slide.id}
                slide={slide}
                isInitial={index === 0}
              />
            ))}
          </div>

          {hasMultipleSlides ? (
            <>
              <CarouselArrow
                direction="prev"
                label={copy.previousLabel}
                onClick={handlePrev}
              />
              <CarouselArrow
                direction="next"
                label={copy.nextLabel}
                onClick={handleNext}
              />
            </>
          ) : null}

          {hasMultipleSlides ? (
            <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
              {slides.map((_, index) => {
                const isActive = index === activeIndex;
                return (
                  <button
                    key={`banner-indicator-${index}`}
                    type="button"
                    onClick={() => goToIndex(index)}
                    aria-label={`Go to banner ${index + 1}`}
                    aria-pressed={isActive}
                    className={`h-1 rounded-full transition-all duration-200 ${
                      isActive
                        ? "w-8 bg-white"
                        : "w-4 bg-white/40 hover:bg-white/70"
                    }`}
                  />
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

type CarouselArrowProps = {
  direction: "prev" | "next";
  label: string;
  onClick: () => void;
};

function CarouselArrow({ direction, label, onClick }: CarouselArrowProps) {
  const isPrev = direction === "prev";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`absolute top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-black/40 text-white backdrop-blur transition hover:bg-black/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
        isPrev ? "left-5" : "right-5"
      }`}
    >
      <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5">
        <path
          d={isPrev ? "M15.5 5.5 9 12l6.5 6.5" : "M8.5 5.5 15 12l-6.5 6.5"}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

type CarouselSlideProps = {
  slide: Banner;
  isInitial: boolean;
};

function CarouselSlide({ slide, isInitial }: CarouselSlideProps) {
  const { image, alt, fit = "contain" } = slide;

  return (
    <div
      className={`relative w-full flex-shrink-0 overflow-hidden ${MIN_HEIGHT_CLASSES}`}
      style={{ aspectRatio: `${BASE_WIDTH}/${BASE_HEIGHT}` }}
    >
      {image ? (
        <Image
          src={image}
          alt={alt}
          priority={isInitial}
          width={BASE_WIDTH}
          height={BASE_HEIGHT}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 92vw, 1440px"
          className={`h-full w-full ${fit === "contain" ? "object-contain" : "object-cover"}`}
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-neutral-200 text-neutral-500">
          {alt}
        </div>
      )}
    </div>
  );
}
