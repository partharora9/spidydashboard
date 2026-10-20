import { useEffect, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play } from 'lucide-react';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  videoSrc?: string;
  poster?: string;
  children?: ReactNode;
}

export const PreviewModal = ({
  isOpen,
  onClose,
  title,
  videoSrc,
  poster,
  children,
}: PreviewModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      // Play video if present
      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
    } else {
      document.body.style.overflow = '';
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
            className="relative w-full max-w-5xl bg-[#0B0B14] rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.5)] border border-white/10 flex flex-col overflow-hidden z-10 select-none"
          >
            {/* Top Toolbar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0B0B14]/90 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <span className="font-headline font-semibold text-[19px] text-white tracking-tight">
                  {title}
                </span>
                <span className="text-[11px] bg-blue-500/20 text-blue-400 font-semibold px-2.5 py-0.5 rounded-full border border-blue-500/30 flex items-center gap-1">
                  <Play className="w-2.5 h-2.5 fill-current" />
                  Live Demo Video
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close modal"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white/90 hover:text-white focus:outline-none cursor-pointer border border-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Video Viewport */}
            <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
              {videoSrc ? (
                <video
                  ref={videoRef}
                  src={videoSrc}
                  poster={poster}
                  controls={false}
                  autoPlay
                  loop
                  playsInline
                  className="w-full h-full object-contain bg-black"
                />
              ) : (
                children
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-[#0B0B14] border-t border-white/5 flex items-center justify-between text-xs text-white/50">
              <span>SpidyDashboard Module Showcase</span>
              <span>Press <strong className="text-white/70">Esc</strong> or click outside to close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
