"use client";

import { useState } from 'react';

const thumbnailCache = new Map<string, string[]>();

export function useThumbnailCache() {
  const [isLoading, setIsLoading] = useState(false);

  const getCachedThumbnails = (videoId: string): string[] | null => {
    return thumbnailCache.get(videoId) || null;
  };

  const cacheThumbnails = (videoId: string, thumbnails: string[]) => {
    thumbnailCache.set(videoId, thumbnails);
  };

  const generateVideoId = (video: HTMLVideoElement): string => {
    return `${video.src}-${video.duration}-${video.videoWidth}x${video.videoHeight}`;
  };

  return {
    isLoading,
    getCachedThumbnails,
    cacheThumbnails,
    generateVideoId
  };
} 