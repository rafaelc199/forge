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