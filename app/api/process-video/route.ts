import { NextResponse } from 'next/server';
import { processVideo } from '@/lib/video-processor';
import { VideoOperation } from '@/types/video';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { videoPath, operations } = body;

    // Validate input
    if (!videoPath || !operations) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Log the received data for debugging
    console.log('Received request:', { videoPath, operations });

    // Process the video
    try {
      const jobId = await processVideo(videoPath, operations);
      const editedUrl = `/processed/${jobId}.mp4`;

      return NextResponse.json({
        success: true,
        url: editedUrl
      });
    } catch (processingError) {
      console.error('Video processing error:', processingError);
      return NextResponse.json(
        { success: false, error: 'Video processing failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}
