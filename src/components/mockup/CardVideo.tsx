import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

export interface CardVideoProps {
  src: string;
  poster: string;
  webmSrc?: string;
  id?: string;
  registerVideo?: (id: string, el: HTMLVideoElement | null) => void;
  allowPlay?: boolean;
  className?: string;
  aspectRatio?: string;
}

export const CardVideo = ({
  src,
  poster,
  webmSrc,
  id = 'card-video',
  registerVideo,
  allowPlay = true,
  className = '',
  aspectRatio = 'aspect-[16/10]',
}: CardVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const prefersReduced = useReducedMotion();

  // Check Save-Data and slow connection
  const isSaveDataOrSlow =
    typeof navigator !== 'undefined' &&
    Boolean(
      (navigator as any).connection?.saveData ||
        (navigator as any).connection?.effectiveType === '2g' ||
        (navigator as any).connection?.effectiveType === 'slow-2g'
    );

  // If prefers-reduced-motion is enabled, or Save-Data is active, or tier disables playback:
  // Show high-res poster image instead
  const shouldPlay = allowPlay && !prefersReduced && !isSaveDataOrSlow;

  // Register video in parent sync hook
  useEffect(() => {
    if (registerVideo && videoRef.current) {
      registerVideo(id, videoRef.current);
    }
    return () => {
      if (registerVideo) {
        registerVideo(id, null);
      }
    };
  }, [id, registerVideo]);

  // IntersectionObserver to load/play when in viewport and pause when off-screen
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setInView(entry.isIntersecting);
          const video = videoRef.current;
          if (!video) return;

          if (entry.isIntersecting && !document.hidden && shouldPlay) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [shouldPlay]);

  // Pause when document visibility changes (tab backgrounded)
  useEffect(() => {
    const handleVisibility = () => {
      const video = videoRef.current;
      if (!video) return;

      if (document.hidden) {
        video.pause();
      } else if (shouldPlay && inView) {
        video.play().catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [shouldPlay, inView]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${aspectRatio} overflow-hidden rounded-[inherit] bg-slate-900 select-none ${className}`}
      style={{
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        willChange: 'transform',
      }}
    >
      {/* Soft gradient placeholder */}
      <div
        className={`absolute inset-0 bg-gradient-to-tr from-[#0F172A] via-[#1E293B] to-[#0F172A] transition-opacity duration-700 pointer-events-none ${
          isLoaded ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Poster image fallback */}
      <img
        src={poster}
        alt="Screen preview"
        loading="lazy"
        decoding="async"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-600 pointer-events-none rounded-[inherit] ${
          shouldPlay && isLoaded ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Video Element: Lazy mounted upon entering viewport, Save-Data respected */}
      {shouldPlay && inView && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          disablePictureInPicture
          controls={false}
          tabIndex={-1}
          poster={poster}
          onLoadedData={() => setIsLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover rounded-[inherit] pointer-events-none transition-opacity duration-600 ease-out ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            transform: 'translateZ(0)',
            WebkitTransform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          {webmSrc && <source src={webmSrc} type="video/webm" />}
          <source src={src} type="video/mp4" />
        </video>
      )}

      {/* Subtle screen reflection gradient overlay for 3D depth */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.04] to-transparent pointer-events-none rounded-[inherit]" />
    </div>
  );
};
