"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CropModalProps {
  onClose: () => void;
  onApply: (cropX: number, cropY: number, cropWidth: number, cropHeight: number) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export function CropModal({ onClose, onApply, videoRef }: CropModalProps) {
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crop Video</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Width (%)</label>
              <Input
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                min={10}
                max={100}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Height (%)</label>
              <Input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                min={10}
                max={100}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => {
            // Calcular posição central
            const cropX = (100 - width) / 2;
            const cropY = (100 - height) / 2;
            onApply(cropX, cropY, width, height);
          }}>
            Apply Crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 