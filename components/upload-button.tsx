"use client";

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useVideoUpload } from '@/hooks/use-video-upload';

export function UploadButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploadVideo, isUploading } = useVideoUpload();
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        setError('Please select a valid video file');
        return;
      }
      try {
        await uploadVideo(file);
        setError(null);
      } catch (error) {
        console.error('Error uploading video:', error);
        setError('Upload failed');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        setError('Please select a valid video file');
        return;
      }
      try {
        await uploadVideo(file);
        setError(null);
      } catch (error) {
        console.error('Error uploading video:', error);
        setError('Upload failed');
      }
    }
  };

  return (
    <div
      className={`border-dashed border-2 p-4 ${dragging ? 'border-blue-600' : 'border-gray-300'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
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
      <p className="text-center mt-2">Drag and drop a video file here</p>
      {error && <p className="text-red-500 text-center mt-2">{error}</p>}
    </div>
  );
}
