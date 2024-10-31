"use client";

import { useState, useCallback } from 'react';
import { VideoOperation } from '@/types/video';

export function useOperationHistory(initialOperations: VideoOperation[] = []) {
  const [operations, setOperations] = useState<VideoOperation[]>(initialOperations);
  const [undoStack, setUndoStack] = useState<VideoOperation[][]>([]);
  const [redoStack, setRedoStack] = useState<VideoOperation[][]>([]);

  const addOperation = useCallback((operation: VideoOperation) => {
    setOperations(currentOperations => {
      setUndoStack(stack => [...stack, currentOperations]);
      setRedoStack([]);
      return [...currentOperations, operation];
    });
  }, []);

  const addOperations = useCallback((newOperations: VideoOperation[]) => {
    setOperations(currentOperations => {
      setUndoStack(stack => [...stack, currentOperations]);
      setRedoStack([]);
      return [...currentOperations, ...newOperations];
    });
  }, []);

  const removeOperation = useCallback((index: number) => {
    setOperations(currentOperations => {
      setUndoStack(stack => [...stack, currentOperations]);
      setRedoStack([]);
      return currentOperations.filter((_, i) => i !== index);
    });
  }, []);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;

    const previousOperations = undoStack[undoStack.length - 1];
    setUndoStack(stack => stack.slice(0, -1));
    setRedoStack(stack => [...stack, operations]);
    setOperations(previousOperations);
  }, [operations, undoStack]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;

    const nextOperations = redoStack[redoStack.length - 1];
    setRedoStack(stack => stack.slice(0, -1));
    setUndoStack(stack => [...stack, operations]);
    setOperations(nextOperations);
  }, [operations, redoStack]);

  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;

  return {
    operations,
    addOperation,
    addOperations,
    removeOperation,
    undo,
    redo,
    canUndo,
    canRedo,
    setOperations
  };
} 