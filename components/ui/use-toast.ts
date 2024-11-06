"use client";

import { toast as sonnerToast } from 'sonner';

interface ToastProps {
  title: string;
  description?: string;
}

export const toast = ({ title, description }: ToastProps) => {
  sonnerToast(title, {
    description
  });
}; 