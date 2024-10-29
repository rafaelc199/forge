import { join } from 'path';
import { VideoOperation } from '@/types/video';
import { promises as fs } from 'fs';
import ffmpeg from 'fluent-ffmpeg';

export async function processVideo(videoPath: string, operations: VideoOperation[]): Promise<string> {
  try {
    const jobId = Date.now().toString();
    const cleanVideoPath = videoPath.startsWith('/') ? videoPath.slice(1) : videoPath;
    const inputPath = join(process.cwd(), 'public', cleanVideoPath);
    const outputDir = join(process.cwd(), 'public', 'processed');
    const outputPath = join(outputDir, `${jobId}.mp4`);
    const publicPath = `/processed/${jobId}.mp4`;

    // Ensure directories exist
    await fs.mkdir(outputDir, { recursive: true });

    // Process video with FFmpeg
    await new Promise<void>((resolve, reject) => {
      let command = ffmpeg(inputPath);

      operations.forEach(operation => {
        switch (operation.type) {
          case 'resize':
            if (operation.width && operation.height) {
              command = command.size(`${operation.width}x${operation.height}`);
            }
            break;
          case 'rotate':
            if (typeof operation.angle === 'number') {
              command = command.videoFilters(`rotate=${operation.angle}*PI/180`);
            }
            break;
          case 'filter':
            if (operation.filter === 'grayscale') {
              command = command.videoFilters('colorchannelmixer=.3:.4:.3:0:.3:.4:.3:0:.3:.4:.3');
            }
            break;
          case 'trim':
            if (operation.startTime !== undefined && operation.duration !== undefined) {
              command = command
                .setStartTime(operation.startTime)
                .setDuration(operation.duration);
            }
            break;
        }
      });

      command
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .save(outputPath);
    });

    return publicPath;
  } catch (error) {
    console.error('Video processing error:', error);
    throw error;
  }
}
