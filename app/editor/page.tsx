"use client";

import { useState, useRef } from 'react';
import { VideoPlayer } from './components/VideoPlayer';
import { VideoToolbar } from './components/VideoToolbar';
import { TrimModal } from './components/modals/TrimModal';
import { CropModal } from './components/modals/CropModal';
import { ResizeModal } from './components/modals/ResizeModal';
import { RotateModal } from './components/modals/RotateModal';
import { FilterModal } from './components/modals/FilterModal';
import { ProcessingProgress } from './components/ProcessingProgress';
import { useToast } from '@/hooks/use-toast';
import { VideoOperation, FilterType } from '@/types/video';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { videoProcessor } from '@/lib/video-processor';

export default function EditorPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSrc, setVideoSrc] = useState<string>('');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [operations, setOperations] = useState<VideoOperation[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [processedVideo, setProcessedVideo] = useState<string | null>(null);
  const [previewOperations, setPreviewOperations] = useState<VideoOperation[]>([]);
  const { toast } = useToast();

  const handleOperation = (operation: VideoOperation) => {
    setOperations(prev => [...prev, operation]);
    setPreviewOperations(prev => [...prev, operation]);
    setActiveModal(null);
    toast({
      title: "Change added",
      description: "Your change has been added to the queue.",
    });
  };

  const handleProcessVideo = async () => {
    if (operations.length === 0) {
      toast({
        title: "No changes to process",
        description: "Please make some changes to the video first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      setProcessProgress(0);
      setProcessedVideo(null);

      // Get the original video file
      const response = await fetch(videoSrc);
      const videoFile = await response.blob();
      const file = new File([videoFile], 'input.mp4', { type: 'video/mp4' });

      // Process the video with FFmpeg
      const processedBlob = await videoProcessor.processVideo(file, operations);
      
      // Create URL for the processed video
      const processedUrl = URL.createObjectURL(processedBlob);
      
      setVideoSrc(processedUrl);
      setProcessedVideo(processedUrl);
      setOperations([]);
      setPreviewOperations([]);
      setProcessProgress(100);

      toast({
        title: "Processing complete",
        description: "Your video has been processed successfully.",
      });
    } catch (error) {
      console.error('Processing error:', error);
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "An error occurred while processing the video",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(processedVideo!);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `processed-video-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download started",
        description: "Your video download has started.",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download the video. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-4">
        {!videoSrc ? (
          <div className="border-2 border-dashed rounded-lg p-12 text-center">
            <input
              type="file"
              accept="video/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setVideoSrc(URL.createObjectURL(file));
                  setProcessedVideo(null);
                }
              }}
              className="hidden"
              id="video-upload"
            />
            <label
              htmlFor="video-upload"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-md cursor-pointer hover:bg-primary/90"
            >
              Upload Video
            </label>
          </div>
        ) : (
          <>
            <VideoPlayer 
              videoRef={videoRef} 
              src={videoSrc}
              operations={previewOperations}
            />
            
            <div className="flex items-center justify-between gap-4">
              <VideoToolbar
                disabled={!videoSrc}
                isProcessing={isProcessing}
                onTrim={() => setActiveModal('trim')}
                onCrop={() => setActiveModal('crop')}
                onResize={() => setActiveModal('resize')}
                onRotate={() => setActiveModal('rotate')}
                onFilter={() => setActiveModal('filter')}
                onProcess={handleProcessVideo}
                onDownload={handleDownload}
                showDownload={Boolean(processedVideo)}
              />
            </div>

            {operations.length > 0 && (
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Pending Changes ({operations.length})</h3>
                <ul className="space-y-1 text-sm">
                  {operations.map((op, index) => (
                    <li key={index} className="text-muted-foreground">
                      {op.type.charAt(0).toUpperCase() + op.type.slice(1)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {activeModal === 'trim' && (
        <TrimModal
          videoRef={videoRef}
          onClose={() => setActiveModal(null)}
          onApply={(start, end) => handleOperation({ type: 'trim', start, end })}
        />
      )}
      {activeModal === 'crop' && (
        <CropModal
          videoRef={videoRef}
          onClose={() => setActiveModal(null)}
          onApply={(x, y, width, height) => 
            handleOperation({ type: 'crop', x, y, width, height })}
        />
      )}
      {activeModal === 'resize' && (
        <ResizeModal
          onClose={() => setActiveModal(null)}
          onApply={(width, height) => 
            handleOperation({ type: 'resize', width, height })}
        />
      )}
      {activeModal === 'rotate' && (
        <RotateModal
          onClose={() => setActiveModal(null)}
          onApply={(angle) => handleOperation({ type: 'rotate', angle })}
        />
      )}
      {activeModal === 'filter' && (
        <FilterModal
          onClose={() => setActiveModal(null)}
          onApply={(filter, intensity) => 
            handleOperation({ type: 'filter', filter, intensity })}
        />
      )}

      {isProcessing && (
        <ProcessingProgress
          progress={processProgress}
          operation="Processing video..."
        />
      )}
    </div>
  );
}
