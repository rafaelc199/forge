export type FilterType = 'grayscale' | 'sepia' | 'brightness' | 'contrast';

export type VideoOperation = 
  | {
      type: 'trim';
      startTime: number;
      endTime: number;
    }
  | {
      type: 'resize';
      width: number;
      height: number;
    }
  | {
      type: 'rotate';
      angle: number;
    }
  | {
      type: 'crop';
      cropWidth: number;
      cropHeight: number;
      cropX: number;
      cropY: number;
    }
  | {
      type: 'filter';
      filter: FilterType;
      intensity: number;
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

export type VideoPreset = {
  [key: string]: VideoOperation[];
};
