import { NextResponse } from 'next/server';
import { processVideo } from '@/lib/video-processor';
import { VideoProcessingJob } from '@/types/video';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { videoId, operations } = body as VideoProcessingJob;

    if (!videoId || !operations) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const jobId = await processVideo(videoId, operations);

    return NextResponse.json({ 
      success: true,
      jobId 
    });
  } catch (error) {
    console.error('Processing error:', error);
    return NextResponse.json(
      { error: 'Processing failed' },
      { status: 500 }
    );
  }
}