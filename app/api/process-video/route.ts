import { NextResponse } from 'next/server';
import { processVideo } from '@/lib/video-processor';
import { VideoOperation } from '@/types/video';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const { filename, operations } = await request.json();

    // Process video
    const videoPath = `/uploads/${filename}`;
    const fileBuffer = await readFile(videoPath);
    const videoFile = new File([fileBuffer], filename, { type: 'video/mp4' });
    const processedUrl = await processVideo(videoFile, operations);

    return NextResponse.json({
      success: true,
      url: processedUrl
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Processing failed' },
      { status: 500 }
    );
  }
}


