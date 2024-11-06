"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { VideoOperation } from '@/types/video';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';

interface TimelineProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  operations: VideoOperation[];
  currentTime: number;
  duration: number;
  onTimeUpdate: (time: number) => void;
}

export function Timeline({ 
  videoRef, 
  operations, 
  currentTime, 
  duration, 
  onTimeUpdate 
}: TimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [frames, setFrames] = useState<string[]>([]);
  const [isGeneratingFrames, setIsGeneratingFrames] = useState(false);
  const frameInterval = 0.5; // Capturar um frame a cada meio segundo

  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    
    onTimeUpdate(Math.max(0, Math.min(newTime, duration)));
  }, [duration, onTimeUpdate]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const time = percentage * duration;
    
    // Atualizar preview ou tooltip aqui se necessário
  }, [duration]);

  const handleMouseLeave = useCallback(() => {
    // Limpar preview ou tooltip aqui se necessário
  }, []);

  // Gerar frames do vídeo
  const generateFrames = useCallback(async () => {
    if (!videoRef.current || isGeneratingFrames || duration === 0) return;

    try {
      setIsGeneratingFrames(true);
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 160;
      canvas.height = 90;

      const originalTime = video.currentTime;
      const newFrames: string[] = [];

      for (let time = 0; time < duration; time += frameInterval) {
        video.currentTime = time;
        await new Promise<void>((resolve) => {
          const handleSeeked = () => {
            video.removeEventListener('seeked', handleSeeked);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            newFrames.push(canvas.toDataURL('image/jpeg', 0.5));
            resolve();
          };
          video.addEventListener('seeked', handleSeeked);
        });
      }

      video.currentTime = originalTime;
      setFrames(newFrames);
    } finally {
      setIsGeneratingFrames(false);
    }
  }, [videoRef, duration, isGeneratingFrames, frameInterval]);

  useEffect(() => {
    if (duration > 0) {
      generateFrames();
    }
  }, [duration, generateFrames]);

  return (
    <div className="space-y-2">
      <div
        ref={timelineRef}
        className="relative h-20 bg-muted rounded-lg cursor-pointer overflow-hidden"
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Frames do vídeo */}
        <div className="absolute inset-0 flex">
          {frames.map((frame, index) => (
            <div
              key={index}
              className="relative h-full flex-shrink-0"
              style={{ width: `${(frameInterval / duration) * 100}%` }}
            >
              <Image
                src={frame}
                alt={`Frame ${index}`}
                fill
                className="object-cover"
                unoptimized // Necessário para data URLs
                priority={index < 5} // Priorizar primeiros frames
              />
            </div>
          ))}
        </div>

        {/* Indicador de progresso */}
        <div
          className="absolute top-0 w-0.5 h-full bg-primary z-10"
          style={{
            left: `${(currentTime / duration) * 100}%`,
            transition: 'left 0.1s linear'
          }}
        />
      </div>

      {/* Tempos */}
      <div className="flex justify-between text-sm">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
} 