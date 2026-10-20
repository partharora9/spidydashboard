import { useState, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Play, Pause, Maximize2, Shield, Radio, Volume2, VolumeX } from 'lucide-react';

interface MetricItem {
  label: string;
  value: string;
}

interface VisualProofProps {
  title: string;
  caption: string;
  videoSrc?: string;
  posterSrc?: string;
  imageSrc?: string;
  metrics?: MetricItem[];
}

export const VisualProof = ({
  title,
  caption,
  videoSrc,
  posterSrc,
  imageSrc,
  metrics = [
    { label: 'Pipeline Latency', value: '< 240ms' },
    { label: 'Event Throughput', value: '1,400+ ev/s' },
    { label: 'Correlation Depth', value: '4 Tiers' },
    { label: 'Storage', value: 'SQLite + WAL' },
  ],
}: VisualProofProps) => {
  const prefersReduced = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <section className="relative w-full max-w-[1200px] mx-auto px-6 mt-12 sm:mt-16 overflow-visible select-none">
      <div className="w-full bg-[#0B0F19] rounded-[24px] border border-white/[0.08] shadow-[0_24px_70px_rgba(11,15,25,0.28)] overflow-hidden">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 bg-[#141824] border-b border-white/[0.08] text-white">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#EF4444]/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#F59E0B]/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#10B981]/80 inline-block" />
            </div>
            <span className="text-gray-400 text-[13px] font-mono ml-2 hidden sm:inline">
              spidydashboard.local — {title}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#10B981]/15 text-[#10B981] font-mono text-[11px] font-medium uppercase tracking-wider">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>LIVE RECON ENGINE</span>
            </span>

            {videoSrc && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={isPlaying ? 'Pause video' : 'Play video'}
                  className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                  className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  aria-label="Toggle fullscreen"
                  className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Media Canvas: Video or Screenshot */}
        <div className="relative w-full aspect-video bg-[#07090E] flex items-center justify-center overflow-hidden">
          {videoSrc ? (
            <video
              ref={videoRef}
              src={videoSrc}
              poster={posterSrc}
              autoPlay={!prefersReduced}
              loop
              muted={isMuted}
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={imageSrc || '/photos/about-hero.webp'}
              alt={title}
              className="w-full h-full object-cover object-top"
              loading="lazy"
            />
          )}

          {/* Subtle Ambient Scanline Overlay */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]"
          />
        </div>

        {/* Bottom Technical Telemetry Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.08] bg-[#0E121D] border-t border-white/[0.08] text-white">
          {metrics.map((m) => (
            <div key={m.label} className="p-4 sm:px-6 flex flex-col justify-center">
              <span className="text-[12px] text-gray-400 font-mono tracking-wide uppercase">
                {m.label}
              </span>
              <span className="text-[17px] sm:text-[18px] font-headline font-semibold text-white mt-0.5 tracking-tight">
                {m.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Caption text */}
      <p className="mt-4 text-center text-[13px] sm:text-[14px] text-gray-500 font-sans flex items-center justify-center gap-1.5">
        <Shield className="w-3.5 h-3.5 text-[#4F8FF7]" />
        <span>{caption}</span>
      </p>
    </section>
  );
};
