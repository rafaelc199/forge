"use client";

import { useState, useCallback } from 'react';

export function useVideoThumbnails() {
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateThumbnails = useCallback(async (
    video: HTMLVideoElement,
    options: {
      count?: number;
      width?: number;
      height?: number;
      quality?: number;
    } = {}
  ) => {
    const {
      count = 10,
      width = 160,
      height = 90,
      quality = 0.5
    } = options;

    try {
      setIsGenerating(true);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = width;
      canvas.height = height;

      const interval = video.duration / count;
      const newThumbnails: string[] = [];
      const originalTime = video.currentTime;

      for (let i = 0; i < count; i++) {
        video.currentTime = i * interval;
        await new Promise<void>((resolve) => {
          const handleSeeked = () => {
            video.removeEventListener('seeked', handleSeeked);
            resolve();
          };
          video.addEventListener('seeked', handleSeeked);
        });
        
        ctx.drawImage(video, 0, 0, width, height);
        newThumbnails.push(canvas.toDataURL('image/jpeg', quality));
      }

      video.currentTime = originalTime;
      setThumbnails(newThumbnails);
    } catch (error) {
      console.error('Error generating thumbnails:', error);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    thumbnails,
    isGenerating,
    generateThumbnails
  };
} 