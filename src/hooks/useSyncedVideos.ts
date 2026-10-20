import { useEffect, useRef, useState, useCallback } from 'react';
import { useReducedMotion } from 'framer-motion';

export interface UseSyncedVideosOptions {
  entranceDelayMs?: number;
  threshold?: number;
}

export const useSyncedVideos = ({
  entranceDelayMs = 1400,
  threshold = 0.3,
}: UseSyncedVideosOptions = {}) => {
  const videoElements = useRef<Map<string, HTMLVideoElement>>(new Map());
  const [isEntranceFinished, setIsEntranceFinished] = useState(false);
  const [isInViewport, setIsInViewport] = useState(false);
  const prefersReduced = useReducedMotion();

  // Register video element by ID ('left' | 'center' | 'right')
  const registerVideo = useCallback((id: string, el: HTMLVideoElement | null) => {
    if (el) {
      videoElements.current.set(id, el);
    } else {
      videoElements.current.delete(id);
    }
  }, []);

  // Timer to wait until card entrance spring animation finishes
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsEntranceFinished(true);
    }, entranceDelayMs);
    return () => clearTimeout(timer);
  }, [entranceDelayMs]);

  // Handle visibility change (tab switch / minimize)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        videoElements.current.forEach((video) => {
          video.pause();
        });
      } else if (isInViewport && isEntranceFinished && !prefersReduced) {
        videoElements.current.forEach((video) => {
          video.play().catch(() => {});
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isInViewport, isEntranceFinished, prefersReduced]);

  // Synchronize playback of all videos when ready
  const syncAndPlay = useCallback(() => {
    if (prefersReduced) return;
    videoElements.current.forEach((video) => {
      // Seek to sync point
      if (video.readyState >= 2) {
        video.currentTime = 0;
      }
      video.play().catch(() => {});
    });
  }, [prefersReduced]);

  const pauseAll = useCallback(() => {
    videoElements.current.forEach((video) => {
      video.pause();
    });
  }, []);

  return {
    registerVideo,
    isEntranceFinished,
    isInViewport,
    setIsInViewport,
    syncAndPlay,
    pauseAll,
    threshold,
  };
};
