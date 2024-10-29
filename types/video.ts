export type VideoOperation = {
  type: 'trim' | 'resize' | 'filter' | 'brightness' | 'contrast' | 'textOverlay' | 'speed' | 'crop' | 'rotate';
  startTime?: number;
  duration?: number;
  width?: number;
  height?: number;
  filter?: string;
  brightness?: number;
  contrast?: number;
  text?: string;
  position?: { x: number; y: number };
  speed?: number;
  cropWidth?: number;
  cropHeight?: number;
  cropX?: number;
  cropY?: number;
  angle?: number;
};

export type VideoProcessingJob = {
  videoId: string;
  operations: VideoOperation[];
};

export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type Job = {
  id: string;
  videoId: string;
  status: ProcessingStatus;
  operations: VideoOperation[];
  createdAt: Date;
  updatedAt: Date;
  error?: string;
};
