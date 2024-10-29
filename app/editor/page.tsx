"use client";

import React, { useState, useRef } from 'react';
import { VideoPlayer } from './components/VideoPlayer';
import { OperationsList } from './components/OperationsList';
import { Button } from '@/components/ui/button';
import { VideoOperation } from '@/types/video';
import { FilterModal } from './components/modals/FilterModal';
import { ResizeModal } from './components/modals/ResizeModal';
import { Progress } from '@/components/ui/progress';

export default function EditorPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [operations, setOperations] = useState<VideoOperation[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showResizeModal, setShowResizeModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setVideoFile(file);
  };

  const handleProcessVideo = async () => {
    if (!videoFile || operations.length === 0) return;

    try {
      setIsProcessing(true);
      setProgress(0);

      const formData = new FormData();
      formData.append('file', videoFile);
      formData.append('operations', JSON.stringify(operations));

      const response = await fetch('/api/process-video', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        setProcessedVideoUrl(`${data.url}?t=${Date.now()}`);
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.load();
        }
        alert('Video processed successfully!');
      } else {
        throw new Error(data.error || 'Processing failed');
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to process video');
      console.error('Processing error:', error);
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  };

  const handleAddOperation = (operation: VideoOperation) => {
    switch (operation.type) {
      case 'resize':
        setShowResizeModal(true);
        break;
      case 'filter':
        setShowFilterModal(true);
        break;
      case 'rotate':
        if (!videoRef.current) return;
        const angle = window.prompt('Enter rotation angle (in degrees):', '90');
        if (angle !== null) {
          const parsedAngle = parseInt(angle);
          if (!isNaN(parsedAngle)) {
            setOperations(prev => [...prev, { type: 'rotate', angle: parsedAngle }]);
          } else {
            alert('Please enter a valid number for rotation angle');
          }
        }
        break;
      case 'trim':
        if (!videoRef.current) return;
        const duration = videoRef.current.duration;
        const start = window.prompt(`Enter start time (0-${duration}s):`, '0');
        const end = window.prompt(`Enter end time (0-${duration}s):`, duration.toString());
        if (start !== null && end !== null) {
          const startTime = parseFloat(start);
          const endTime = parseFloat(end);
          if (!isNaN(startTime) && !isNaN(endTime) && startTime < endTime) {
            setOperations(prev => [...prev, { 
              type: 'trim', 
              startTime: startTime,
              duration: endTime - startTime 
            }]);
          } else {
            alert('Please enter valid start and end times');
          }
        }
        break;
      default:
        setOperations(prev => [...prev, operation]);
    }
  };

  const handleRemoveOperation = (index: number) => {
    setOperations(prevOperations => prevOperations.filter((_, i) => i !== index));
  };

  const handleResize = (width: number, height: number) => {
    if (width > 0 && height > 0) {
      setOperations(prev => [...prev, { type: 'resize', width, height }]);
      setShowResizeModal(false);
    } else {
      alert('Please enter valid dimensions');
    }
  };

  const handleFilter = (filter: string) => {
    if (filter) {
      setOperations(prev => [...prev, { type: 'filter', filter }]);
      setShowFilterModal(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-card rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Video Editor</h1>
        
        {!videoFile ? (
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center">
            <input 
              type="file" 
              accept="video/*" 
              className="hidden" 
              id="video-upload"
              onChange={handleFileUpload}
            />
            <label htmlFor="video-upload" className="cursor-pointer block">
              <div className="flex flex-col items-center gap-4">
                <div className="space-y-2">
                  <p className="text-lg font-medium">Upload your video</p>
                  <p className="text-sm text-muted-foreground">Drag and drop or click to select</p>
                </div>
                <Button>Select Video</Button>
              </div>
            </label>
          </div>
        ) : (
          <div className="space-y-6">
            <VideoPlayer 
              videoRef={videoRef} 
              src={processedVideoUrl || URL.createObjectURL(videoFile)} 
            />
            
            {processedVideoUrl && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setProcessedVideoUrl(null);
                    if (videoRef.current) {
                      videoRef.current.currentTime = 0;
                      videoRef.current.load();
                    }
                  }}
                >
                  Return to Original Video
                </Button>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => handleAddOperation({ type: 'trim' })}>Trim</Button>
                  <Button onClick={() => handleAddOperation({ type: 'filter' })}>Filters</Button>
                  <Button onClick={() => handleAddOperation({ type: 'crop' })}>Crop</Button>
                  <Button onClick={() => handleAddOperation({ type: 'rotate' })}>Rotate</Button>
                  <Button onClick={() => handleAddOperation({ type: 'resize' })}>Resize</Button>
                </div>
                
                <OperationsList 
                  operations={operations} 
                  onRemoveOperation={handleRemoveOperation} 
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Button 
                variant="outline" 
                onClick={() => {
                  setOperations([]);
                  setProcessedVideoUrl(null);
                }}
                disabled={isProcessing}
              >
                Reset
              </Button>
              <div className="space-x-2">
                {processedVideoUrl && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = processedVideoUrl;
                      link.download = 'processed-video.mp4';
                      link.click();
                    }}
                  >
                    Download
                  </Button>
                )}
                <Button
                  onClick={handleProcessVideo}
                  disabled={isProcessing || operations.length === 0}
                >
                  {isProcessing ? 'Processing...' : 'Process Video'}
                </Button>
              </div>
            </div>

            {isProcessing && (
              <div className="mt-4">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-center mt-2 text-muted-foreground">
                  Processing video: {progress}%
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {showResizeModal && (
        <ResizeModal
          onClose={() => setShowResizeModal(false)}
          onApply={handleResize}
          initialWidth={videoRef.current?.videoWidth || 1920}
          initialHeight={videoRef.current?.videoHeight || 1080}
        />
      )}

      {showFilterModal && (
        <FilterModal
          onClose={() => setShowFilterModal(false)}
          onApply={handleFilter}
        />
      )}
    </div>
  );
}
