"use client";

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RotateCw, RotateCcw } from 'lucide-react';

interface RotateModalProps {
  onClose: () => void;
  onApply: (angle: number) => void;
}

// Add this CSS class utility
const getRotateClass = (angle: number) => {
  const normalizedAngle = ((angle % 360) + 360) % 360;
  return `rotate-[${normalizedAngle}deg]`;
};

export function RotateModal({ onClose, onApply }: RotateModalProps) {
  const [angle, setAngle] = useState(0);

  const handleQuickRotate = (degrees: number) => {
    setAngle((prev) => {
      const newAngle = prev + degrees;
      return newAngle > 180 ? newAngle - 360 : newAngle < -180 ? newAngle + 360 : newAngle;
    });
  };

  return (
    <Modal onClose={onClose}>
      <div className="space-y-4 p-6">
        <h2 className="text-xl font-bold">Rotate Video</h2>
        <div className="space-y-6">
          <div className="flex items-center justify-center p-8">
            <div 
              className={`relative w-40 h-40 border-2 border-primary rounded-lg transition-transform duration-300 ${getRotateClass(angle)}`}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-12 bg-primary/20 rounded" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Angle: {angle}°</span>
              <Button variant="ghost" size="sm" onClick={() => setAngle(0)}>
                Reset
              </Button>
            </div>
            <Slider
              value={[angle]}
              min={-180}
              max={180}
              step={1}
              defaultValue={[0]}
              onValueChange={([value]) => setAngle(value)}
              className="my-4"
            />
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickRotate(-90)}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                -90°
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickRotate(90)}
              >
                <RotateCw className="h-4 w-4 mr-2" />
                +90°
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onApply(angle)}>
            Apply
          </Button>
        </div>
      </div>
    </Modal>
  );
} 