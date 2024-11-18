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