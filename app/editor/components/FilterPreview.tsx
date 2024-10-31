"use client";

import React, { useEffect, useRef } from 'react';
import { VideoOperation } from '@/types/video';

interface FilterPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  operation: VideoOperation;
}

export function FilterPreview({ videoRef, operation }: FilterPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Apply preview effects based on operation type
    const applyPreview = () => {
      if (!videoRef.current || !ctx) return;
      
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      switch (operation.type) {
        case 'filter':
          canvas.style.filter = `${operation.filter}(${operation.intensity}%)`;
          break;
        case 'rotate':
          ctx.rotate((operation.angle || 0) * Math.PI / 180);
          break;
        // Add other operation previews
      }
    };

    const interval = setInterval(applyPreview, 1000 / 30); // 30fps

    return () => clearInterval(interval);
  }, [videoRef, operation]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full aspect-video rounded-lg"
    />
  );
} 