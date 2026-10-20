import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

export interface PhotoItem {
  id: string;
  webpSrc: string;
  pngSrc: string;
  alt: string;
  loading?: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'low' | 'auto';
}

interface PhotoStackProps {
  photos: PhotoItem[];
  isCardHovered?: boolean;
}

export const PhotoStack = ({ photos, isCardHovered = false }: PhotoStackProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const shouldReduceMotion = useReducedMotion();

  // Keyboard navigation for lightbox
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (selectedIndex === null) return;

      if (e.key === 'Escape') {
        setSelectedIndex(null);
      } else if (e.key === 'ArrowLeft') {
        setSelectedIndex((prev) => (prev !== null ? (prev - 1 + photos.length) % photos.length : null));
      } else if (e.key === 'ArrowRight') {
        setSelectedIndex((prev) => (prev !== null ? (prev + 1) % photos.length : null));
      }
    },
    [selectedIndex, photos.length]
  );

  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedIndex, handleKeyDown]);

  const handleImageLoad = (id: string) => {
    setLoadedImages((prev) => ({ ...prev, [id]: true }));
  };

  // Stack configuration matching screenshot & specs:
  // FRONT box (index 0): left-most, z-index 3, full size
  // MIDDLE box (index 1): offset about 100px right, 12px higher, scale 0.94, z-index 2
  // BACK box (index 2): offset about 200px right, 24px higher, scale 0.88, z-index 1
  const stackConfigs = [
    {
      zIndex: 3,
      baseLeft: 'left-0',
      baseTop: 'top-8 sm:top-8', // 32px below card top
      scale: 1,
      hoverOffset: { y: -6, x: 0 },
      entranceDelay: 0.4, // back box first, front box last
      idleDelay: 0,
      className: 'w-[280px] sm:w-[320px] aspect-[16/10]',
      hideOnMobile: false,
    },
    {
      zIndex: 2,
      baseLeft: 'left-[80px] sm:left-[100px]',
      baseTop: 'top-5 sm:top-5', // 12px higher than front
      scale: 0.94,
      hoverOffset: { y: 0, x: 10 },
      entranceDelay: 0.25,
      idleDelay: 2,
      className: 'w-[280px] sm:w-[320px] aspect-[16/10]',
      hideOnMobile: false,
    },
    {
      zIndex: 1,
      baseLeft: 'left-[160px] sm:left-[200px]',
      baseTop: 'top-2 sm:top-2', // 24px higher than front
      scale: 0.88,
      hoverOffset: { y: 0, x: 16 }, // fans out 16px further right on hover
      entranceDelay: 0.1,
      idleDelay: 4,
      className: 'w-[280px] sm:w-[320px] aspect-[16/10] hidden sm:block', // hidden on mobile (<640px)
      hideOnMobile: true,
    },
  ];

  return (
    <>
      {/* Photo Stack Container */}
      <div className="relative w-full h-full scale-[0.82] sm:scale-[0.88] lg:scale-100 origin-top-left overflow-visible select-none">
        {photos.map((photo, index) => {
          const config = stackConfigs[index] ?? stackConfigs[0];
          const isLoaded = loadedImages[photo.id];

          return (
            <motion.div
              key={photo.id}
              initial={shouldReduceMotion ? { opacity: 0 } : { x: 120, opacity: 0 }}
              whileInView={shouldReduceMotion ? { opacity: 1 } : { x: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              animate={
                shouldReduceMotion
                  ? {}
                  : isCardHovered
                  ? config.hoverOffset
                  : { x: 0, y: 0 }
              }
              transition={{
                delay: config.entranceDelay,
                type: 'spring',
                stiffness: 80,
                damping: 18,
                ...(isCardHovered && { duration: 0.4, ease: [0.22, 1, 0.36, 1] }),
              }}
              onClick={() => setSelectedIndex(index)}
              style={{
                zIndex: config.zIndex,
                transformOrigin: 'top left',
              }}
              className={`absolute ${config.baseLeft} ${config.baseTop} ${config.className} cursor-pointer group will-change-transform`}
            >
              {/* Box Shadow & Border Wrapper */}
              <motion.div
                animate={
                  shouldReduceMotion
                    ? {}
                    : {
                        y: [0, -4, 0],
                      }
                }
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: config.idleDelay,
                }}
                style={{ transform: `scale(${config.scale})`, transformOrigin: 'top left' }}
                className="w-full h-full bg-white rounded-[16px] shadow-[0_20px_50px_rgba(20,30,60,0.12)] border border-black/[0.05] relative transition-shadow duration-300 group-hover:shadow-[0_24px_60px_rgba(20,30,60,0.18)]"
              >
                {/* Inner Image Wrapper with exact rounded radius and overflow hidden */}
                <div className="w-full h-full rounded-[16px] overflow-hidden relative bg-gradient-to-br from-[#EEF2FF] to-[#F7F9FF]">
                  {/* Soft Placeholder blur gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br from-[#EEF2FF] to-[#F7F9FF] transition-opacity duration-500 pointer-events-none ${
                      isLoaded ? 'opacity-0' : 'opacity-100'
                    }`}
                  />

                  {/* Responsive Picture with WebP and fallback PNG */}
                  <picture>
                    <source type="image/webp" srcSet={photo.webpSrc} />
                    <img
                      src={photo.pngSrc}
                      alt={photo.alt}
                      width={1600}
                      height={1000}
                      decoding="async"
                      loading={photo.loading ?? 'lazy'}
                      fetchPriority={photo.fetchPriority}
                      draggable={false}
                      onLoad={() => handleImageLoad(photo.id)}
                      className="w-full h-full object-cover object-top block rounded-[16px] pointer-events-none select-none transition-opacity duration-500 ease-out"
                      style={{ opacity: isLoaded ? 1 : 0 }}
                    />
                  </picture>

                  {/* Subtle hover zoom cue icon */}
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
                    <span className="bg-white/90 text-gray-800 p-2 rounded-full shadow-md backdrop-blur-xs">
                      <ZoomIn className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Full-Screen Lightbox Dialog */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSelectedIndex(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/85 backdrop-blur-md select-none"
          >
            {/* Top Bar with counter & close button */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute top-4 inset-x-4 sm:inset-x-8 flex items-center justify-between text-white/90 z-10 pointer-events-auto"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium tracking-wide bg-white/10 px-3 py-1 rounded-full border border-white/10 backdrop-blur-xs">
                  {selectedIndex + 1} / {photos.length}
                </span>
                <span className="text-xs sm:text-sm font-medium text-white/80 hidden sm:inline-block">
                  {photos[selectedIndex].alt}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedIndex(null)}
                aria-label="Close lightbox"
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Left Nav Arrow */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((prev) => (prev !== null ? (prev - 1 + photos.length) % photos.length : null));
              }}
              aria-label="Previous image"
              className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all cursor-pointer border border-white/10 z-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Right Nav Arrow */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((prev) => (prev !== null ? (prev + 1) % photos.length : null));
              }}
              aria-label="Next image"
              className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all cursor-pointer border border-white/10 z-10"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Modal Image Card */}
            <motion.div
              layoutId={`lightbox-card-${photos[selectedIndex].id}`}
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative max-w-5xl max-h-[85vh] w-full rounded-2xl overflow-hidden shadow-2xl bg-slate-900 border border-white/15 aspect-[16/10] flex items-center justify-center pointer-events-auto"
            >
              <picture className="w-full h-full">
                <source type="image/webp" srcSet={photos[selectedIndex].webpSrc} />
                <img
                  src={photos[selectedIndex].pngSrc}
                  alt={photos[selectedIndex].alt}
                  width={1600}
                  height={1000}
                  className="w-full h-full object-cover object-top block"
                />
              </picture>
            </motion.div>

            {/* Bottom Keyboard Hint */}
            <div className="absolute bottom-4 inset-x-0 text-center text-xs text-white/50 pointer-events-none">
              Use arrow keys <span className="font-semibold text-white/70">← / →</span> to navigate,{' '}
              <span className="font-semibold text-white/70">Esc</span> to close
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
