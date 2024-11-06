export type FilterType = 'grayscale' | 'sepia' | 'brightness' | 'contrast' | 'blur' | 'saturate';

export interface FilterConfig {
  filters: {
    [K in FilterType]?: number;
  };
  preset?: string;
}

export type VideoOperation = 
  | {
      type: 'filter';
      filters: FilterConfig['filters'];
    }
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
      cropX: number;
      cropY: number;
      cropWidth: number;
      cropHeight: number;
    };

export type VideoPreset = {
  [key: string]: VideoOperation[];
};

export interface CompressionOptions {
  quality: 'high' | 'medium' | 'low';
  maxWidth?: number;
  maxHeight?: number;
  maintainAspectRatio?: boolean;
}

export interface ProcessingOptions {
  compression?: CompressionOptions;
}
