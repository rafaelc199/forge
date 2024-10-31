import { useState, useCallback } from 'react';
import { VideoOperation } from '@/types/video';

export function useHistory(initialOperations: VideoOperation[] = []) {
  const [operations, setOperations] = useState<VideoOperation[]>(initialOperations);
  const [undoStack, setUndoStack] = useState<VideoOperation[][]>([]);
  const [redoStack, setRedoStack] = useState<VideoOperation[][]>([]);

  const addOperation = useCallback((operation: VideoOperation) => {
    setUndoStack(prev => [...prev, operations]);
    setOperations(prev => [...prev, operation]);
    setRedoStack([]);
  }, [operations]);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    
    const previousState = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, operations]);
    setOperations(previousState);
    setUndoStack(prev => prev.slice(0, -1));
  }, [operations, undoStack]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    
    const nextState = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, operations]);
    setOperations(nextState);
    setRedoStack(prev => prev.slice(0, -1));
  }, [operations, redoStack]);

  return {
    operations,
    addOperation,
    undo,
    redo,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
  };
} 