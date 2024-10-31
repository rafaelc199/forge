"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { VideoPlayer } from './components/VideoPlayer';
import { OperationsList } from './components/OperationsList';
import { Button } from '@/components/ui/button';
import { VideoOperation, VideoPreset } from '@/types/video';
import { FilterModal } from './components/modals/FilterModal';
import { ResizeModal } from './components/modals/ResizeModal';
import { Progress } from '@/components/ui/progress';
import { CropModal } from './components/modals/CropModal';
import { RotateModal } from './components/modals/RotateModal';
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent } from '@/components/ui/select';
import { Clock, Download, Loader2, Play, Upload, Filter } from 'lucide-react';
import { KeyboardShortcuts } from './components/KeyboardShortcuts';
import { VideoInfo } from './components/VideoInfo';
import { Timeline } from './components/Timeline';
import { ProjectManager } from './components/ProjectManager';
import { TrimModal } from './components/modals/TrimModal';
import { processVideo } from '@/lib/video-processor';

const PRESETS: VideoPreset = {
  'cinematic': [
    { type: 'filter', filter: 'contrast', intensity: 120 },
    { type: 'filter', filter: 'brightness', intensity: 110 },
  ],
  'vintage': [
    { type: 'filter', filter: 'sepia', intensity: 80 },
    { type: 'filter', filter: 'contrast', intensity: 90 },
  ],
};

export default function EditorPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [operations, setOperations] = useState<VideoOperation[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showResizeModal, setShowResizeModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [showRotateModal, setShowRotateModal] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showTrimModal, setShowTrimModal] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setVideoFile(file);
  };

  const handleProcessVideo = useCallback(async () => {
    if (!videoFile || operations.length === 0) return;

    try {
      setIsProcessing(true);
      setProgress(0);

      const { url } = await processVideo(
        videoFile, 
        operations,
        (progress) => {
          setProgress(progress);
          console.log('Processing progress:', progress);
        }
      );
      
      setProcessedVideoUrl(url);
      
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        
        await new Promise((resolve) => {
          if (!videoRef.current) return;
          
          const handleCanPlay = () => {
            videoRef.current?.removeEventListener('canplay', handleCanPlay);
            resolve(null);
          };
          
          videoRef.current.addEventListener('canplay', handleCanPlay);
          videoRef.current.load();
        });

        try {
          await videoRef.current.play();
        } catch (playError) {
          console.warn('Auto-play failed:', playError);
        }
      }
      
      alert('Video processed successfully!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to process video');
      console.error('Processing error:', error);
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  }, [videoFile, operations]);

  const handleAddOperation = (operation: VideoOperation) => {
    switch (operation.type) {
      case 'trim':
        setShowTrimModal(true);
        break;
      case 'resize':
        setShowResizeModal(true);
        break;
      case 'filter':
        setShowFilterModal(true);
        break;
      case 'crop':
        setShowCropModal(true);
        break;
      case 'rotate':
        setShowRotateModal(true);
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

  const handleFilter = (filter: "grayscale" | "sepia" | "brightness" | "contrast", intensity?: number) => {
    if (filter) {
      setOperations(prev => [...prev, { 
        type: 'filter', 
        filter,
        intensity: intensity || 100 
      }]);
      setShowFilterModal(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
    } else {
      alert('Please drop a valid video file');
    }
  };

  const handleCrop = (cropX: number, cropY: number, cropWidth: number, cropHeight: number) => {
    setOperations(prev => [...prev, { 
      type: 'crop',
      cropX,
      cropY,
      cropWidth,
      cropHeight
    }]);
    setShowCropModal(false);
  };

  const handleRotate = (angle: number) => {
    setOperations(prev => [...prev, { type: 'rotate', angle }]);
    setShowRotateModal(false);
  };

  const handleTimeUpdate = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const handleDurationChange = () => setDuration(video.duration);
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);

    video.addEventListener('loadedmetadata', handleDurationChange);
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('loadedmetadata', handleDurationChange);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!videoFile) return;
      
      if (e.target instanceof HTMLInputElement) return;

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            if (operations.length > 0) {
              setOperations(prev => prev.slice(0, -1));
            }
            break;
          case 's':
            e.preventDefault();
            handleProcessVideo();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [videoFile, operations, handleProcessVideo]);

  useEffect(() => {
    return () => {
      if (processedVideoUrl) {
        URL.revokeObjectURL(processedVideoUrl);
      }
    };
  }, [processedVideoUrl]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-card rounded-xl shadow-lg border border-border/50 backdrop-blur-sm">
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
                VideoForge
              </h1>
              <KeyboardShortcuts />
            </div>

            {!videoFile ? (
              <div 
                className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-12
                          hover:border-primary/50 transition-colors duration-300
                          bg-muted/50 backdrop-blur-sm"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input 
                  type="file" 
                  accept="video/*" 
                  className="hidden" 
                  id="video-upload"
                  onChange={handleFileUpload}
                />
                <label htmlFor="video-upload" className="cursor-pointer block">
                  <div className="flex flex-col items-center gap-6">
                    <div className="p-6 rounded-full bg-primary/10">
                      <Upload className="h-12 w-12 text-primary" />
                    </div>
                    <div className="space-y-2 text-center">
                      <p className="text-xl font-semibold">Upload your video</p>
                      <p className="text-sm text-muted-foreground">
                        Drag and drop or click to select
                      </p>
                    </div>
                    <Button size="lg" className="w-full max-w-xs">
                      Select Video
                    </Button>
                  </div>
                </label>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="rounded-xl overflow-hidden border border-border/50 shadow-lg">
                  <VideoPlayer 
                    videoRef={videoRef} 
                    src={processedVideoUrl || URL.createObjectURL(videoFile)} 
                  />
                </div>

                <VideoInfo videoRef={videoRef} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => {
                          console.log("Opening trim modal");
                          if (videoRef.current) {
                            videoRef.current.pause();
                            setShowTrimModal(true);
                          }
                        }}
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Trim
                      </Button>
                      <Button 
                        variant="outline"
                        className="hover:bg-primary/10"
                        onClick={() => handleAddOperation({ 
                          type: 'filter',
                          filter: 'grayscale',
                          intensity: 1
                        })}
                      >
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                      </Button>
                      <Button onClick={() => handleAddOperation({ 
                        type: 'crop', 
                        cropX: 0, 
                        cropY: 0, 
                        cropWidth: 100, 
                        cropHeight: 100 
                      })}>
                        Crop
                      </Button>
                      <Button onClick={() => handleAddOperation({ type: 'rotate', angle: 0 })}>Rotate</Button>
                      <Button onClick={() => handleAddOperation({ type: 'resize', width: 1280, height: 720 })}>Resize</Button>
                    </div>
                    
                    <OperationsList 
                      operations={operations} 
                      onRemoveOperation={handleRemoveOperation} 
                    />
                  </div>

                  <div className="space-y-4">
                    <Timeline
                      videoRef={videoRef}
                      operations={operations}
                      currentTime={currentTime}
                      duration={duration}
                      onTimeUpdate={handleTimeUpdate}
                    />
                    <ProjectManager
                      operations={operations}
                      onLoadOperations={setOperations}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      if (processedVideoUrl) {
                        URL.revokeObjectURL(processedVideoUrl);
                      }
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
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    )}
                    <Button
                      onClick={handleProcessVideo}
                      disabled={isProcessing || operations.length === 0}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Process Video
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {isProcessing && (
                  <div className="mt-4">
                    <Progress value={progress} className="h-2" />
                    <p className="text-sm text-center mt-2 text-muted-foreground">
                      Processing video: {progress}%
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showResizeModal && (
        <ResizeModal
          onClose={() => setShowResizeModal(false)}
          onApply={(width, height) => {
            setOperations(prev => [...prev, { type: 'resize', width, height }]);
            setShowResizeModal(false);
          }}
          initialWidth={videoRef.current?.videoWidth || 1920}
          initialHeight={videoRef.current?.videoHeight || 1080}
        />
      )}

      {showFilterModal && (
        <FilterModal
          onClose={() => setShowFilterModal(false)}
          onApply={(filter: "grayscale" | "sepia" | "brightness" | "contrast", intensity?: number) => {
            setOperations(prev => [...prev, { 
              type: 'filter' as const, 
              filter, 
              intensity: intensity ?? 0
            }]);
            setShowFilterModal(false);
          }}
          videoRef={videoRef}
        />
      )}

      {showCropModal && (
        <CropModal
          onClose={() => setShowCropModal(false)}
          onApply={(cropX, cropY, cropWidth, cropHeight) => {
            setOperations(prev => [...prev, { 
              type: 'crop', 
              cropX, 
              cropY, 
              cropWidth, 
              cropHeight 
            }]);
            setShowCropModal(false);
          }}
          videoRef={videoRef}
        />
      )}

      {showRotateModal && (
        <RotateModal
          onClose={() => setShowRotateModal(false)}
          onApply={(angle) => {
            setOperations(prev => [...prev, { type: 'rotate', angle }]);
            setShowRotateModal(false);
          }}
        />
      )}

      {showTrimModal && (
        <TrimModal
          onClose={() => setShowTrimModal(false)}
          onApply={(startTime: number, endTime: number) => {
            console.log('Applying trim:', startTime, endTime);
            setOperations(prev => [...prev, { 
              type: 'trim', 
              startTime, 
              endTime 
            }]);
            setShowTrimModal(false);
          }}
          videoRef={videoRef}
        />
      )}
    </div>
  );
}
