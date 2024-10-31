"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

type FilterType = "grayscale" | "sepia" | "brightness" | "contrast";

interface FilterModalProps {
  onClose: () => void;
  onApply: (filter: FilterType, intensity?: number) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
}

const FILTERS = [
  { 
    id: 'grayscale' as FilterType, 
    name: 'Grayscale', 
    description: 'Convert to black and white',
    preview: 'filter: grayscale(100%)'
  },
  { 
    id: 'sepia' as FilterType, 
    name: 'Sepia', 
    description: 'Add warm brownish tone',
    preview: 'filter: sepia(100%)'
  },
  { 
    id: 'brightness' as FilterType, 
    name: 'Brighten', 
    description: 'Adjust brightness',
    preview: 'filter: brightness(120%)',
    hasIntensity: true
  },
  { 
    id: 'contrast' as FilterType, 
    name: 'Contrast', 
    description: 'Adjust contrast',
    preview: 'filter: contrast(120%)',
    hasIntensity: true
  }
];

export function FilterModal({ onClose, onApply, videoRef }: FilterModalProps) {
  const [selectedFilter, setSelectedFilter] = useState<FilterType | null>(null);
  const [intensity, setIntensity] = useState(100);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!videoRef.current || !previewCanvasRef.current || !selectedFilter) return;

    const video = videoRef.current;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // Apply selected filter preview
    const filter = FILTERS.find(f => f.id === selectedFilter);
    if (filter) {
      canvas.style.filter = filter.preview.split(':')[1].trim();
    }
  }, [selectedFilter, videoRef]);

  return (
    <Modal onClose={onClose}>
      <div className="space-y-4 p-6">
        <div>
          <h2 className="text-xl font-bold mb-2">Apply Filter</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Choose a filter to enhance your video.
          </p>
        </div>

        {selectedFilter ? (
          <div className="space-y-4">
            <canvas
              ref={previewCanvasRef}
              className="w-full h-auto rounded-lg border"
            />
            
            {FILTERS.find(f => f.id === selectedFilter)?.hasIntensity && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Intensity: {intensity}%
                </label>
                <Slider
                  value={[intensity]}
                  min={0}
                  max={200}
                  step={1}
                  defaultValue={[100]}
                  onValueChange={([value]) => setIntensity(value)}
                />
              </div>
            )}

            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setSelectedFilter(null)}
              >
                Back to Filters
              </Button>
              <Button 
                onClick={() => onApply(selectedFilter, intensity)}
              >
                Apply Filter
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {FILTERS.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className="p-4 border rounded-lg hover:bg-accent text-left transition-colors"
              >
                <div className="space-y-2">
                  <div 
                    className={`w-full aspect-video bg-muted rounded-md overflow-hidden ${
                      filter.id === 'grayscale' ? 'grayscale' : 
                      filter.id === 'sepia' ? 'sepia' : 
                      filter.id === 'brightness' ? 'brightness-120' :
                      filter.id === 'contrast' ? 'contrast-120' : ''
                    }`}
                  />
                  <h3 className="font-medium">{filter.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {filter.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
} 