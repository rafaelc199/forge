import { VideoOperation } from '@/types/video';
import { processVideo } from './video-processor';

interface BatchJob {
  files: File[];
  operations: VideoOperation[];
  outputFormat: string;
}

interface BatchResult {
  file: string;
  url: string;
  success: boolean;
  error?: string;
}

async function processJob(job: BatchJob): Promise<BatchResult> {
  try {
    // Criar elemento de vídeo temporário para processamento
    const video = document.createElement('video');
    
    // Processar cada arquivo
    const results = await Promise.all(
      job.files.map(async (file) => {
        try {
          const result = await processVideo(
            file,
            job.operations,
            video,
            () => {} // Progress callback vazio
          );

          return {
            file: file.name,
            url: result.url,
            success: true
          };
        } catch (error) {
          return {
            file: file.name,
            url: '',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    return results[0]; // Retornar primeiro resultado por enquanto
  } catch (error) {
    return {
      file: job.files[0]?.name || 'unknown',
      url: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function processBatch(jobs: BatchJob[], onProgress: (progress: number) => void) {
  const results: BatchResult[] = [];
  let totalProgress = 0;

  for (const job of jobs) {
    const result = await processJob(job);
    results.push(result);
    
    totalProgress += (1 / jobs.length) * 100;
    onProgress(totalProgress);
  }

  return results;
} 