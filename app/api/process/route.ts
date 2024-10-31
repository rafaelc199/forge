import { NextResponse } from 'next/server';
import { processVideo } from '@/lib/video-processor';
import { readFile } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { videoId, operations } = await request.json();

    // Read the video file
    const videoPath = path.join(process.cwd(), 'uploads', videoId);
    const fileBuffer = await readFile(videoPath);
    const videoFile = new File([fileBuffer], videoId, { type: 'video/mp4' });

    const jobId = await processVideo(videoFile, operations);

    return NextResponse.json({
      success: true,
      jobId
    });
  } catch (error) {
    console.error('Processing error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Processing failed' },
      { status: 500 }
    );
  }
}