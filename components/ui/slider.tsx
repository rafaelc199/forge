'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  defaultValue: number[];
  onValueChange: (value: number[]) => void;
  min: number;
  max: number;
  label?: string;
  value?: number[];
  step?: number;
  className?: string;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ label, value, defaultValue, onValueChange, min, max, step = 1, className, ...props }, ref) => (
  <div className="space-y-2">
    {label && (
      <div className="flex justify-between">
        <label className="text-sm font-medium">{label}</label>
        <span className="text-sm text-gray-500">{value?.[0] ?? defaultValue[0]}</span>
      </div>
    )}
    <SliderPrimitive.Root
      ref={ref}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      min={min}
      max={max}
      step={step}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className="slider-track relative w-full grow overflow-hidden">
        <SliderPrimitive.Range className="slider-range absolute h-full" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="slider-thumb block border-2 border-white ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
    </SliderPrimitive.Root>
  </div>
));

Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
