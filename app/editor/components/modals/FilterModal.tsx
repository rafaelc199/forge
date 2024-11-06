"use client";

import React, { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { FilterPreview } from '../FilterPreview';
import { Switch } from "@/components/ui/switch";
import { toast } from '@/components/ui/use-toast';
import { FilterConfig, FilterType } from '@/types/video';

interface FilterModalProps {
  onClose: () => void;
  onApply: (filter: FilterConfig) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  open: boolean;
}

const FILTER_LABELS: Record<FilterType, string> = {
  brightness: "Brightness",
  contrast: "Contrast",
  saturate: "Saturation",
  grayscale: "Grayscale",
  sepia: "Sepia",
  blur: "Blur"
};

export function FilterModal({ onClose, onApply, videoRef, open }: FilterModalProps) {
  const [activeFilters, setActiveFilters] = useState<FilterConfig['filters']>({});
  const [showComparison, setShowComparison] = useState(false);

  const handleFilterChange = useCallback((filterName: FilterType, value: number | undefined) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setActiveFilters({});
  }, []);

  const playVideo = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(console.error);
    }
  }, [videoRef]);

  useEffect(() => {
    if (open) {
      playVideo();
    }
  }, [open, playVideo]);

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Apply Filters</DialogTitle>
          <DialogDescription>
            Adjust video filters and preview changes in real-time
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Original</h3>
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
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Preview</h3>
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <FilterPreview
                  videoRef={videoRef}
                  operation={{
                    type: 'filter',
                    filters: activeFilters
                  }}
                  showComparison={showComparison}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {(Object.entries(FILTER_LABELS) as [FilterType, string][]).map(([filter, label]) => (
                <div key={filter} className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">{label}</label>
                    <Switch
                      checked={activeFilters[filter] !== undefined}
                      onCheckedChange={(checked) => 
                        handleFilterChange(filter, checked ? 100 : undefined)
                      }
                    />
                  </div>
                  {activeFilters[filter] !== undefined && (
                    <Slider
                      defaultValue={[activeFilters[filter] || 100]}
                      value={[activeFilters[filter] || 100]}
                      min={0}
                      max={200}
                      step={1}
                      onValueChange={([value]) => handleFilterChange(filter, value)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={showComparison}
                onCheckedChange={setShowComparison}
              />
              <span className="text-sm">Show comparison while hovering</span>
            </div>
            {Object.keys(activeFilters).length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-xs"
              >
                Reset All
              </Button>
            )}
          </div>
          <div className="space-x-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button 
              onClick={() => {
                const cleanFilters = Object.fromEntries(
                  Object.entries(activeFilters)
                    .filter(([_, value]) => value !== undefined && value !== 0)
                );
                
                if (Object.keys(cleanFilters).length > 0) {
                  onApply({
                    filters: cleanFilters
                  });
                  toast({
                    title: "Filters Applied",
                    description: Object.entries(cleanFilters)
                      .map(([filter, value]) => `${FILTER_LABELS[filter as FilterType]}: ${value}%`)
                      .join(', ')
                  });
                } else {
                  toast({
                    title: "Error",
                    description: "Please select at least one filter"
                  });
                }
              }}
              disabled={Object.keys(activeFilters)
                .filter(key => activeFilters[key as FilterType] !== undefined && activeFilters[key as FilterType] !== 0)
                .length === 0}
            >
              Apply Filters
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 