import React from 'react';
import type { CollageItem } from '../../store/collageStore';
import { ImageFilters } from './ImageFilters';
import { ImageStyle } from './ImageStyle';
import { ImageTransform } from './ImageTransform';

interface ImagePropertiesProps {
    item: CollageItem;
    onUpdate: (id: string, updates: Partial<CollageItem>) => void;
}

export const ImageProperties: React.FC<ImagePropertiesProps> = ({ item, onUpdate }) => {
    return (
        <>
            <ImageFilters item={item} onUpdate={onUpdate} />
            <ImageStyle item={item} onUpdate={onUpdate} />
            <ImageTransform item={item} onUpdate={onUpdate} />
        </>
    );
};
