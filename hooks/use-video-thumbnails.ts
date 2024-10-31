"use client";

import { useState, useCallback } from 'react';
import { useThumbnailCache } from './use-thumbnail-cache';

export function useVideoThumbnails() {
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { getCachedThumbnails, cacheThumbnails, generateVideoId } = useThumbnailCache();

  const generateThumbnails = useCallback(async (
    video: HTMLVideoElement,
    options: {
      count?: number;
      width?: number;
      height?: number;
      quality?: number;
    } = {}
  ) => {
    const videoId = generateVideoId(video);
    const cached = getCachedThumbnails(videoId);
    
    if (cached) {
      console.log('Using cached thumbnails');
      setThumbnails(cached);
      return;
    }

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

      // Gerar thumbnails em lotes para melhor performance
      const batchSize = 3;
      for (let i = 0; i < count; i += batchSize) {
        const batch = Array.from({ length: Math.min(batchSize, count - i) }, (_, j) => i + j);
        
        await Promise.all(batch.map(async (index) => {
          video.currentTime = index * interval;
          await new Promise<void>((resolve) => {
            const handleSeeked = () => {
              video.removeEventListener('seeked', handleSeeked);
              resolve();
            };
            video.addEventListener('seeked', handleSeeked);
          });
          
          ctx.drawImage(video, 0, 0, width, height);
          newThumbnails[index] = canvas.toDataURL('image/jpeg', quality);
        }));
      }

      video.currentTime = originalTime;
      setThumbnails(newThumbnails);
      cacheThumbnails(videoId, newThumbnails);
    } catch (error) {
      console.error('Error generating thumbnails:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [generateVideoId, getCachedThumbnails, cacheThumbnails]);

  return {
    thumbnails,
    isGenerating,
    generateThumbnails
  };
} 