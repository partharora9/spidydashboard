import { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';

interface TabularCounterProps {
  target: number;
  duration?: number;
  suffix?: string;
  className?: string;
}

export const TabularCounter = ({
  target,
  duration = 1.6,
  suffix = '+',
  className = '',
}: TabularCounterProps) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  useEffect(() => {
    if (!isInView) return;

    let start: number | null = null;
    let frameId: number;

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / (duration * 1000), 1);
      // easeOutExpo / easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [isInView, target, duration]);

  return (
    <span ref={ref} className={`inline-flex items-baseline select-none ${className}`}>
      <span className="tabular-nums">{count}</span>
      <span className="font-light">{suffix}</span>
    </span>
  );
};
