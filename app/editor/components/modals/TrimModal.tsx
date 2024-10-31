"use client";

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';

interface TrimModalProps {
  onClose: () => void;
  onApply: (startTime: number, endTime: number) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export function TrimModal({ onClose, onApply, videoRef }: TrimModalProps) {
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);

  // Initialize video duration and end time
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const duration = video.duration;
    console.log("Initial video duration:", duration);
    
    if (duration && !isNaN(duration)) {
      setVideoDuration(duration);
      setEndTime(duration);
    } else {
      // Wait for duration to be available
      const handleLoadedMetadata = () => {
        setVideoDuration(video.duration);
        setEndTime(video.duration);
      };
      
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      
      return () => {
        // Use the video reference captured in closure
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [videoRef]);

  const formatTimeForInput = (seconds: number): { minutes: number; seconds: number } => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return { minutes, seconds: remainingSeconds };
  };

  const handleTimeChange = (type: 'start' | 'end', minutes: number, seconds: number) => {
    const totalSeconds = minutes * 60 + seconds;
    console.log(`Setting ${type} time to:`, totalSeconds);

    if (type === 'start') {
      if (totalSeconds < endTime) {
        setStartTime(totalSeconds);
        if (videoRef.current) {
          videoRef.current.currentTime = totalSeconds;
        }
      }
    } else {
      if (totalSeconds > startTime && totalSeconds <= videoDuration) {
        setEndTime(totalSeconds);
        if (videoRef.current) {
          videoRef.current.currentTime = totalSeconds;
        }
      }
    }
  };

  const startTimeFormatted = formatTimeForInput(startTime);
  const endTimeFormatted = formatTimeForInput(endTime);

  console.log("Current times:", { startTime, endTime, videoDuration });

  if (!videoDuration) {
    return (
      <Modal onClose={onClose}>
        <div className="p-6">
          <h2 className="text-lg font-bold mb-4">Loading video duration...</h2>
        </div>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose}>
      <div className="p-6">
        <h2 className="text-lg font-bold mb-4">Trim Video</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Start Time</label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                value={startTimeFormatted.minutes}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value)) {
                    handleTimeChange('start', value, startTimeFormatted.seconds);
                  }
                }}
                className="w-20"
                placeholder="Min"
              />
              <span>:</span>
              <Input
                type="number"
                min={0}
                max={59}
                value={startTimeFormatted.seconds}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value)) {
                    handleTimeChange('start', startTimeFormatted.minutes, value);
                  }
                }}
                className="w-20"
                placeholder="Sec"
              />
            </div>
            <Slider
              defaultValue={[0]}
              value={[startTime]}
              min={0}
              max={endTime}
              step={1}
              onValueChange={([value]) => {
                setStartTime(value);
                if (videoRef.current) {
                  videoRef.current.currentTime = value;
                }
              }}
              className="mt-2"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">End Time</label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                value={endTimeFormatted.minutes}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value)) {
                    handleTimeChange('end', value, endTimeFormatted.seconds);
                  }
                }}
                className="w-20"
                placeholder="Min"
              />
              <span>:</span>
              <Input
                type="number"
                min={0}
                max={59}
                value={endTimeFormatted.seconds}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value)) {
                    handleTimeChange('end', endTimeFormatted.minutes, value);
                  }
                }}
                className="w-20"
                placeholder="Sec"
              />
            </div>
            <Slider
              defaultValue={[videoDuration]}
              value={[endTime]}
              min={startTime}
              max={videoDuration}
              step={1}
              onValueChange={([value]) => {
                setEndTime(value);
                if (videoRef.current) {
                  videoRef.current.currentTime = value;
                }
              }}
              className="mt-2"
            />
          </div>

          <div className="bg-muted p-2 rounded">
            Selected Duration: {formatTimeForInput(endTime - startTime).minutes}m {formatTimeForInput(endTime - startTime).seconds}s
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={() => {
              if (endTime > startTime) {
                console.log('Applying trim with:', { startTime, endTime });
                onApply(startTime, endTime);
              }
            }}
          >
            Apply
          </Button>
        </div>
      </div>
    </Modal>
  );
} 