import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Professional auto-advancing carousel.
 *  - Real horizontal slide (GPU translateX) with premium easing.
 *  - Autoplay with a progress indicator baked into the active dot, so the
 *    pacing is visible (Stripe/Apple-style) instead of an abrupt timed jump.
 *  - Pause on hover/focus, keyboard arrows, swipe, reduced-motion aware.
 *
 * Props:
 *  - slides: React.ReactNode[]        required
 *  - autoPlay, intervalMs, showDots, showArrows, showCounter, pauseOnHover
 *  - onSlideChange: (index) => void
 *  - className
 */
const Carousel = ({
  slides,
  autoPlay = true,
  intervalMs = 6000,
  showDots = true,
  showArrows = true,
  showCounter = true,
  pauseOnHover = true,
  onSlideChange,
  className = '',
}) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const touchStartX = useRef(null);
  const count = slides.length;

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return undefined;
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener?.('change', apply);
    return () => mq.removeEventListener?.('change', apply);
  }, []);

  const goTo = useCallback(
    (next) => {
      const wrapped = ((next % count) + count) % count;
      setIndex(wrapped);
      onSlideChange?.(wrapped);
    },
    [count, onSlideChange]
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  const playing = autoPlay && !paused && !reduced && count > 1;

  useEffect(() => {
    if (!playing) return undefined;
    const id = window.setInterval(() => goTo(index + 1), intervalMs);
    return () => window.clearInterval(id);
  }, [playing, intervalMs, index, goTo]);

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
  };

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 45) (delta < 0 ? next() : prev());
    touchStartX.current = null;
  };

  return (
    <div
      className={`group/carousel relative ${className}`}
      role="region"
      aria-roledescription="carousel"
      aria-label="Highlights"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={() => pauseOnHover && setPaused(true)}
      onMouseLeave={() => pauseOnHover && setPaused(false)}
      onFocus={() => pauseOnHover && setPaused(true)}
      onBlur={() => pauseOnHover && setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <style>{`
        @keyframes carousel-fill { from { transform: scaleX(0); } to { transform: scaleX(1); } }
      `}</style>

      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              className="w-full shrink-0"
              aria-hidden={i !== index}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
            >
              {slide}
            </div>
          ))}
        </div>
      </div>

      {showArrows && count > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-0 top-1/2 flex h-10 w-10 -translate-y-1/2 -translate-x-1 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white opacity-0 backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-white/20 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300 group-hover/carousel:opacity-100 sm:-translate-x-4 lg:-translate-x-5"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className="absolute right-0 top-1/2 flex h-10 w-10 -translate-y-1/2 translate-x-1 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white opacity-0 backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-white/20 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300 group-hover/carousel:opacity-100 sm:translate-x-4 lg:translate-x-5"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {(showDots || showCounter) && count > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4 sm:justify-start">
          {showDots && (
            <div className="flex items-center gap-2">
              {slides.map((_, i) => {
                const active = i === index;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    aria-current={active}
                    className={`relative h-1.5 overflow-hidden rounded-full transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 ${
                      active ? 'w-8 bg-white/25' : 'w-1.5 bg-white/30 hover:bg-white/50'
                    }`}
                  >
                    {active && (
                      <span
                        key={index}
                        className="absolute inset-0 origin-left rounded-full bg-amber-300"
                        style={
                          autoPlay && !reduced && count > 1
                            ? {
                                animation: `carousel-fill ${intervalMs}ms linear forwards`,
                                animationPlayState: paused ? 'paused' : 'running',
                              }
                            : { transform: 'scaleX(1)' }
                        }
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {showCounter && (
            <span className="font-mono text-xs tabular-nums text-white/60">
              <span className="text-white">{String(index + 1).padStart(2, '0')}</span> / {String(count).padStart(2, '0')}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Carousel;