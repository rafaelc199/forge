"use client";

import React from 'react';
import { VideoOperation } from '@/types/video';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OperationsListProps {
  operations: VideoOperation[];
  onRemoveOperation: (index: number) => void;
}

export function OperationsList({ operations, onRemoveOperation }: OperationsListProps) {
  const getOperationDescription = (operation: VideoOperation): string => {
    switch (operation.type) {
      case 'resize':
        return `Resize to ${operation.width}x${operation.height}`;
      case 'filter':
        return `Apply ${operation.filter} filter`;
      case 'crop':
        return `Crop ${operation.cropWidth}x${operation.cropHeight} at (${operation.cropX},${operation.cropY})`;
      case 'rotate':
        return `Rotate ${operation.angle}°`;
      case 'trim':
        return `Trim from ${formatTime(operation.startTime)} to ${formatTime(operation.endTime)}`;
      default:
        return 'Unknown operation';
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (operations.length === 0) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Applied Operations</h3>
        <p className="text-sm text-muted-foreground">No operations added yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">Applied Operations</h3>
      <div className="space-y-2">
        {operations.map((operation, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 bg-muted rounded-lg"
          >
            <span className="text-sm">{getOperationDescription(operation)}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemoveOperation(index)}
              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
              title="Remove operation"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
} 