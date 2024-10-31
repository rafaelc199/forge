"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Slider } from '@/components/ui/slider';
import { useVideoThumbnails } from '@/app/hooks/use-video-thumbnails';
import { VideoOperation } from '@/types/video';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const { thumbnails, generateThumbnails } = useVideoThumbnails();
  const [previewTime, setPreviewTime] = useState<number | null>(null);
  const previewFrameRef = useRef<HTMLCanvasElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!videoRef.current || !videoRef.current.duration) return;
    generateThumbnails(videoRef.current);
  }, [videoRef, generateThumbnails]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const updatePreviewFrame = (time: number) => {
    if (!videoRef.current || !previewFrameRef.current) return;

    const video = videoRef.current;
    const canvas = previewFrameRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Salvar o tempo atual do vídeo
    const currentVideoTime = video.currentTime;
    
    // Atualizar para o tempo do preview
    video.currentTime = time;
    
    // Quando o vídeo estiver pronto neste tempo
    video.addEventListener('seeked', function onSeeked() {
      video.removeEventListener('seeked', onSeeked);
      
      // Desenhar o frame no canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Restaurar o tempo original
      video.currentTime = currentVideoTime;
    }, { once: true });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const time = percentage * duration;
    
    setPreviewTime(time);
    updatePreviewFrame(time);
  };

  const handleMouseLeave = () => {
    setPreviewTime(null);
  };

  return (
    <div className="space-y-2">
      <div 
        ref={timelineRef}
        className="relative h-16 bg-muted rounded-lg overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Thumbnails */}
        <div className="absolute inset-0 flex">
          {thumbnails.map((thumbnail: string, index: number) => (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="h-full flex-grow relative group"
                    style={{
                      backgroundImage: `url(${thumbnail})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{formatTime((index / thumbnails.length) * duration)}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>

        {/* Preview canvas */}
        {previewTime !== null && (
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 bg-popover border rounded-lg p-1 shadow-lg">
            <canvas
              ref={previewFrameRef}
              width="160"
              height="90"
              className="rounded"
            />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
              <div className="bg-popover text-popover-foreground px-2 py-1 rounded text-xs">
                {formatTime(previewTime)}
              </div>
            </div>
          </div>
        )}

        {/* Preview time indicator */}
        {previewTime !== null && (
          <div
            className="absolute top-0 w-0.5 h-full bg-primary/50"
            style={{
              left: `${(previewTime / duration) * 100}%`,
              transition: 'left 0.1s linear'
            }}
          />
        )}

        {/* Operation markers */}
        {operations.map((op, index) => {
          if (op.type === 'trim') {
            const startPercent = (op.startTime / duration) * 100;
            const endPercent = (op.endTime / duration) * 100;
            return (
              <div
                key={index}
                className="absolute top-0 h-full bg-primary/20"
                style={{
                  left: `${startPercent}%`,
                  width: `${endPercent - startPercent}%`
                }}
              />
            );
          }
          return null;
        })}

        {/* Current time indicator */}
        <div
          className="absolute top-0 w-0.5 h-full bg-primary"
          style={{
            left: `${(currentTime / duration) * 100}%`,
            transition: 'left 0.1s linear'
          }}
        />
      </div>

      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{formatTime(currentTime)}</span>
        <Slider
          defaultValue={[currentTime]}
          value={[currentTime]}
          min={0}
          max={duration}
          step={0.1}
          onValueChange={([value]) => onTimeUpdate(value)}
          className="mx-4 flex-grow"
        />
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
} 