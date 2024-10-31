"use client";

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExportModalProps {
  onClose: () => void;
  onExport: (settings: ExportSettings) => void;
}

interface ExportSettings {
  quality: '720p' | '1080p' | '4k';
  format: 'mp4' | 'webm' | 'gif';
  fps: number;
}

export function ExportModal({ onClose, onExport }: ExportModalProps) {
  const [settings, setSettings] = useState<ExportSettings>({
    quality: '1080p',
    format: 'mp4',
    fps: 30
  });

  return (
    <Modal onClose={onClose}>
      <div className="space-y-4 p-6">
        <h2 className="text-xl font-bold">Export Settings</h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Quality</label>
            <Select
              value={settings.quality}
              onValueChange={(value: '720p' | '1080p' | '4k') => 
                setSettings(prev => ({ ...prev, quality: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="720p">720p</SelectItem>
                <SelectItem value="1080p">1080p</SelectItem>
                <SelectItem value="4k">4K</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Format</label>
            <Select
              value={settings.format}
              onValueChange={(value: 'mp4' | 'webm' | 'gif') => 
                setSettings(prev => ({ ...prev, format: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mp4">MP4</SelectItem>
                <SelectItem value="webm">WebM</SelectItem>
                <SelectItem value="gif">GIF</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">FPS</label>
            <Select
              value={settings.fps.toString()}
              onValueChange={(value) => 
                setSettings(prev => ({ ...prev, fps: parseInt(value) }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select FPS" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24">24 FPS</SelectItem>
                <SelectItem value="30">30 FPS</SelectItem>
                <SelectItem value="60">60 FPS</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onExport(settings)}>
            Export
          </Button>
        </div>
      </div>
    </Modal>
  );
} 