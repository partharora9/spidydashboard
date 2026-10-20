import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

export interface PreviewVideoProps {
  src: string;
  poster: string;
  label: string;
  staggerDelay?: number;
  isHovered?: boolean;
}

export const PreviewVideo = ({
  src,
  poster,
  label,
  staggerDelay = 0,
  isHovered = false,
}: PreviewVideoProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // IntersectionObserver: play when threshold 0.4 in view, pause when out of view
  useEffect(() => {
    if (shouldReduceMotion) return;

    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    let timer: ReturnType<typeof setTimeout> | undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !document.hidden) {
            timer = setTimeout(() => {
              video.play().catch(() => {});
            }, staggerDelay * 1000);
          } else {
            clearTimeout(timer);
            video.pause();
          }
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(container);

    // Pause all videos when tab is hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        video.pause();
      } else {
        const rect = container.getBoundingClientRect();
        const inView =
          rect.top < window.innerHeight * 0.8 && rect.bottom > window.innerHeight * 0.2;
        if (inView) {
          video.play().catch(() => {});
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [staggerDelay, shouldReduceMotion]);

  // Hover: video plays at full speed, keeps playing when mouse leaves
  useEffect(() => {
    if (isHovered && videoRef.current && !shouldReduceMotion) {
      videoRef.current.play().catch(() => {});
    }
  }, [isHovered, shouldReduceMotion]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full rounded-[inherit] overflow-hidden bg-slate-950 will-change-transform select-none"
      style={{
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
      }}
    >
      {/* Soft gradient placeholder: #EEF2FF to #F7F9FF */}
      <div
        className={`absolute inset-0 bg-gradient-to-br from-[#EEF2FF] to-[#F7F9FF] transition-opacity duration-500 pointer-events-none ${
          isLoaded ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Poster image: shown until video is loaded or if prefers-reduced-motion */}
      <img
        src={poster}
        alt={`${label} video poster`}
        width={1280}
        height={720}
        loading="lazy"
        decoding="async"
        className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-500 pointer-events-none ${
          isLoaded && !shouldReduceMotion ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* HTML5 Video: muted, loop, playsInline, object-cover object-top */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        disablePictureInPicture
        controls={false}
        onLoadedData={() => setIsLoaded(true)}
        className="w-full h-full object-cover object-top block pointer-events-none transition-opacity duration-500 ease-out"
        style={{ opacity: isLoaded ? 1 : 0 }}
      />

      {/* Soft white-to-transparent gradient (60px) at the bottom edge for seamless cropping */}
      <div className="absolute bottom-0 inset-x-0 h-[60px] bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-10" />
    </div>
  );
};
