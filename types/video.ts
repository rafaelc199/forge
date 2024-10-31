export type VideoOperation = 
  | { type: 'trim'; startTime: number; endTime: number }
  | { type: 'resize'; width: number; height: number }
  | { type: 'rotate'; angle: number }
  | { type: 'filter'; filter: 'grayscale' | 'sepia' | 'brightness' | 'contrast'; intensity?: number }
  | { type: 'crop'; cropX: number; cropY: number; cropWidth: number; cropHeight: number };

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
