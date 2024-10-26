import { join } from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { VideoOperation } from '@/types/video';
import { promises as fs } from 'fs';

// Add a declaration for the 'fluent-ffmpeg' module
declare module 'fluent-ffmpeg';
declare module 'fluent-ffmpeg';

export async function processVideo(videoPath: string, operations: VideoOperation[]) {
  const jobId = Date.now().toString();
  const inputPath = join(process.cwd(), 'public', videoPath);
  const outputPath = join(process.cwd(), 'public', 'processed', `${jobId}.mp4`);

  try {
    await fs.mkdir(join(process.cwd(), 'public', 'processed'), { recursive: true });

    let command = ffmpeg(inputPath);

    // Apply each operation in sequence
    operations.forEach(operation => {
      switch (operation.type) {
        case 'trim':
          command = command.setStartTime(operation.startTime)
                         .setDuration(operation.duration);
          break;
        case 'resize':
          command = command.size(`${operation.width}x${operation.height}`);
          break;
        case 'filter':
          command = command.videoFilters(operation.filter);
          break;
      }
    });

    // Process the video
    await new Promise((resolve, reject) => {
      command.on('end', resolve)
             .on('error', reject)
             .save(outputPath);
    });

    return jobId;
  } catch (error) {
    console.error('Video processing error:', error);
    throw error;
  }
}
