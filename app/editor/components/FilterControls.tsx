"use client";

import React from 'react';
import { FilterSettings } from '../types';

interface FilterControlsProps {
  filters: FilterSettings;
  onFilterChange: (name: keyof FilterSettings, value: number) => void;
  onReset: () => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  onFilterChange,
  onReset
}) => {
  const filterControls = [
    { name: 'brightness', label: 'Brightness', min: 0, max: 200, step: 1 },
    { name: 'contrast', label: 'Contrast', min: 0, max: 200, step: 1 },
    { name: 'saturation', label: 'Saturation', min: 0, max: 200, step: 1 },
    { name: 'hueRotate', label: 'Hue Rotate', min: 0, max: 360, step: 1 },
    { name: 'blur', label: 'Blur', min: 0, max: 10, step: 0.1 },
    { name: 'sepia', label: 'Sepia', min: 0, max: 100, step: 1 },
  ];

  return (
    <div className="bg-gray-800 p-4 rounded-lg space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Video Filters</h3>
        <button
          onClick={onReset}
          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
        >
          Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filterControls.map((control) => (
          <div key={control.name} className="space-y-2">
            <div className="flex justify-between">
              <label className="text-gray-300 text-sm">{control.label}</label>
              <span className="text-gray-300 text-sm">{filters[control.name]}</span>
            </div>
            <input
              type="range"
              min={control.min}
              max={control.max}
              step={control.step}
              value={filters[control.name]}
              onChange={(e) => onFilterChange(control.name, Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterControls; 