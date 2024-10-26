import React, { useState } from 'react';

interface TimelineProps {
  duration: number;
  onTrimChange: (start: number, end: number) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ duration, onTrimChange }) => {
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(duration);

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = Math.min(Number(e.target.value), end - 1);
    setStart(newStart);
    onTrimChange(newStart, end);
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = Math.max(Number(e.target.value), start + 1);
    setEnd(newEnd);
    onTrimChange(start, newEnd);
  };

  return (
    <div className="timeline">
      <input
        type="range"
        min="0"
        max={duration}
        value={start}
        aria-label="Start time"
        onChange={handleStartChange}
        className="timeline-slider"
      />
      <input
        type="range"
        min="0"
        max={duration}
        value={end}
        onChange={handleEndChange}
        className="timeline-slider"
      />
      <div className="time-labels">
        <span>Start: {start}s</span>
        <span>End: {end}s</span>
      </div>
    </div>
  );
};
