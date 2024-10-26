"use client";

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useVideoUpload } from '@/hooks/use-video-upload';

export function UploadButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploadVideo, isUploading } = useVideoUpload();

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await uploadVideo(file);
      } catch (error) {
        console.error('Erro ao fazer upload do vídeo:', error);
      }
    }
  };

  return (
    <>
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        accept="video/*"
        aria-label="Upload video"
        onChange={handleFileChange}
      />
      <Button
        className="w-full"
        size="lg"
        onClick={handleClick}
        disabled={isUploading}
      >
        <Upload className="mr-2 h-4 w-4" />
        {isUploading ? 'Uploading...' : 'Upload Video'}
      </Button>
    </>
  );
}
