import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { VideoOperation } from '@/types/video';
import { toBlobURL } from '@ffmpeg/util';

export class VideoProcessor {
  private ffmpeg: FFmpeg | null = null;
  private initialized: boolean = false;

  constructor() {
    this.ffmpeg = new FFmpeg();
  }

  private async loadFFmpeg() {
    if (!this.ffmpeg || !this.initialized) {
      this.ffmpeg = new FFmpeg();
      
      try {
        // Load FFmpeg with the correct configuration
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd';
        await this.ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        this.initialized = true;
      } catch (err) {
        throw new Error('Failed to load FFmpeg');
      }
    }
  }

  async processVideo(videoFile: File, operations: VideoOperation[]): Promise<Blob> {
    try {
      await this.loadFFmpeg();
      if (!this.ffmpeg) throw new Error('FFmpeg not initialized');

      const inputFileName = 'input.mp4';
      const outputFileName = 'output.mp4';
      
      // Write input file to memory
      await this.ffmpeg.writeFile(inputFileName, await fetchFile(videoFile));

      // Prepare FFmpeg command
      let filters: string[] = [];
      let inputOptions: string[] = [];
      let outputOptions: string[] = [];

      // Build FFmpeg filters based on operations
      operations.forEach(op => {
        switch (op.type) {
          case 'filter':
            const { filter, intensity } = op;
            switch (filter) {
              case 'brightness':
                filters.push(`eq=brightness=${(intensity - 100) / 100}`);
                break;
              case 'contrast':
                filters.push(`eq=contrast=${intensity / 100}`);
                break;
              case 'saturate':
                filters.push(`eq=saturation=${intensity / 100}`);
                break;
              case 'grayscale':
                if (intensity > 0) {
                  filters.push('colorchannelmixer=.3:.4:.3:0:.3:.4:.3:0:.3:.4:.3');
                }
                break;
              case 'sepia':
                if (intensity > 0) {
                  filters.push('colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131');
                }
                break;
              case 'blur':
                filters.push(`boxblur=${intensity/20}`);
                break;
            }
            break;
          case 'rotate':
            filters.push(`rotate=${op.angle}*PI/180`);
            break;
          case 'resize':
            filters.push(`scale=${op.width}:${op.height}`);
            break;
          case 'crop':
            filters.push(`crop=${op.width}:${op.height}:${op.x}:${op.y}`);
            break;
          case 'trim':
            inputOptions.push('-ss', op.start.toString());
            inputOptions.push('-t', (op.end - op.start).toString());
            break;
        }
      });

      // Construct the complete FFmpeg command
      const command = [
        ...inputOptions,
        '-i', inputFileName,
        ...(filters.length > 0 ? ['-vf', filters.join(',')] : []),
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-c:a', 'aac',
        '-strict', 'experimental',
        outputFileName
      ];

      console.log('FFmpeg command:', command.join(' '));

      // Execute FFmpeg command
      await this.ffmpeg.exec(command);

      // Read the output file
      const data = await this.ffmpeg.readFile(outputFileName);
      const uint8Array = new Uint8Array(data);
      
      // Create a blob from the processed video
      return new Blob([uint8Array], { type: 'video/mp4' });
    } catch (error) {
      console.error('Processing error:', error);
      throw new Error('Failed to process video');
    }
  }
}

export const videoProcessor = new VideoProcessor();
