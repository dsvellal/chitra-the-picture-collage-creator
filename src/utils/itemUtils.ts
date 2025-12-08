import type { CollageItem } from '../types';


const getItemWidth = (item: Pick<CollageItem, 'originalWidth' | 'width'>) => item.originalWidth || item.width || 100;
const getItemHeight = (item: Pick<CollageItem, 'originalHeight' | 'height'>) => item.originalHeight || item.height || 100;

export const getItemDims = (item: Pick<CollageItem, 'originalWidth' | 'width' | 'originalHeight' | 'height'>) => {
    return {
        w: getItemWidth(item),
        h: getItemHeight(item)
    };
};

export const isPointInItem = (item: CollageItem, x: number, y: number) => {
    const { w, h } = getItemDims(item);
    return x >= item.x && x <= item.x + w && y >= item.y && y <= item.y + h;
};
