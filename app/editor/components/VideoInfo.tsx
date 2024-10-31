"use client";

import { useEffect, useState } from 'react';

interface VideoInfoProps {
  videoRef: React.RefObject<HTMLVideoElement>;
}

export function VideoInfo({ videoRef }: VideoInfoProps) {
  const [info, setInfo] = useState({
    duration: 0,
    resolution: '',
    size: '',
  });

  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const updateInfo = () => {
      setInfo({
        duration: video.duration,
        resolution: `${video.videoWidth}x${video.videoHeight}`,
        size: video.videoWidth * video.videoHeight * 3 / (8 * 1024 * 1024) + 'MB (estimated)',
      });
    };

    video.addEventListener('loadedmetadata', updateInfo);
    return () => video.removeEventListener('loadedmetadata', updateInfo);
  }, [videoRef]);

  return (
    <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
      <div>
        <p className="text-sm font-medium">Duration</p>
        <p className="text-sm text-muted-foreground">
          {Math.floor(info.duration / 60)}:{Math.floor(info.duration % 60).toString().padStart(2, '0')}
        </p>
      </div>
      <div>
        <p className="text-sm font-medium">Resolution</p>
        <p className="text-sm text-muted-foreground">{info.resolution}</p>
      </div>
      <div>
        <p className="text-sm font-medium">Size</p>
        <p className="text-sm text-muted-foreground">{info.size}</p>
      </div>
    </div>
  );
} 