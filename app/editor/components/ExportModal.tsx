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

interface ExportOptions {
  format: 'mp4' | 'webm' | 'mov' | 'gif';
  quality: 'lossless' | 'high' | 'medium' | 'low';
  codec: 'h264' | 'h265' | 'vp9';
  fps: number;
  audioCodec: 'aac' | 'mp3' | 'opus';
  audioQuality: number;
}

interface ExportModalProps {
  onClose: () => void;
  onExport: (options: ExportOptions) => void;
}

export function ExportModal({ onClose, onExport }: ExportModalProps) {
  const [options, setOptions] = useState<ExportOptions>({
    format: 'mp4',
    quality: 'high',
    codec: 'h264',
    fps: 30,
    audioCodec: 'aac',
    audioQuality: 192
  });

  return (
    <Modal onClose={onClose}>
      <div className="space-y-4 p-6">
        <h2 className="text-xl font-bold">Export Settings</h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Quality</label>
            <Select
              value={options.quality}
              onValueChange={(value: 'lossless' | 'high' | 'medium' | 'low') => 
                setOptions(prev => ({ ...prev, quality: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lossless">Lossless</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Format</label>
            <Select
              value={options.format}
              onValueChange={(value: 'mp4' | 'webm' | 'mov' | 'gif') => 
                setOptions(prev => ({ ...prev, format: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mp4">MP4</SelectItem>
                <SelectItem value="webm">WebM</SelectItem>
                <SelectItem value="mov">MOV</SelectItem>
                <SelectItem value="gif">GIF</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">FPS</label>
            <Select
              value={options.fps.toString()}
              onValueChange={(value) => 
                setOptions(prev => ({ ...prev, fps: parseInt(value) }))
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

          <div className="space-y-2">
            <label className="text-sm font-medium">Audio Codec</label>
            <Select
              value={options.audioCodec}
              onValueChange={(value: 'aac' | 'mp3' | 'opus') => 
                setOptions(prev => ({ ...prev, audioCodec: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select audio codec" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aac">AAC</SelectItem>
                <SelectItem value="mp3">MP3</SelectItem>
                <SelectItem value="opus">Opus</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Audio Quality</label>
            <Select
              value={options.audioQuality.toString()}
              onValueChange={(value) => 
                setOptions(prev => ({ ...prev, audioQuality: parseInt(value) }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select audio quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="128">128 kbps</SelectItem>
                <SelectItem value="192">192 kbps</SelectItem>
                <SelectItem value="256">256 kbps</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onExport(options)}>
            Export
          </Button>
        </div>
      </div>
    </Modal>
  );
} 