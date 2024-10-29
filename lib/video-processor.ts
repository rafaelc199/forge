import { join } from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { VideoOperation } from '@/types/video';
import { promises as fs } from 'fs';

declare module 'fluent-ffmpeg';

export async function processVideo(videoPath: string, operations: VideoOperation[], format: string = 'mp4') {
  try {
    if (!Array.isArray(operations) || operations.length === 0) {
      throw new Error('No operations provided for video processing.');
    }

    const jobId = Date.now().toString();
    const cleanVideoPath = videoPath.startsWith('/') ? videoPath.slice(1) : videoPath;
    const inputPath = join(process.cwd(), 'public', cleanVideoPath);
    const outputDir = join(process.cwd(), 'public', 'processed');
    const outputPath = join(outputDir, `${jobId}.${format}`);

    console.log('Processing video:', {
      inputPath,
      outputPath,
      operations
    });

    // Ensure input file exists
    try {
      await fs.access(inputPath);
      console.log('Input file exists and is accessible');
    } catch (error) {
      throw new Error(`Input file not found or inaccessible: ${inputPath}`);
    }

    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });
    console.log('Output directory created/verified');

    let command = ffmpeg(inputPath)
      .outputOptions(['-loglevel', 'verbose']) // Enable detailed logging
      .on('start', (commandLine) => {
        console.log('FFmpeg command:', commandLine);
      })
      .on('progress', (progress) => {
        console.log('Processing progress:', progress);
      });

    // Apply operations with safer filter handling
    for (const operation of operations) {
      try {
        switch (operation.type) {
          case 'trim':
            if (typeof operation.startTime === 'number' && typeof operation.duration === 'number') {
              command = command
                .setStartTime(operation.startTime)
                .setDuration(operation.duration);
              console.log('Applied trim operation:', { startTime: operation.startTime, duration: operation.duration });
            }
            break;

          case 'resize':
            if (operation.width && operation.height) {
              command = command.size(`${operation.width}x${operation.height}`);
              console.log('Applied resize operation:', { width: operation.width, height: operation.height });
            }
            break;

          case 'filter':
            if (operation.filter) {
              // Use safer filter application
              switch (operation.filter) {
                case 'grayscale':
                  command = command.videoFilters('colorchannelmixer=.3:.4:.3:0:.3:.4:.3:0:.3:.4:.3');
                  break;
                case 'sepia':
                  command = command.videoFilters('colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131');
                  break;
                default:
                  console.warn(`Unsupported filter: ${operation.filter}`);
                  break;
              }
              console.log('Applied filter operation:', operation.filter);
            }
            break;

          case 'crop':
            if (operation.cropWidth && operation.cropHeight && typeof operation.cropX === 'number' && typeof operation.cropY === 'number') {
              command = command.videoFilters(`crop=${operation.cropWidth}:${operation.cropHeight}:${operation.cropX}:${operation.cropY}`);
              console.log('Applied crop operation:', {
                width: operation.cropWidth,
                height: operation.cropHeight,
                x: operation.cropX,
                y: operation.cropY
              });
            }
            break;

          case 'rotate':
            if (typeof operation.angle === 'number') {
              // Use transpose filter for common angles, or rotation filter for custom angles
              if (operation.angle === 90) {
                command = command.videoFilters('transpose=1');
              } else if (operation.angle === 180) {
                command = command.videoFilters('transpose=1,transpose=1');
              } else if (operation.angle === 270) {
                command = command.videoFilters('transpose=2');
              } else {
                command = command.videoFilters(`rotate=${operation.angle}*PI/180`);
              }
              console.log('Applied rotate operation:', { angle: operation.angle });
            }
            break;

          default:
            console.warn(`Unsupported operation type: ${operation.type}`);
        }
      } catch (error) {
        console.error(`Error applying operation ${operation.type}:`, error);
        throw new Error(`Failed to apply ${operation.type} operation: ${error.message}`);
      }
    }

    // Process video with better error handling
    await new Promise<void>((resolve, reject) => {
      command
        .on('end', () => {
          console.log('Processing completed successfully');
          resolve();
        })
        .on('error', (err, stdout, stderr) => {
          console.error('FFmpeg error:', err.message);
          console.error('FFmpeg stderr:', stderr);
          reject(new Error(`FFmpeg processing failed: ${err.message}`));
        })
        .on('stderr', (stderrLine) => {
          console.log('FFmpeg stderr:', stderrLine);
        })
        .save(outputPath);
    });

    return jobId;
  } catch (error) {
    console.error('Video processing error:', error);
    throw error;
  }
}

// Add error handling and logging
async function processVideoWithLogging(filePath: string, operations: VideoOperation[]) {
  try {
    await processVideo(filePath, operations);
    console.log(`Successfully processed video: ${filePath}`);
  } catch (error) {
    console.error(`Error processing video: ${filePath}`, error);
  }
}

// Export the new function
export { processVideoWithLogging };
