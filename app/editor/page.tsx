"use client";

import { useState } from 'react';
import { useVideoUpload } from '@/hooks/use-video-upload';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { VideoOperation } from '@/types/video';
import { Timeline } from '@/components/Timeline';
import { Modal } from '@/components/ui/Modal';
import { Slider } from '@/components/ui/slider';

export default function Editor() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [editedVideoUrl, setEditedVideoUrl] = useState<string | null>(null);
  const [operations, setOperations] = useState<VideoOperation[]>([]);
  const [showResizeModal, setShowResizeModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [width, setWidth] = useState(640);
  const [height, setHeight] = useState(480);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
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

  const handleTrimChange = (start: number, end: number) => {
    setStart(start);
    setEnd(end);
    setOperations([{ type: 'trim', startTime: start, duration: end - start }]);
  };

  const addResizeOperation = () => {
    setOperations([...operations, { type: 'resize', width, height }]);
    setShowResizeModal(false);
  };

  const addFilterOperation = (filter: string) => {
    setOperations([...operations, { type: 'filter', filter }]);
    setShowFilterModal(false);
  };

  const handleDownload = () => {
    if (editedVideoUrl) {
      const link = document.createElement('a');
      link.href = editedVideoUrl;
      link.download = 'edited-video.mp4'; // You can customize the file name
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
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
          <h2>Resize Video</h2>
          <p className="text-sm text-muted-foreground mb-4">Adjust the width and height of your video.</p>
          <Slider label="Width" value={width} onChange={setWidth} min={100} max={1920} />
          <Slider label="Height" value={height} onChange={setHeight} min={100} max={1080} />
          <Button onClick={addResizeOperation}>Apply</Button>
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
    </div>
  );
}
