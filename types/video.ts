export type VideoOperation = {
  type: 'resize' | 'filter' | 'crop' | 'rotate' | 'trim';
  // Resize properties
  width?: number;
  height?: number;
  // Filter properties
  filter?: string;
  // Crop properties
  cropWidth?: number;
  cropHeight?: number;
  cropX?: number;
  cropY?: number;
  // Rotate properties
  angle?: number;
  // Trim properties
  startTime?: number;
  duration?: number;
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
