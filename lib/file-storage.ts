import { writeFile, unlink, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { nanoid } from 'nanoid';

export class FileStorage {
  private uploadDir: string;
  private tempDir: string;

  constructor() {
    this.uploadDir = join(process.cwd(), 'private', 'uploads');
    this.tempDir = join(process.cwd(), 'private', 'temp');
    this.initializeDirs();
  }

  private async initializeDirs() {
    await mkdir(this.uploadDir, { recursive: true });
    await mkdir(this.tempDir, { recursive: true });
  }

  async saveUploadedFile(file: Buffer, originalName: string): Promise<string> {
    const fileId = nanoid();
    const extension = originalName.split('.').pop();
    const filename = `${fileId}.${extension}`;
    const filepath = join(this.uploadDir, filename);
    
    await writeFile(filepath, file);
    return fileId;
  }

  async cleanupFile(fileId: string): Promise<void> {
    try {
      const files = [
        join(this.uploadDir, `${fileId}.*`),
        join(this.tempDir, `${fileId}.*`)
      ];
      
      await Promise.all(
        files.map(file => unlink(file).catch(() => {}))
      );
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  getFilePath(fileId: string): string {
    return join(this.uploadDir, fileId);
  }
}

export const fileStorage = new FileStorage();
