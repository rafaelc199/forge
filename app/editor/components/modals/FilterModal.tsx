"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { FilterType } from '@/types/video';

interface FilterModalProps {
  onClose: () => void;
  onApply: (filter: string, intensity: number) => void;
}

export function FilterModal({ onClose, onApply }: FilterModalProps) {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('brightness');
  const [intensity, setIntensity] = useState(100);

  const filters: { type: FilterType; label: string }[] = [
    { type: 'brightness', label: 'Brightness' },
    { type: 'contrast', label: 'Contrast' },
    { type: 'saturate', label: 'Saturation' },
    { type: 'grayscale', label: 'Grayscale' },
    { type: 'sepia', label: 'Sepia' },
    { type: 'blur', label: 'Blur' },
  ];

  const handleApply = () => {
    onApply(selectedFilter, intensity);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply Filter</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {filters.map((filter) => (
              <Button
                key={filter.type}
                variant={selectedFilter === filter.type ? "default" : "outline"}
                onClick={() => setSelectedFilter(filter.type)}
                className="w-full"
              >
                {filter.label}
              </Button>
            ))}
          </div>
          <div className="space-y-2">
            <Label>Intensity</Label>
            <Slider
              defaultValue={[intensity]}
              value={[intensity]}
              onValueChange={(value) => setIntensity(value[0])}
              min={0}
              max={200}
              step={1}
              className="w-full"
            />
            <div className="text-right text-sm text-muted-foreground">
              {intensity}%
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleApply}>
              Apply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 