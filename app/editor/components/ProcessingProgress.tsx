"use client";

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';

interface ProcessingProgressProps {
  progress: number;
  operation: string;
}

export function ProcessingProgress({ progress, operation }: ProcessingProgressProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card p-6 rounded-lg shadow-lg border max-w-md w-full space-y-4">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <h3 className="text-lg font-semibold">{operation}</h3>
        </div>

        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground text-center">
            {Math.round(progress)}%
          </p>
        </div>

        <p className="text-sm text-muted-foreground text-center">
          Please don&apos;t close this window while processing
        </p>
      </div>
    </div>
  );
} 