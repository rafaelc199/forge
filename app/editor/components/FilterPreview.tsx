"use client";

import { useRef, useEffect } from 'react';
import { VideoOperation } from '@/types/video';
import { useRealTimePreview } from '@/hooks/use-real-time-preview';

interface FilterPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  operation: VideoOperation;
  showComparison?: boolean;
}

export function FilterPreview({ videoRef, operation, showComparison = false }: FilterPreviewProps) {
  const canvasRef = useRealTimePreview(videoRef, [operation]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full object-cover"
      style={{
        opacity: showComparison ? 0.5 : 1,
        transition: 'opacity 0.2s ease'
      }}
    />
  );
} 