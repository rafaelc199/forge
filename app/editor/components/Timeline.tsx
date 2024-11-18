"use client";

import React, { useCallback, useRef } from 'react';
import { VideoOperation } from '@/types/video';
import { cn } from '@/lib/utils';
import type { Segment } from '@/types/segment';

interface TimelineProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  operations: VideoOperation[];
  currentTime: number;
  duration: number;
  onTimeUpdate: (time: number) => void;
  segments?: Segment[];
}

export function Timeline({ 
  videoRef, 
  operations, 
  currentTime, 
  duration, 
  onTimeUpdate, 
  segments = [] 
}: TimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);

  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  return (
    <div className="relative w-full h-12 bg-gray-300 rounded-lg" ref={timelineRef}>
      {/* Renderizar segmentos */}
      {segments.map((segment, index) => (
        <div
          key={index}
          className={cn(
            "absolute h-full top-0 rounded-lg",
            segment.type === 'silence' && "bg-red-500",
            segment.type === 'commercial' && "bg-yellow-500",
            segment.type === 'content' && "bg-green-500"
          )}
          style={{
            left: `${(segment.start / duration) * 100}%`,
            width: `${((segment.end - segment.start) / duration) * 100}%`
          }}
          title={`${segment.type} (${Math.round(segment.confidence * 100)}% confidence)`}
        />
      ))}

      {/* Indicador de tempo atual */}
      <div
        className="absolute top-0 w-1 h-full bg-blue-600 rounded-lg"
        style={{
          left: `${(currentTime / duration) * 100}%`,
          transition: 'left 0.05s linear'
        }}
      />

      {/* Tempos */}
      <div className="flex justify-between text-sm mt-1">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
} 