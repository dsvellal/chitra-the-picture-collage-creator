import type { CollageItem } from '../types';
import { calculateGridDimensions, calculateLastRowOffset, createGridItem } from './gridUtils';
import { calculateTargetRowHeight, findRowEndIndex, processRowItems, finalizeMosaicLayout } from './mosaicUtils';
import { getItemDims } from './itemUtils';

interface LayoutOptions {
    canvasWidth: number;
    canvasHeight: number;
    items: CollageItem[];
    padding?: number;
}

export const calculateGridLayout = ({
    canvasWidth,
    canvasHeight,
    items,
    padding = 10,
}: LayoutOptions): CollageItem[] => {
    const { cols, cellWidth, cellHeight } = calculateGridDimensions(items.length, canvasWidth, canvasHeight, padding);

    return items.map((item, index) => {
        const xOffset = calculateLastRowOffset(index, items.length, cols, cellWidth, padding, canvasWidth);
        const col = index % cols;
        const row = Math.floor(index / cols);

        const x = padding + col * (cellWidth + padding) + xOffset;
        const y = padding + row * (cellHeight + padding);

        return createGridItem(item, x, y, cellWidth, cellHeight);
    });
};

export const calculateMosaicLayout = ({
    canvasWidth,
    canvasHeight,
    items,
    padding = 10,
}: LayoutOptions): CollageItem[] => {
    const targetRowHeight = calculateTargetRowHeight(items.length, canvasHeight);
    const workingItems = items.map(i => ({ ...i }));
    const resultItems: CollageItem[] = [];

    let rowStartIdx = 0;
    let yOffset = padding;

    while (rowStartIdx < workingItems.length) {
        const rowEndIdx = findRowEndIndex(workingItems, rowStartIdx, targetRowHeight, canvasWidth - padding * 2);

        // Calculate exact row height
        let rowAspectRatio = 0;
        for (let i = rowStartIdx; i < rowEndIdx; i++) {
            const { w, h } = getItemDims(workingItems[i]);
            rowAspectRatio += w / h;
        }

        const totalPaddingInRow = (rowEndIdx - rowStartIdx + 1) * padding;
        const availableWidth = canvasWidth - totalPaddingInRow;
        const rowHeight = availableWidth / rowAspectRatio;

        const rowItems = processRowItems(workingItems, rowStartIdx, rowEndIdx, rowHeight, yOffset, padding);
        resultItems.push(...rowItems);

        yOffset += rowHeight + padding;
        rowStartIdx = rowEndIdx;
    }

    const contentHeight = (yOffset - padding) - padding;
    return finalizeMosaicLayout(resultItems, contentHeight, canvasHeight, canvasWidth, padding);
};

export const PRESETS = [
    { name: 'Square (IG)', width: 1080, height: 1080 },
    { name: 'Portrait (Story)', width: 1080, height: 1920 },
    { name: 'Landscape (FHD)', width: 1920, height: 1080 },
    { name: 'A4 (Print)', width: 2480, height: 3508 }, // @ 300ppi approx
];
