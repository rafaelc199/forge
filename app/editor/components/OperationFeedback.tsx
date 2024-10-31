"use client";

import React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OperationFeedbackProps {
  message: string;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
}

export function OperationFeedback({ message, type, isVisible, onClose }: OperationFeedbackProps) {
  const icons = {
    success: <Check className="w-4 h-4 text-green-500" />,
    error: <AlertCircle className="w-4 h-4 text-red-500" />,
    info: <AlertCircle className="w-4 h-4 text-blue-500" />
  };

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5 duration-300",
        !isVisible && "animate-out slide-out-to-bottom-5"
      )}
    >
      <div className="bg-card p-4 rounded-lg shadow-lg border flex items-center gap-2">
        {icons[type]}
        <span className="text-sm">{message}</span>
      </div>
    </div>
  );
} 