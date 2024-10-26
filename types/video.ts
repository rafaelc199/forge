export type VideoOperation = {
  type: 'trim' | 'resize' | 'filter';
  startTime?: number;
  duration?: number;
  width?: number;
  height?: number;
  filter?: string;
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