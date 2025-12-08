import type { CollageItem } from '../store/collageStore';
import { getItemDims } from './itemUtils';

export const calculateTargetRowHeight = (count: number, canvasHeight: number) => {
    return canvasHeight / Math.ceil(Math.sqrt(count));
};

export const calculateRowAspectRatio = (items: CollageItem[], start: number, end: number) => {
    let ratio = 0;
    for (let i = start; i < end; i++) {
        const { w, h } = getItemDims(items[i]);
        ratio += w / h;
    }
    return ratio;
};

export const findRowEndIndex = (
    items: CollageItem[],
    startIdx: number,
    targetRowHeight: number,
    maxRowWidth: number
) => {
    let endIdx = startIdx;
    let currentRatio = 0;

    while (endIdx < items.length) {
        const { w, h } = getItemDims(items[endIdx]);
        currentRatio += w / h;

        // Always include at least one item
        if (endIdx > startIdx && currentRatio * targetRowHeight > maxRowWidth) {
            break;
        }
        endIdx++;
    }
    return endIdx;
};

export const processRowItems = (
    items: CollageItem[],
    start: number,
    end: number,
    rowHeight: number,
    yOffset: number,
    padding: number
) => {
    const result: CollageItem[] = [];
    let xOffset = padding;

    for (let i = start; i < end; i++) {
        const item = items[i];
        const { w, h } = getItemDims(item);
        const aspect = w / h;
        const finalW = rowHeight * aspect;

        result.push({
            ...item,
            x: xOffset,
            y: yOffset,
            width: finalW,
            height: rowHeight,
            scale: 1,
            rotation: 0
        });

        xOffset += finalW + padding;
    }
    return result;
};

export const finalizeMosaicLayout = (items: CollageItem[], contentHeight: number, canvasHeight: number, canvasWidth: number, padding: number) => {
    // If content is taller than canvas, scale everything down to fit
    if (contentHeight > canvasHeight - padding * 2) {
        const scale = (canvasHeight - padding * 2) / contentHeight;
        const newContentWidth = (canvasWidth - padding * 2) * scale;
        const xOffset = (canvasWidth - newContentWidth) / 2;
        const yOffset = padding;

        return items.map(item => ({
            ...item,
            x: (item.x - padding) * scale + xOffset, // re-map x from 0-based to centered
            y: (item.y - padding) * scale + yOffset, // re-map y
            width: item.width * scale,
            height: item.height * scale
        }));
    }

    // Otherwise just center vertically
    const verticalShift = (canvasHeight - contentHeight) / 2 - padding;
    if (verticalShift > 0) {
        return items.map(item => ({
            ...item,
            y: item.y + verticalShift
        }));
    }
    return items;
};
