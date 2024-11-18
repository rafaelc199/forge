interface FrameExtractionProgressProps {
  progress: number;
}

export function FrameExtractionProgress({ progress }: FrameExtractionProgressProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
      <div className="flex flex-col items-center gap-2">
        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-sm text-white">
          Generating frames... {Math.round(progress)}%
        </div>
      </div>
    </div>
  );
} 