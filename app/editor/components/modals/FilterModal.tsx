"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { FilterPreview } from '../FilterPreview';

interface FilterModalProps {
  onClose: () => void;
  onApply: (filter: "grayscale" | "sepia" | "brightness" | "contrast", intensity?: number) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  open: boolean;
}

export function FilterModal({ onClose, onApply, videoRef, open }: FilterModalProps) {
  const [selectedFilter, setSelectedFilter] = useState<"grayscale" | "sepia" | "brightness" | "contrast">("grayscale");
  const [intensity, setIntensity] = useState(100);

  const previewOperation = {
    type: 'filter' as const,
    filter: selectedFilter,
    intensity
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Apply Filter</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <FilterPreview
              videoRef={videoRef}
              operation={previewOperation}
            />
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={selectedFilter === 'grayscale' ? 'default' : 'outline'}
                onClick={() => setSelectedFilter('grayscale')}
              >
                Grayscale
              </Button>
              <Button
                variant={selectedFilter === 'sepia' ? 'default' : 'outline'}
                onClick={() => setSelectedFilter('sepia')}
              >
                Sepia
              </Button>
              <Button
                variant={selectedFilter === 'brightness' ? 'default' : 'outline'}
                onClick={() => setSelectedFilter('brightness')}
              >
                Brightness
              </Button>
              <Button
                variant={selectedFilter === 'contrast' ? 'default' : 'outline'}
                onClick={() => setSelectedFilter('contrast')}
              >
                Contrast
              </Button>
            </div>

            {(selectedFilter === 'brightness' || selectedFilter === 'contrast') && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Intensity: {intensity}%</label>
                <Slider
                  defaultValue={[100]}
                  value={[intensity]}
                  min={0}
                  max={200}
                  step={1}
                  onValueChange={([value]) => setIntensity(value)}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={() => onApply(selectedFilter, intensity)}>Apply</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
} 