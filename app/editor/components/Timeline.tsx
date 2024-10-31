"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Slider } from '@/components/ui/slider';
import { VideoOperation } from '@/types/video';
import styles from './Timeline.module.css';
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
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  const generateThumbnails = useCallback(async (video: HTMLVideoElement) => {
    try {
      setIsGenerating(true);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 160;
      canvas.height = 90;

      const thumbnailCount = 10;
      const interval = video.duration / thumbnailCount;
      const newThumbnails: string[] = [];
      const originalTime = video.currentTime;

      for (let i = 0; i < thumbnailCount; i++) {
        video.currentTime = i * interval;
        await new Promise<void>((resolve) => {
          const handleSeeked = () => {
            video.removeEventListener('seeked', handleSeeked);
            resolve();
          };
          video.addEventListener('seeked', handleSeeked);
        });
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        newThumbnails.push(canvas.toDataURL('image/jpeg', 0.5));
      }

      video.currentTime = originalTime;
      setThumbnails(newThumbnails);
    } catch (error) {
      console.error('Error generating thumbnails:', error);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !duration || isGenerating) return;

    generateThumbnails(video);
  }, [videoRef, duration, isGenerating, generateThumbnails]);

  const handleTimeChange = useCallback((value: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value;
      onTimeUpdate(value);
    }
  }, [videoRef, onTimeUpdate]);

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full space-y-2" ref={timelineRef}>
      <div className="relative h-16 bg-muted rounded-lg overflow-hidden">
        {/* Thumbnails */}
        <div className={styles.thumbnailContainer}>
          {thumbnails.map((thumbnail, index) => (
            <div
              key={index}
              className={styles.thumbnail}
              style={{ minWidth: `${100 / thumbnails.length}%` }}
            >
              <div className="relative h-full w-full">
                <Image
                  src={thumbnail}
                  alt={`Thumbnail ${index}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                  priority={index < 3}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Operation markers */}
        {operations.map((operation, index) => {
          if (operation.type === 'trim') {
            const startPosition = (operation.startTime / duration) * 100;
            const endPosition = (operation.endTime / duration) * 100;
            return (
              <div key={index}>
                <div
                  className={styles.operationMarker}
                  style={{ left: `${startPosition}%` }}
                  title={`Trim start: ${formatTime(operation.startTime)}`}
                />
                <div
                  className={styles.operationMarker}
                  style={{ left: `${endPosition}%` }}
                  title={`Trim end: ${formatTime(operation.endTime)}`}
                />
                <div
                  className={styles.trimRange}
                  style={{
                    left: `${startPosition}%`,
                    width: `${endPosition - startPosition}%`
                  }}
                />
              </div>
            );
          }
          return null;
        })}

        {/* Current time indicator */}
        <div
          className={styles.timeIndicator}
          style={{ left: `${(currentTime / duration) * 100}%` }}
        />
      </div>

      {/* Time slider */}
      <Slider
        value={[currentTime]}
        defaultValue={[0]}
        min={0}
        max={duration}
        step={0.1}
        onValueChange={([value]) => handleTimeChange(value)}
        className="cursor-pointer"
      />

      {/* Time display */}
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
} 