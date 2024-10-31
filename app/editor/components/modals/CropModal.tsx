"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface CropModalProps {
  onClose: () => void;
  onApply: (cropX: number, cropY: number, cropWidth: number, cropHeight: number) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export function CropModal({ onClose, onApply, videoRef }: CropModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropWidth, setCropWidth] = useState(100);
  const [cropHeight, setCropHeight] = useState(100);

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame
    ctx.drawImage(video, 0, 0);

    // Draw crop overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.clearRect(cropX, cropY, cropWidth, cropHeight);
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(cropX, cropY, cropWidth, cropHeight);
  }, [videoRef, cropX, cropY, cropWidth, cropHeight]);

  return (
    <Modal onClose={onClose}>
      <div className="space-y-4 p-6">
        <h2 className="text-xl font-bold">Crop Video</h2>
        <div className="space-y-6">
          <canvas
            ref={canvasRef}
            className="w-full h-auto border rounded-lg"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">X Position</label>
              <Slider
                value={[cropX]}
                min={0}
                max={videoRef.current?.videoWidth || 100}
                step={1}
                defaultValue={[0]}
                onValueChange={([value]) => setCropX(value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Y Position</label>
              <Slider
                value={[cropY]}
                min={0}
                max={videoRef.current?.videoHeight || 100}
                step={1}
                defaultValue={[0]}
                onValueChange={([value]) => setCropY(value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Width</label>
              <Slider
                value={[cropWidth]}
                min={10}
                max={videoRef.current?.videoWidth || 100}
                step={1}
                defaultValue={[100]}
                onValueChange={([value]) => setCropWidth(value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Height</label>
              <Slider
                value={[cropHeight]}
                min={10}
                max={videoRef.current?.videoHeight || 100}
                step={1}
                defaultValue={[100]}
                onValueChange={([value]) => setCropHeight(value)}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onApply(cropX, cropY, cropWidth, cropHeight)}>
            Apply
          </Button>
        </div>
      </div>
    </Modal>
  );
} 