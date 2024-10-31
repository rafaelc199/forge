"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { VideoOperation, VideoPreset } from '@/types/video';
import { Save } from 'lucide-react';

const DEFAULT_PRESETS: VideoPreset = {
  'cinematic': [
    { type: 'filter', filter: 'contrast', intensity: 120 },
    { type: 'filter', filter: 'brightness', intensity: 110 },
  ],
  'vintage': [
    { type: 'filter', filter: 'sepia', intensity: 80 },
    { type: 'filter', filter: 'contrast', intensity: 90 },
  ],
  'social-media': [
    { type: 'resize', width: 1080, height: 1080 },
    { type: 'filter', filter: 'brightness', intensity: 105 },
  ],
  'youtube': [
    { type: 'resize', width: 1920, height: 1080 },
    { type: 'filter', filter: 'contrast', intensity: 110 },
  ]
};

interface PresetManagerProps {
  onApplyPreset: (operations: VideoOperation[]) => void;
  currentOperations: VideoOperation[];
}

export function PresetManager({ onApplyPreset, currentOperations }: PresetManagerProps) {
  const handlePresetSelect = (presetName: string) => {
    const preset = DEFAULT_PRESETS[presetName];
    if (preset) {
      onApplyPreset(preset);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select onValueChange={handlePresetSelect}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select preset" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(DEFAULT_PRESETS).map(([name, operations]) => (
            <SelectItem key={name} value={name}>
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="icon"
        title="Save current operations as preset"
        onClick={() => {
          const name = prompt('Enter preset name:');
          if (name) {
            DEFAULT_PRESETS[name] = [...currentOperations];
          }
        }}
      >
        <Save className="h-4 w-4" />
      </Button>
    </div>
  );
} 