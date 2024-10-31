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
import { Clock, Download, Loader2, Play, Upload, Filter, Crop, RotateCw, Maximize, Undo2, Redo2 } from 'lucide-react';
import { KeyboardShortcuts } from './components/KeyboardShortcuts';
import { VideoInfo } from './components/VideoInfo';
import { Timeline } from './components/Timeline';
import { ProjectManager } from './components/ProjectManager';
import { TrimModal } from './components/modals/TrimModal';
import { processVideo } from '@/lib/video-processor';
import { ProcessingProgress } from './components/ProcessingProgress';
import { PresetManager } from './components/PresetManager';
import { OperationFeedback } from './components/OperationFeedback';
import { TooltipButton } from './components/TooltipButton';
import { ThemeToggle } from './components/ThemeToggle';
import { useOperationHistory } from '@/hooks/use-operation-history';

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
  const [currentOperation, setCurrentOperation] = useState<string>('');
  const [feedback, setFeedback] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
  }>({
    message: '',
    type: 'info',
    isVisible: false
  });

  const {
    operations,
    addOperation,
    addOperations,
    removeOperation,
    undo,
    redo,
    canUndo,
    canRedo,
    setOperations
  } = useOperationHistory();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setVideoFile(file);
  };

  const showFeedback = (message: string, type: 'success' | 'error' | 'info') => {
    setFeedback({ message, type, isVisible: true });
    setTimeout(() => {
      setFeedback(prev => ({ ...prev, isVisible: false }));
    }, 3000);
  };

  const handleProcessVideo = useCallback(async () => {
    if (!videoFile || operations.length === 0) return;

    try {
      setIsProcessing(true);
      setProgress(0);

      for (let i = 0; i < operations.length; i++) {
        const operation = operations[i];
        setCurrentOperation(getOperationDescription(operation));
        setProgress((i / operations.length) * 100);
        showFeedback(`Processing: ${getOperationDescription(operation)}`, 'info');
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const { url } = await processVideo(videoFile, operations);
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
      
      showFeedback('Video processed successfully!', 'success');
    } catch (error) {
      showFeedback(
        error instanceof Error ? error.message : 'Failed to process video', 
        'error'
      );
      console.error('Processing error:', error);
    } finally {
      setIsProcessing(false);
      setProgress(100);
      setCurrentOperation('');
    }
  }, [videoFile, operations]);

  const getOperationDescription = (operation: VideoOperation): string => {
    switch (operation.type) {
      case 'filter':
        return `Applying ${operation.filter} filter`;
      case 'resize':
        return `Resizing to ${operation.width}x${operation.height}`;
      case 'rotate':
        return `Rotating ${operation.angle}°`;
      case 'crop':
        return 'Cropping video';
      case 'trim':
        return 'Trimming video';
      default:
        return 'Processing...';
    }
  };

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
        addOperation(operation);
    }
  };

  const handleResize = (width: number, height: number) => {
    if (width > 0 && height > 0) {
      addOperation({ type: 'resize', width, height });
      setShowResizeModal(false);
    } else {
      alert('Please enter valid dimensions');
    }
  };

  const handleFilter = (filter: "grayscale" | "sepia" | "brightness" | "contrast", intensity?: number) => {
    if (filter) {
      addOperation({ 
        type: 'filter', 
        filter,
        intensity: intensity || 100 
      });
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
    addOperation({ 
      type: 'crop',
      cropX,
      cropY,
      cropWidth,
      cropHeight
    });
    setShowCropModal(false);
  };

  const handleRotate = (angle: number) => {
    addOperation({ type: 'rotate', angle });
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
            if (e.shiftKey) {
              canRedo && redo();
            } else {
              canUndo && undo();
            }
            break;
          case 'y':
            e.preventDefault();
            canRedo && redo();
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
  }, [videoFile, canUndo, canRedo, undo, redo, handleProcessVideo]);

  useEffect(() => {
    return () => {
      if (processedVideoUrl) {
        URL.revokeObjectURL(processedVideoUrl);
      }
    };
  }, [processedVideoUrl]);

  const handleApplyPreset = (presetOperations: VideoOperation[]) => {
    addOperations(presetOperations);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="bg-card rounded-xl shadow-lg border border-border/50 backdrop-blur-sm">
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
                  VideoForge
                </h1>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <ThemeToggle />
                <KeyboardShortcuts />
              </div>
            </div>

            {!videoFile ? (
              <div 
                className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-6 sm:p-12
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
              <div className="space-y-4 sm:space-y-6">
                <div className="rounded-xl overflow-hidden border border-border/50 shadow-lg">
                  <VideoPlayer 
                    videoRef={videoRef} 
                    src={processedVideoUrl || URL.createObjectURL(videoFile)} 
                  />
                </div>

                <VideoInfo videoRef={videoRef} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex flex-wrap gap-2">
                        <TooltipButton
                          icon={Clock}
                          label="Trim"
                          tooltip="Cut unwanted parts from the beginning or end"
                          onClick={() => handleAddOperation({ type: 'trim', startTime: 0, endTime: 0 })}
                        />
                        <TooltipButton
                          icon={Filter}
                          label="Filters"
                          tooltip="Apply visual effects like grayscale, sepia, etc."
                          onClick={() => handleAddOperation({ 
                            type: 'filter',
                            filter: 'grayscale',
                            intensity: 1
                          })}
                        />
                        <TooltipButton
                          icon={Crop}
                          label="Crop"
                          tooltip="Select a specific area of the video"
                          onClick={() => handleAddOperation({ 
                            type: 'crop', 
                            cropX: 0, 
                            cropY: 0, 
                            cropWidth: 100, 
                            cropHeight: 100 
                          })}
                        />
                        <TooltipButton
                          icon={RotateCw}
                          label="Rotate"
                          tooltip="Rotate the video by any angle"
                          onClick={() => handleAddOperation({ type: 'rotate', angle: 0 })}
                        />
                        <TooltipButton
                          icon={Maximize}
                          label="Resize"
                          tooltip="Change video dimensions"
                          onClick={() => handleAddOperation({ type: 'resize', width: 1280, height: 720 })}
                        />
                      </div>
                      <PresetManager 
                        onApplyPreset={handleApplyPreset}
                        currentOperations={operations}
                      />
                    </div>
                    
                    <OperationsList 
                      operations={operations} 
                      onRemoveOperation={removeOperation} 
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

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={undo}
                      disabled={!canUndo}
                      title="Undo (Ctrl+Z)"
                    >
                      <Undo2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={redo}
                      disabled={!canRedo}
                      title="Redo (Ctrl+Y)"
                    >
                      <Redo2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
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
              </div>
            )}
          </div>
        </div>
      </div>

      {showResizeModal && (
        <ResizeModal
          onClose={() => setShowResizeModal(false)}
          onApply={(width, height) => {
            addOperation({ type: 'resize', width, height });
            setShowResizeModal(false);
          }}
          initialWidth={videoRef.current?.videoWidth || 1920}
          initialHeight={videoRef.current?.videoHeight || 1080}
        />
      )}

      {showFilterModal && (
        <FilterModal
          open={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          onApply={(filter, intensity) => {
            addOperation({ 
              type: 'filter', 
              filter, 
              intensity: intensity ?? 100 
            });
            setShowFilterModal(false);
          }}
          videoRef={videoRef}
        />
      )}

      {showCropModal && (
        <CropModal
          onClose={() => setShowCropModal(false)}
          onApply={(cropX, cropY, cropWidth, cropHeight) => {
            addOperation({ 
              type: 'crop', 
              cropX, 
              cropY, 
              cropWidth, 
              cropHeight 
            });
            setShowCropModal(false);
          }}
          videoRef={videoRef}
        />
      )}

      {showRotateModal && (
        <RotateModal
          onClose={() => setShowRotateModal(false)}
          onApply={(angle) => {
            addOperation({ type: 'rotate', angle });
            setShowRotateModal(false);
          }}
        />
      )}

      {showTrimModal && (
        <TrimModal
          onClose={() => setShowTrimModal(false)}
          onApply={(startTime: number, endTime: number) => {
            console.log('Applying trim:', startTime, endTime);
            addOperation({ 
              type: 'trim', 
              startTime, 
              endTime 
            });
            setShowTrimModal(false);
          }}
          videoRef={videoRef}
        />
      )}

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
