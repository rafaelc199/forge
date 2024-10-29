"use client";

import { useState, useCallback } from 'react';
import { useVideoUpload } from '@/hooks/use-video-upload';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { VideoOperation } from '@/types/video';
import { Timeline } from '@/components/Timeline';
import { Modal } from '@/components/ui/Modal';
import { Slider } from '@/components/ui/slider';
import { ProgressBar } from '@/components/ProgressBar';

// Modal component with proper typing
interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
}

export default function Editor() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [editedVideoUrl, setEditedVideoUrl] = useState<string | null>(null);
  const [operations, setOperations] = useState<VideoOperation[]>([]);
  const [showResizeModal, setShowResizeModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [showRotateModal, setShowRotateModal] = useState(false);
  const [width, setWidth] = useState(640);
  const [height, setHeight] = useState(480);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [angle, setAngle] = useState(0);
  const [progress, setProgress] = useState<number>(0);
  const { uploadVideo, isUploading } = useVideoUpload();
  const [start, setStart] = useState<number>(0);
  const [end, setEnd] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Upload error:', error);
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An unknown error occurred');
      }
    }
  };

  const addOperation = (newOperation: VideoOperation) => {
    setOperations((prevOperations) => [...prevOperations, newOperation]);
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setEditedVideoUrl(result.url);
        setProgress(100);
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Video processing error:', error);
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An unknown error occurred');
      }
    }
  };

  const handleTrimChange = (start: number, end: number) => {
    setStart(start);
    setEnd(end);
    setOperations([{ type: 'trim', startTime: start, duration: end - start }]);
  };

  const addResizeOperation = () => {
    addOperation({ type: 'resize', width, height });
    setShowResizeModal(false);
  };

  const addFilterOperation = (filter: string) => {
    addOperation({ type: 'filter', filter });
    setShowFilterModal(false);
  };

  const addCropOperation = () => {
    addOperation({ type: 'crop', cropWidth: width, cropHeight: height, cropX, cropY });
    setShowCropModal(false);
  };

  const addRotateOperation = () => {
    addOperation({ type: 'rotate', angle });
    setShowRotateModal(false);
  };

  const handleDownload = () => {
    if (editedVideoUrl) {
      const link = document.createElement('a');
      link.href = editedVideoUrl;
      link.download = 'edited-video.mp4';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleWidthChange = (value: string) => {
    const widthValue = parseInt(value);
    if (widthValue > 0 && widthValue <= 1920) setWidth(widthValue);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {errorMessage && <p className="text-red-600">{errorMessage}</p>}
        <div className="bg-card rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-6 text-center">Video Editor</h1>
          
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
                  aria-label="Upload your video"
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
                <Timeline duration={60} onTrimChange={handleTrimChange} />
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium">Start:</span>
                    <span className="text-lg font-bold">{start}s</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium">End:</span>
                    <span className="text-lg font-bold">{end}s</span>
                  </div>
                </div>
                <div className="flex space-x-2 mt-4">
                  <Button onClick={() => setShowResizeModal(true)} title="Resize your video to custom dimensions">
                    Add Resize Operation
                  </Button>
                  <Button onClick={() => setShowFilterModal(true)} title="Apply filters to enhance your video">
                    Add Filter Operation
                  </Button>
                  <Button onClick={() => setShowCropModal(true)} title="Crop your video">
                    Add Crop Operation
                  </Button>
                  <Button onClick={() => setShowRotateModal(true)} title="Rotate your video">
                    Add Rotate Operation
                  </Button>
                </div>
                <Button onClick={handleEditVideo} className="mt-4" title="Finalize your edits and process the video">
                  Edit Video
                </Button>
                {editedVideoUrl && (
                  <>
                    <video controls src={editedVideoUrl} className="w-full rounded-lg shadow-lg mt-4" />
                    <Button onClick={handleDownload} className="mt-4" title="Download the edited video">
                      Download Video
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Resize Modal */}
      {showResizeModal && (
        <Modal onClose={() => setShowResizeModal(false)}>
          <div>
            <h2>Resize Video</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Adjust the width and height of your video.
            </p>
            <Slider 
              defaultValue={[width]} 
              onValueChange={(value) => setWidth(value[0])} 
              min={100} 
              max={1920} 
            />
            <Slider 
              defaultValue={[height]} 
              onValueChange={(value) => setHeight(value[0])} 
              min={100} 
              max={1080} 
            />
            <Button onClick={addResizeOperation}>Apply</Button>
          </div>
        </Modal>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <Modal onClose={() => setShowFilterModal(false)}>
          <h2>Select Filter</h2>
          <p className="text-sm text-muted-foreground mb-4">Choose a filter to apply to your video.</p>
          <Button onClick={() => addFilterOperation('grayscale')}>Grayscale</Button>
          <Button onClick={() => addFilterOperation('invert')}>Invert</Button>
        </Modal>
      )}

      {/* Crop Modal */}
      {showCropModal && (
        <Modal onClose={() => setShowCropModal(false)}>
          <div>
            <h2>Crop Video</h2>
            <p className="text-sm text-muted-foreground mb-4">Specify the crop dimensions and position.</p>
            <input type="number" placeholder="Width" onChange={(e) => setWidth(parseInt(e.target.value))} />
            <input type="number" placeholder="Height" onChange={(e) => setHeight(parseInt(e.target.value))} />
          </div>
          <input type="number" placeholder="X" onChange={(e) => setCropX(parseInt(e.target.value))} />
          <input type="number" placeholder="Y" onChange={(e) => setCropY(parseInt(e.target.value))} />
          <Button onClick={addCropOperation}>Apply</Button>
        </Modal>
      )}

      {/* Rotate Modal */}
      {showRotateModal && (
        <Modal onClose={() => setShowRotateModal(false)}>
          <div>
            <h2>Rotate Video</h2>
            <p className="text-sm text-muted-foreground mb-4">Specify the rotation angle.</p>
            <input type="number" placeholder="Angle" onChange={(e) => setAngle(parseInt(e.target.value))} />
            <Button onClick={addRotateOperation}>Apply</Button>
          </div>
        </Modal>
      )}

      <ProgressBar progress={progress} />
    </div>
  );
}
