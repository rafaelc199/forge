import { NextResponse } from 'next/server';
import { processVideo } from '@/lib/video-processor';
import { VideoOperation } from '@/types/video';

export async function POST(request: Request) {
  try {
    const { videoPath, operations } = await request.json();

    if (!videoPath || !operations) {
      return NextResponse.json(
        { error: 'Missing video path or operations' },
        { status: 400 }
      );
    }

    const jobId = await processVideo(videoPath, operations);
    const editedUrl = `/processed/${jobId}.mp4`;

    return NextResponse.json({
      success: true,
      url: editedUrl
    });
  } catch (error) {
    console.error('Video processing error:', error);
    return NextResponse.json(
      { error: 'Processing failed' },
      { status: 500 }
    );
  }
}
