"use client";

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProcessingProgressProps {
  progress: number;
  isProcessing: boolean;
  currentOperation?: string;
}

export function ProcessingProgress({ progress, isProcessing, currentOperation }: ProcessingProgressProps) {
  if (!isProcessing) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center",
        "animate-in fade-in-0 duration-300",
        !isProcessing && "animate-out fade-out-0"
      )}
    >
      <div 
        className={cn(
          "bg-card p-6 rounded-lg shadow-lg border max-w-md w-full space-y-4",
          "animate-in zoom-in-90 duration-300",
          !isProcessing && "animate-out zoom-out-90"
        )}
      >
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <h3 className="text-lg font-semibold">Processing Video</h3>
        </div>

        <div className="space-y-2">
          <div 
            className={cn(
              "flex justify-between text-sm text-muted-foreground",
              "animate-in slide-in-from-bottom-2 duration-300"
            )}
          >
            <span>{currentOperation || 'Applying changes...'}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <p className="text-sm text-muted-foreground text-center">
          Please don&apos;t close this window while processing
        </p>
      </div>
    </div>
  );
} 