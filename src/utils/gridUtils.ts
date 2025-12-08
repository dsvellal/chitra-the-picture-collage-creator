import type { CollageItem } from '../store/collageStore';

interface GridDimensions {
    cols: number;
    rows: number;
    cellWidth: number;
    cellHeight: number;
}

export const calculateGridDimensions = (
    count: number,
    canvasWidth: number,
    canvasHeight: number,
    padding: number
): GridDimensions => {
    if (count === 0) return { cols: 1, rows: 1, cellWidth: 0, cellHeight: 0 };

    const aspect = canvasWidth / canvasHeight;
    let cols = Math.ceil(Math.sqrt(count * aspect));
    cols = Math.max(1, Math.min(count, cols));

    let rows = Math.ceil(count / cols);
    rows = Math.max(1, rows);

    const cellWidth = (canvasWidth - padding * (cols + 1)) / cols;
    const cellHeight = (canvasHeight - padding * (rows + 1)) / rows;

    return { cols, rows, cellWidth, cellHeight };
};

export const calculateLastRowOffset = (
    index: number,
    count: number,
    cols: number,
    cellWidth: number,
    padding: number,
    canvasWidth: number
): number => {
    const row = Math.floor(index / cols);
    const rows = Math.ceil(count / cols);
    const isLastRow = row === rows - 1;
    const itemsInLastRow = count % cols || cols;

    if (isLastRow && itemsInLastRow < cols) {
        const rowWidth = itemsInLastRow * cellWidth + (itemsInLastRow - 1) * padding;
        const standardStart = padding;
        const centeredStart = (canvasWidth - rowWidth) / 2;
        return centeredStart - standardStart;
    }
    return 0;
};

import { getItemDims } from './itemUtils';

export const createGridItem = (
    item: CollageItem,
    x: number,
    y: number,
    cellWidth: number,
    cellHeight: number
): CollageItem => {
    const { w: iW, h: iH } = getItemDims(item);
    const scale = Math.min(cellWidth / iW, cellHeight / iH);

    return {
        ...item,
        x: x + (cellWidth - iW * scale) / 2,
        y: y + (cellHeight - iH * scale) / 2,
        width: iW,
        height: iH,
        scale: scale,
        rotation: 0,
    };
};
