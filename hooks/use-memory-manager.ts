import { useEffect } from 'react';

export function useMemoryManager(videoRef: React.RefObject<HTMLVideoElement>) {
  useEffect(() => {
    if (!videoRef.current) return;

    const MEMORY_THRESHOLD = 500 * 1024 * 1024; // 500MB
    
    const cleanup = () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
      }
    };

    const monitor = setInterval(() => {
      // Usar performance.memory apenas se disponível (Chrome)
      const memory = (performance as any).memory;
      if (memory && memory.usedJSHeapSize > MEMORY_THRESHOLD) {
        cleanup();
      }
    }, 1000);

    return () => clearInterval(monitor);
  }, [videoRef]);
} 