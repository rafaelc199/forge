import { VideoOperation } from '@/types/video';

export async function processVideo(
  videoFile: File,
  operations: VideoOperation[],
  onProgress?: (progress: number) => void
): Promise<{ blob: Blob; url: string }> {
  try {
    // Validar entrada
    if (!videoFile) {
      throw new Error('No video file provided');
    }

    if (!operations.length) {
      throw new Error('No operations provided');
    }

    // Log das operações para debug
    console.log('Processing video with operations:', operations);

    // Criar FormData
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('operations', JSON.stringify(operations));

    // Fazer a requisição com melhor tratamento de erros
    let response;
    try {
      response = await fetch('/api/video/process', {
        method: 'POST',
        body: formData,
      });
    } catch (fetchError) {
      console.log('Network error:', fetchError);
      throw new Error('Network error while processing video');
    }

    // Verificar resposta HTTP
    if (!response.ok) {
      let errorMessage = 'Failed to process video';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
        console.log('API error response:', errorData);
      } catch (jsonError) {
        console.log('Error parsing error response:', jsonError);
      }
      throw new Error(errorMessage);
    }

    // Verificar tipo de conteúdo
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('video/')) {
      console.log('Invalid content type:', contentType);
      throw new Error('Invalid response format: expected video content');
    }

    // Processar resposta
    try {
      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);

      // Reportar progresso
      if (onProgress) {
        onProgress(100);
      }

      return { blob, url };
    } catch (processError) {
      console.log('Error processing response:', processError);
      throw new Error('Error processing video response');
    }
  } catch (error) {
    // Log mais simples do erro
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log('Video processing failed:', errorMessage);

    // Re-throw com mensagem mais descritiva
    throw new Error(`Video processing failed: ${errorMessage}`);
  }
}
