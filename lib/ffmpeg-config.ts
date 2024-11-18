import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

export async function getFFmpeg() {
  if (ffmpeg) return ffmpeg;

  try {
    ffmpeg = new FFmpeg();
    await ffmpeg.load();

    // Verificar se o FFmpeg está pronto usando uma abordagem diferente
    if (!ffmpeg) {
      throw new Error('FFmpeg failed to load');
    }

    console.log('FFmpeg loaded successfully');
    return ffmpeg;
  } catch (error) {
    console.error('Error loading FFmpeg:', error);
    ffmpeg = null;
    throw error;
  }
}

// Função para verificar se o FFmpeg está disponível
export async function isFFmpegReady() {
  try {
    const instance = await getFFmpeg();
    return instance !== null;
  } catch {
    return false;
  }
}

// Função para limpar recursos
export async function cleanupFFmpeg() {
  if (ffmpeg) {
    try {
      // Limpar recursos do FFmpeg
      ffmpeg = null;
    } catch (error) {
      console.error('Error cleaning up FFmpeg:', error);
    }
  }
}

// Função específica para extrair frames
export async function extractFrames(videoFile: File, fps: number = 30): Promise<string[]> {
  const ffmpeg = await getFFmpeg();
  
  try {
    // Carregar o vídeo
    await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));
    
    // Extrair frames em alta qualidade
    await ffmpeg.exec([
      '-i', 'input.mp4',
      '-vf', `fps=${fps}`,
      '-frame_pts', '1',
      '-f', 'image2',
      '-qscale:v', '2', // Alta qualidade
      '-vf', 'scale=320:180', // Tamanho consistente
      'frame_%d.jpg'
    ]);

    // Ler os frames
    const frames: string[] = [];
    let frameIndex = 1;

    while (true) {
      try {
        const data = await ffmpeg.readFile(`frame_${frameIndex}.jpg`);
        const blob = new Blob([data], { type: 'image/jpeg' });
        frames.push(URL.createObjectURL(blob));
        frameIndex++;
      } catch {
        break;
      }
    }

    return frames;
  } catch (error) {
    console.error('Error extracting frames:', error);
    throw error;
  }
} 