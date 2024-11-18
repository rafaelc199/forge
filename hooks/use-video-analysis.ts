import { useState, useEffect } from 'react';
import { detectKeyframes } from '@/lib/video-analysis';

interface VideoAnalysis {
  scenes: {start: number; end: number; thumbnail: string}[];
  keyframes: number[];
  duration: number;
  resolution: {width: number; height: number};
}

// Função auxiliar para análise de cenas
async function analyzeScenes(video: HTMLVideoElement): Promise<{start: number; end: number; thumbnail: string}[]> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  canvas.width = 320;
  canvas.height = 180;
  const scenes: {start: number; end: number; thumbnail: string}[] = [];
  
  // Implementação simplificada de detecção de cenas
  for (let time = 0; time < video.duration; time += 5) {
    video.currentTime = time;
    await new Promise(r => video.addEventListener('seeked', r, { once: true }));
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    scenes.push({
      start: time,
      end: Math.min(time + 5, video.duration),
      thumbnail: canvas.toDataURL('image/jpeg', 0.7)
    });
  }

  return scenes;
}

export function useVideoAnalysis(videoRef: React.RefObject<HTMLVideoElement>) {
  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;

    const analyzeVideo = async () => {
      setIsAnalyzing(true);
      try {
        const video = videoRef.current!;
        
        // Detectar cenas
        const scenes = await analyzeScenes(video);
        
        // Detectar keyframes
        const keyframes = await detectKeyframes(video);
        
        setAnalysis({
          scenes,
          keyframes,
          duration: video.duration,
          resolution: {
            width: video.videoWidth,
            height: video.videoHeight
          }
        });
      } catch (error) {
        console.error('Error analyzing video:', error);
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyzeVideo();
  }, [videoRef]);

  return { analysis, isAnalyzing };
} 