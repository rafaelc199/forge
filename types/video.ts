export type FilterType = 'grayscale' | 'sepia' | 'brightness' | 'contrast' | 'blur' | 'saturate';

export interface FilterConfig {
  filters: {
    [K in FilterType]?: number;
  };
  preset?: string;
}

export type VideoOperation = 
  | { type: 'trim'; start: number; end: number }
  | { type: 'crop'; x: number; y: number; width: number; height: number }
  | { type: 'resize'; width: number; height: number }
  | { type: 'rotate'; angle: number }
  | { type: 'audio'; volume: number }
  | { type: 'filter'; filter: string; intensity: number }
  | { type: 'compress'; quality: number };

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

// Adicionar tipos para segmentos
export interface Segment {
  start: number;
  end: number;
  type: 'content' | 'commercial' | 'silence';
  confidence: number;
  metadata?: {
    thumbnail?: string;
    volume?: number;
    motion?: number;
  };
}

// Adicionar tipos para opções de exportação
export interface ExportOptions {
  format: 'mp4' | 'webm' | 'mov' | 'gif';
  quality: 'lossless' | 'high' | 'medium' | 'low';
  codec: 'h264' | 'h265' | 'vp9';
  fps: number;
  audioCodec: 'aac' | 'mp3' | 'opus';
  audioQuality: number;
  options?: {
    maintainAspectRatio?: boolean;
    maxWidth?: number;
    maxHeight?: number;
    videoBitrate?: number;
    preset?: 'ultrafast' | 'superfast' | 'veryfast' | 'faster' | 'fast' | 'medium' | 'slow' | 'slower' | 'veryslow';
  };
}
