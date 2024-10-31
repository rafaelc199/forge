"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { CompressionOptions } from '@/types/video';

interface CompressionSettingsProps {
  options: CompressionOptions;
  onChange: (options: CompressionOptions) => void;
}

export function CompressionSettings({ options, onChange }: CompressionSettingsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Quality</Label>
        <RadioGroup
          value={options.quality}
          onValueChange={(value: 'high' | 'medium' | 'low') => 
            onChange({ ...options, quality: value })}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="high" id="high" />
            <Label htmlFor="high">High</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="medium" id="medium" />
            <Label htmlFor="medium">Medium</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="low" id="low" />
            <Label htmlFor="low">Low</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Max Resolution</Label>
          <Switch
            checked={Boolean(options.maxWidth || options.maxHeight)}
            onCheckedChange={(checked) => 
              onChange({
                ...options,
                maxWidth: checked ? 1280 : undefined,
                maxHeight: checked ? 720 : undefined
              })}
          />
        </div>
        {(options.maxWidth || options.maxHeight) && (
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label>Width</Label>
              <Input
                type="number"
                value={options.maxWidth || ''}
                onChange={(e) => 
                  onChange({
                    ...options,
                    maxWidth: e.target.value ? Number(e.target.value) : undefined
                  })}
                placeholder="Max width"
              />
            </div>
            <div className="space-y-1">
              <Label>Height</Label>
              <Input
                type="number"
                value={options.maxHeight || ''}
                onChange={(e) => 
                  onChange({
                    ...options,
                    maxHeight: e.target.value ? Number(e.target.value) : undefined
                  })}
                placeholder="Max height"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={options.maintainAspectRatio ?? true}
          onCheckedChange={(checked) => 
            onChange({ ...options, maintainAspectRatio: checked })}
        />
        <Label>Maintain aspect ratio</Label>
      </div>
    </div>
  );
} 