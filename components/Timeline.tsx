import React, { useState } from 'react';

interface TimelineProps {
  duration: number;
  onTrimChange: (start: number, end: number) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ duration, onTrimChange }) => {
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(duration);

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = Math.min(Number(e.target.value), end);
    setStart(newStart);
    onTrimChange(newStart, end);
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = Math.max(Number(e.target.value), start);
    setEnd(newEnd);
    onTrimChange(start, newEnd);
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="flex-1">
        <label htmlFor="start-range" className="block text-sm font-medium text-gray-700">Start</label>
        <input
          id="start-range"
          type="range"
          min="0"
          max={duration}
          value={start}
          onChange={handleStartChange}
          className="w-full"
          title={`Start: ${start}s`}
        />
      </div>
      <div className="flex-1">
        <label htmlFor="end-range" className="block text-sm font-medium text-gray-700">End</label>
        <input
          id="end-range"
          type="range"
          min="0"
          max={duration}
          value={end}
          onChange={handleEndChange}
          className="w-full"
          title={`End: ${end}s`}
        />
      </div>
      <div>
        <span>{start}s</span> - <span>{end}s</span>
      </div>
    </div>
  );
};
