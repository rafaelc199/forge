"use client";

import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";

interface UploadProgress {
  percent: number;
  loaded: number;
  total: number;
}

export function useVideoUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const { toast } = useToast();

  const uploadVideo = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(null);
      
      // Validate file type
      if (!file.type.startsWith('video/')) {
        throw new Error('Please select a valid video file');
      }

      // Validate file size (100MB limit)
      const maxSize = 100 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('File size must be less than 100MB');
      }

      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      const uploadPromise = new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress: UploadProgress = {
              percent: Math.round((event.loaded * 100) / event.total),
              loaded: event.loaded,
              total: event.total
            };
            setUploadProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        xhr.open('POST', '/api/upload');
        xhr.send(formData);
      });

      const response = await uploadPromise;

      toast({
        title: "Success",
        description: "Video uploaded successfully",
      });

      return response;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload video",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  return {
    uploadVideo,
    isUploading,
    uploadProgress,
  };
}
