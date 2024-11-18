"use client";

import React, { useEffect, useState } from 'react';
import { VideoOperation } from '@/types/video';

interface VideoPlayerProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  src: string;
  operations?: VideoOperation[];
}

export function VideoPlayer({ videoRef, src, operations = [] }: VideoPlayerProps) {
  const [style, setStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    let filterString = '';
    let transform = '';

    operations.forEach((op) => {
      if (op.type === 'filter') {
        const { filter, intensity } = op;
        switch (filter) {
          case 'brightness':
            filterString += `brightness(${intensity}%) `;
            break;
          case 'contrast':
            filterString += `contrast(${intensity}%) `;
            break;
          case 'saturate':
            filterString += `saturate(${intensity}%) `;
            break;
          case 'grayscale':
            filterString += `grayscale(${intensity}%) `;
            break;
          case 'sepia':
            filterString += `sepia(${intensity}%) `;
            break;
          case 'blur':
            filterString += `blur(${intensity / 10}px) `;
            break;
        }
      }
      if (op.type === 'rotate') {
        transform = `rotate(${op.angle}deg)`;
      }
    });

    setStyle({
      filter: filterString.trim() || undefined,
      transform: transform || undefined,
      transition: 'filter 0.3s ease, transform 0.3s ease',
    });
  }, [operations]);

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full"
        controls
        style={style}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}