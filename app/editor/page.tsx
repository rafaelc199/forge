"use client";

import { useState } from 'react';
import { useVideoUpload } from '@/hooks/use-video-upload';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { VideoOperation } from '@/types/video';

export default function Editor() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [editedVideoUrl, setEditedVideoUrl] = useState<string | null>(null);
  const [operations, setOperations] = useState<VideoOperation[]>([]);
  const { uploadVideo, isUploading } = useVideoUpload();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadVideo(file);
      if (typeof result === 'object' && result !== null && 'url' in result) {
        setVideoUrl(result.url as string);
      } else {
        throw new Error('Invalid upload result');
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handleEditVideo = async () => {
    if (!videoUrl) return;

    try {
      const response = await fetch('/api/process-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoPath: videoUrl, operations }),
      });

      const result = await response.json();

      if (result.success) {
        setEditedVideoUrl(result.url);
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Video processing error:', error);
    }
  };

  const addTrimOperation = () => {
    const startTime = prompt("Enter start time in seconds:", "0");
    const duration = prompt("Enter duration in seconds:", "10");

    if (startTime !== null && duration !== null) {
      setOperations([...operations, { type: 'trim', startTime: parseFloat(startTime), duration: parseFloat(duration) }]);
    }
  };

  const addResizeOperation = () => {
    const width = prompt("Enter width:", "640");
    const height = prompt("Enter height:", "480");

    if (width !== null && height !== null) {
      setOperations([...operations, { type: 'resize', width: parseInt(width), height: parseInt(height) }]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-6">Video Editor</h1>
          
          <div className="space-y-6">
            {!videoUrl ? (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="video-upload"
                />
                <label
                  htmlFor="video-upload"
                  className="cursor-pointer block"
                >
                  <div className="flex flex-col items-center gap-4">
                    <Upload className="h-12 w-12 text-muted-foreground" />
                    <div className="space-y-2">
                      <p className="text-lg font-medium">
                        {isUploading ? 'Uploading...' : 'Upload your video'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Drag and drop or click to select
                      </p>
                    </div>
                    <Button disabled={isUploading}>
                      {isUploading ? 'Uploading...' : 'Select Video'}
                    </Button>
                  </div>
                </label>
              </div>
            ) : (
              <>
                <video controls src={videoUrl} className="w-full rounded-lg shadow-lg" />
                <div className="mt-4 space-y-2">
                  <Button onClick={addTrimOperation}>Add Trim Operation</Button>
                  <Button onClick={addResizeOperation}>Add Resize Operation</Button>
                </div>
                <Button onClick={handleEditVideo} className="mt-4">
                  Edit Video
                </Button>
                {editedVideoUrl && (
                  <video controls src={editedVideoUrl} className="w-full rounded-lg shadow-lg mt-4" />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
