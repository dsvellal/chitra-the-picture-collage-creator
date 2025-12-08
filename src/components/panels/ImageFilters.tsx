import React from 'react';
import { Sun, Contrast } from 'lucide-react';
import { FilterSlider } from '../common/FilterSlider';
import type { CollageItem } from '../../store/collageStore';

interface ImageFiltersProps {
    item: CollageItem;
    onUpdate: (id: string, updates: Partial<CollageItem>) => void;
}

export const ImageFilters: React.FC<ImageFiltersProps> = ({ item, onUpdate }) => {
    const filter = item.filter || { brightness: 0, contrast: 0 };
    const brightness = filter.brightness ?? 0;
    const contrast = filter.contrast ?? 0;

    return (
        <section className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Filters</h3>
            <div className="space-y-6">
                <FilterSlider
                    label="Brightness"
                    icon={Sun}
                    value={brightness}
                    description={brightness.toFixed(2)}
                    min={-1}
                    max={1}
                    step={0.05}
                    onChange={(val) => onUpdate(item.id, { filter: { ...filter, brightness: val } })}
                />
                <FilterSlider
                    label="Contrast"
                    icon={Contrast}
                    value={contrast}
                    description={Math.round(contrast).toString()}
                    min={-100}
                    max={100}
                    step={5}
                    onChange={(val) => onUpdate(item.id, { filter: { ...filter, contrast: val } })}
                />
            </div>
        </section>
    );
};
