import { VideoOperation } from '@/types/video';

export async function processVideo(
  videoFile: File,
  operations: VideoOperation[],
  onProgress?: (progress: number) => void
): Promise<{ blob: Blob, url: string }> {
  try {
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('operations', JSON.stringify(operations));

    const response = await fetch('/api/video/process', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Video processing failed');
    }

    // Criar um blob com o tipo correto
    const arrayBuffer = await response.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: 'video/mp4' });
    
    // Criar uma URL para o blob
    const url = URL.createObjectURL(blob);

    // Pré-carregar o vídeo
    await new Promise((resolve, reject) => {
      const video = document.createElement('video');
      
      video.onloadeddata = resolve;
      video.onerror = reject;
      
      // Prevenir reprodução automática
      video.autoplay = false;
      video.muted = true;
      
      // Carregar apenas os metadados primeiro
      video.preload = 'metadata';
      
      video.src = url;
    });

    // Retornar tanto o blob quanto a URL
    return { blob, url };
  } catch (error) {
    console.error('Video processing failed:', error);
    throw error;
  }
}
