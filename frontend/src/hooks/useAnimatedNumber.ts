import { useEffect, useState } from 'react';

export function useAnimatedNumber(target: number, duration: number = 1000): number {
  const [current, setCurrent] = useState(target);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = current;
    
    // If we're already exactly at the target, don't animate.
    if (startValue === target) return;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing function: easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      const nextValue = startValue + (target - startValue) * easeProgress;
      setCurrent(nextValue);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCurrent(target);
      }
    };
    
    window.requestAnimationFrame(step);
    
    // Cleanup if target changes before animation finishes
    return () => {
      startTimestamp = null;
    };
  }, [target, duration]);

  return current;
}
