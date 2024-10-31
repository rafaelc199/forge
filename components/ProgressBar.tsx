"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  showPercentage = true,
  size = 'md',
  color = 'primary',
  className
}) => {
  const height = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6'
  }[size];

  const textSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }[size];

  const bgColor = {
    default: 'bg-gray-600',
    primary: 'bg-primary',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    danger: 'bg-red-600'
  }[color];

  return (
    <div className={cn("w-full", className)}>
      <div className={cn(
        "w-full bg-muted rounded-full overflow-hidden",
        height
      )}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300 ease-in-out",
            bgColor
          )}
          style={{ 
            width: `${Math.min(Math.max(progress, 0), 100)}%`,
            transition: 'width 0.3s ease-in-out'
          }}
        >
          {showPercentage && size === 'lg' && (
            <div className="h-full flex items-center justify-center">
              <span className={cn(
                "text-white font-medium px-2",
                textSize
              )}>
                {Math.round(progress)}%
              </span>
            </div>
          )}
        </div>
      </div>
      {showPercentage && size !== 'lg' && (
        <div className="mt-1 text-center">
          <span className={cn(
            "text-muted-foreground font-medium",
            textSize
          )}>
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  );
};
