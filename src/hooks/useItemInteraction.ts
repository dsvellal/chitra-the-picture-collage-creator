import { useCallback } from 'react';
import { useCollageStore } from '../store/collageStore';
import type { CollageItem } from '../store/collageStore';
import { isPointInItem } from '../utils/itemUtils';


const getDropCoordinates = (item: CollageItem, newAttrs: Partial<CollageItem>) => {
    return {
        x: (newAttrs.x !== undefined ? newAttrs.x : item.x) + (item.width || 0) / 2,
        y: (newAttrs.y !== undefined ? newAttrs.y : item.y) + (item.height || 0) / 2
    };
};

const handleSwapLogic = (
    item: CollageItem,
    newAttrs: Partial<CollageItem>,
    collageItems: CollageItem[],
    layoutMode: string,
    swapCollageItems: (id1: string, id2: string) => void,
    applyLayout: (mode: 'grid' | 'mosaic') => void
) => {
    const { x: dropX, y: dropY } = getDropCoordinates(item, newAttrs);
    const target = collageItems.find(i => i.id !== item.id && isPointInItem(i, dropX, dropY));

    if (target) {
        swapCollageItems(item.id, target.id);
    } else {
        if (layoutMode === 'grid') applyLayout('grid');
        else if (layoutMode === 'mosaic') applyLayout('mosaic');
    }
};

export const useItemInteraction = () => {
    const { updateCollageItem, swapCollageItems, collageItems, layoutMode, applyLayout } = useCollageStore();

    const handleItemChange = useCallback((item: CollageItem, newAttrs: Partial<CollageItem>) => {
        // Auto-Layout Swap Logic
        if (layoutMode !== 'free' && (newAttrs.x !== undefined || newAttrs.y !== undefined)) {
            handleSwapLogic(item, newAttrs, collageItems, layoutMode, swapCollageItems, applyLayout);
        } else {
            updateCollageItem(item.id, newAttrs);
        }
    }, [collageItems, layoutMode, swapCollageItems, applyLayout, updateCollageItem]);

    return { handleItemChange };
};
