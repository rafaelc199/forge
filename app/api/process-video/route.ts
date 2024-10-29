import { NextResponse } from 'next/server';
import { processVideo } from '@/lib/video-processor';
import { VideoOperation } from '@/types/video';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const operationsJson = formData.get('operations') as string;
    
    if (!file || !operationsJson) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const operations = JSON.parse(operationsJson) as VideoOperation[];

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    // Save uploaded file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${file.name}`;
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // Process video
    const videoPath = `/uploads/${filename}`;
    const processedUrl = await processVideo(videoPath, operations);

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


