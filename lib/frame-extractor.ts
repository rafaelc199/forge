import { getFFmpeg } from './ffmpeg-config';
import { fetchFile } from '@ffmpeg/util';

export async function extractFrames(video: HTMLVideoElement, fps: number = 30): Promise<string[]> {
  const frames: string[] = [];
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return frames;

  // Configurar canvas para melhor qualidade
  canvas.width = 320;  // Largura do thumbnail
  canvas.height = 180; // Altura do thumbnail (16:9)

  // Capturar frames em intervalos regulares
  const interval = 1 / fps;
  const duration = video.duration;
  const originalTime = video.currentTime;
  
  try {
    for (let time = 0; time < duration; time += interval) {
      video.currentTime = time;
      await new Promise<void>(resolve => {
        const handleSeeked = () => {
          video.removeEventListener('seeked', handleSeeked);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          frames.push(canvas.toDataURL('image/jpeg', 0.7));
          resolve();
        };
        video.addEventListener('seeked', handleSeeked, { once: true });
      });
    }
  } catch (error) {
    console.error('Error extracting frames:', error);
  } finally {
    // Restaurar o tempo original do vídeo
    video.currentTime = originalTime;
  }

  return frames;
} 