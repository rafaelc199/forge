import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { join } from 'path';

// Mark route as dynamic
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('video/')) {
      return NextResponse.json(
        { error: 'File must be a valid video format' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size must be less than 100MB' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = join(UPLOAD_DIR, fileName);

    // Save the file locally
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(filePath, buffer);

    // Return the local URL
    const videoUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      url: videoUrl,
      originalName: file.name
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
