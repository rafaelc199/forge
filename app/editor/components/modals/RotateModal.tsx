"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { RotateCw, RotateCcw } from 'lucide-react';

interface RotateModalProps {
  onClose: () => void;
  onApply: (angle: number) => void;
}

export function RotateModal({ onClose, onApply }: RotateModalProps) {
  const [rotation, setRotation] = useState(0);

  const handleRotate = (direction: 'cw' | 'ccw') => {
    const newRotation = direction === 'cw' ? rotation + 90 : rotation - 90;
    setRotation(newRotation % 360);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rotate Video</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex justify-center">
            <div 
              className="w-48 h-48 border-2 border-primary rounded-lg flex items-center justify-center"
              style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 0.3s ease' }}
            >
              <div className="w-32 h-20 bg-primary/20 rounded"></div>
            </div>
          </div>
          
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleRotate('ccw')}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleRotate('cw')}
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Current Rotation: {rotation}°
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => onApply(rotation)}>
              Apply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 