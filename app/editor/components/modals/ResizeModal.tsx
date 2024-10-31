"use client";

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ResizeModalProps {
  onClose: () => void;
  onApply: (width: number, height: number) => void;
  initialWidth: number;
  initialHeight: number;
}

export function ResizeModal({ onClose, onApply, initialWidth, initialHeight }: ResizeModalProps) {
  const [width, setWidth] = useState(initialWidth);
  const [height, setHeight] = useState(initialHeight);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const aspectRatio = initialWidth / initialHeight;

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth);
    if (maintainAspectRatio) {
      setHeight(Math.round(newWidth / aspectRatio));
    }
  };

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    if (maintainAspectRatio) {
      setWidth(Math.round(newHeight * aspectRatio));
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="space-y-4 p-6">
        <h2 className="text-xl font-bold">Resize Video</h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Width</label>
              <Input
                type="number"
                value={width}
                onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                min={1}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Height</label>
              <Input
                type="number"
                value={height}
                onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                min={1}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="aspect-ratio"
              checked={maintainAspectRatio}
              onChange={(e) => setMaintainAspectRatio(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="aspect-ratio" className="text-sm">
              Maintain aspect ratio
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={() => onApply(width, height)}
            disabled={width <= 0 || height <= 0}
          >
            Apply
          </Button>
        </div>
      </div>
    </Modal>
  );
} 
