import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface FilterSliderProps {
    label: string;
    icon: LucideIcon;
    value: number;
    description?: string;
    min: number;
    max: number;
    step: number;
    onChange: (val: number) => void;
}

export const FilterSlider: React.FC<FilterSliderProps> = ({
    label, icon: Icon, value, description, min, max, step, onChange
}) => {
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1"><Icon size={10} /> {label}</span>
                <span>{description || value}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-1 bg-slate-700 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:rounded-full cursor-pointer"
            />
        </div>
    );
};
