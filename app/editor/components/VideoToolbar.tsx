"use client";

import React from 'react';
import { 
  Scissors, 
  Crop, 
  RotateCw, 
  Filter,
  Maximize2,
  Play,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

interface VideoToolbarProps {
  onTrim: () => void;
  onCrop: () => void;
  onResize: () => void;
  onRotate: () => void;
  onFilter: () => void;
  onProcess: () => void;
  onDownload?: () => void;
  disabled?: boolean;
  isProcessing?: boolean;
  showDownload?: boolean;
}

export function VideoToolbar({
  onTrim,
  onCrop,
  onResize,
  onRotate,
  onFilter,
  onProcess,
  onDownload,
  disabled = false,
  isProcessing = false,
  showDownload = false
}: VideoToolbarProps) {
  const tools = [
    { icon: Scissors, label: 'Trim Video', onClick: onTrim },
    { icon: Crop, label: 'Crop', onClick: onCrop },
    { icon: Maximize2, label: 'Resize', onClick: onResize },
    { icon: RotateCw, label: 'Rotate', onClick: onRotate },
    { icon: Filter, label: 'Apply Filters', onClick: onFilter },
  ];

  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-card rounded-lg border shadow-sm">
      <TooltipProvider>
        <div className="flex items-center gap-2">
          {tools.map((tool, index) => (
            <React.Fragment key={tool.label}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={tool.onClick}
                    disabled={disabled || isProcessing}
                    className="h-9 w-9"
                  >
                    <tool.icon className="h-5 w-5" />
                    <span className="sr-only">{tool.label}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tool.label}</p>
                </TooltipContent>
              </Tooltip>
              {index < tools.length - 1 && (
                <Separator orientation="vertical" className="h-6" />
              )}
            </React.Fragment>
          ))}
        </div>
      </TooltipProvider>

      <div className="flex items-center gap-2">
        <Button 
          onClick={onProcess}
          disabled={disabled || isProcessing}
          className="min-w-[120px]"
          variant="default"
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Process Video
            </>
          )}
        </Button>

        {showDownload && onDownload && (
          <Button
            onClick={onDownload}
            variant="outline"
            className="min-w-[120px]"
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        )}
      </div>
    </div>
  );
} 