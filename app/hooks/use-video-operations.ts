import { useState } from 'react';
import { VideoOperation } from '@/types/video';

interface UseVideoOperationsProps {
  onError: (message: string) => void;
}

export function useVideoOperations({ onError }: UseVideoOperationsProps) {
  const [operations, setOperations] = useState<VideoOperation[]>([]);
  const [progress, setProgress] = useState(0);

  const processVideo = async (videoUrl: string): Promise<string | null> => {
    try {
      setProgress(0);
      
      const response = await fetch('/api/process-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoPath: videoUrl, operations }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setProgress(100);
        return result.url;
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'An unknown error occurred');
      console.error('Video processing error:', error);
      return null;
    }
  };

  const addOperation = (operation: VideoOperation) => {
    setOperations(prev => [...prev, operation]);
  };

  const clearOperations = () => {
    setOperations([]);
    setProgress(0);
  };

  return {
    operations,
    progress,
    processVideo,
    addOperation,
    clearOperations,
    setOperations,
  };
} 