import { NextRequest, NextResponse } from 'next/server';
import ffmpeg from 'fluent-ffmpeg';
import { writeFile, readFile, unlink } from 'fs/promises';
import { join } from 'path';
import { VideoOperation } from '@/types/video';

// Não precisamos definir o caminho do FFmpeg explicitamente
// pois ele já está no PATH do sistema
// ffmpeg.setFfmpegPath('ffmpeg');

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('video') as File;
    const operations = JSON.parse(formData.get('operations') as string) as VideoOperation[];

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Usar pasta temp do Windows
    const tempDir = process.env.TEMP || 'C:\\Windows\\Temp';
    const inputPath = join(tempDir, `input-${Date.now()}.mp4`);
    const outputPath = join(tempDir, `output-${Date.now()}.mp4`);

    // Write uploaded file to disk
    const bytes = await file.arrayBuffer();
    await writeFile(inputPath, Buffer.from(bytes));

    // Process video
    await new Promise((resolve, reject) => {
      let command = ffmpeg(inputPath);

      operations.forEach(operation => {
        switch (operation.type) {
          case 'trim':
            command = command
              .setStartTime(operation.startTime)
              .setDuration(operation.endTime - operation.startTime);
            break;
          case 'resize':
            command = command.size(`${operation.width}x${operation.height}`);
            break;
          case 'rotate':
            command = command.videoFilters(`rotate=${operation.angle * Math.PI / 180}`);
            break;
          case 'filter':
            command = command.videoFilters(getFilterCommand(operation));
            break;
          case 'crop':
            command = command.videoFilters(
              `crop=${operation.cropWidth}:${operation.cropHeight}:${operation.cropX}:${operation.cropY}`
            );
            break;
        }
      });

      command
        .on('end', resolve)
        .on('error', reject)
        .save(outputPath);
    });

    // Read the processed file
    const processedVideo = await readFile(outputPath);

    // Clean up temporary files
    await Promise.all([
      unlink(inputPath),
      unlink(outputPath)
    ]).catch(console.error);

    // Garantir que o Content-Type e outros headers estejam corretos
    return new NextResponse(processedVideo, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': processedVideo.length.toString(),
        'Cache-Control': 'no-cache',
        'Content-Disposition': 'inline'
      },
    });
  } catch (error) {
    console.error('Video processing failed:', error);
    return NextResponse.json({ error: 'Video processing failed' }, { status: 500 });
  }
}

function getFilterCommand(operation: Extract<VideoOperation, { type: 'filter' }>): string {
  switch (operation.filter) {
    case 'grayscale':
      return 'colorchannelmixer=.3:.3:.3:0:.3:.3:.3:0:.3:.3:.3';
    case 'sepia':
      return 'colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131';
    case 'brightness':
      return `eq=brightness=${(operation.intensity ?? 100) / 100}`;
    case 'contrast':
      return `eq=contrast=${(operation.intensity ?? 100) / 100}`;
    default:
      throw new Error(`Unsupported filter: ${operation.filter}`);
  }
} 