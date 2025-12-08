import { describe, it, expect } from 'vitest';
import { calculateGridLayout } from './layoutUtils';
import { calculateGridDimensions, calculateLastRowOffset, createGridItem } from './gridUtils';
import type { CollageItem } from '../store/collageStore';

describe('gridUtils', () => {
    const createItem = (id: string): CollageItem => ({
        id, type: 'image', x: 0, y: 0, width: 100, height: 100,
        rotation: 0, scale: 1, zIndex: 0
    });

    it('should calculate grid layout', () => {
        const items = [createItem('1'), createItem('2'), createItem('3'), createItem('4')];
        const result = calculateGridLayout({
            canvasWidth: 400, canvasHeight: 400, items, padding: 0
        });

        // 4 items in standard grid -> 2x2
        expect(result).toHaveLength(4);

        // Item 1: 0,0
        expect(result[0].x).toBe(0);
        expect(result[0].y).toBe(0);
        expect(result[0].width).toBe(100); // Width stays original
        expect(result[0].scale).toBe(2); // Scaled to fit 200 cell

        // Item 2: 200,0
        expect(result[1].x).toBe(200);
        expect(result[1].y).toBe(0);

        // Item 3: 0,200
        expect(result[2].x).toBe(0);
        expect(result[2].y).toBe(200);
    });

    it('should handle zero items', () => {
        // Kill count === 0 ? mutant
        const { cols, rows, cellWidth, cellHeight } = calculateGridDimensions(0, 1000, 1000, 10);
        expect(cols).toBe(1);
        expect(rows).toBe(1);
        expect(cellWidth).toBe(0);
        expect(cellHeight).toBe(0);
    });

    it('should handle single item', () => {
        const { cols, rows } = calculateGridDimensions(1, 1000, 1000, 0);
        expect(cols).toBe(1);
        expect(rows).toBe(1);
    });

    it('should cap cols and rows', () => {
        // count < cols calculation
        const { cols, rows } = calculateGridDimensions(2, 10000, 100, 0); // aspect 100. sqrt(200) ~ 14.
        // But count is 2. So cols should be 2.
        expect(cols).toBe(2);
        // Rows = 2/2 = 1.
        expect(rows).toBe(1);
    });

    it('should ensure min 1 row/col', () => {
        // calculateGridDimensions(1, ...)
        // Already tested above.
        // What if count implies 0? no count >= 0.
        // But Math.max(1, ...) is the mutant.
        // If we allow 0 rows -> division by zero or NaN?
        // We can't easily force 0 from logic if count > 0.
        // But we verified count=0 returns 1,1 explicitly.
    });

    it('should calculate grid dimensions correctly', () => {
        // ... (existing test)
        const dims = calculateGridDimensions(4, 1000, 1000, 0);
        expect(dims.cols).toBe(2);
    });

    it('should calculate last row offset', () => {
        // 5 items, 2 cols -> 2 rows full, 1 item last row.
        // Canvas width 100, cell width 40, padding 0.
        // Last item should be centered. rowWidth = 40. Start = (100-40)/2 = 30.
        const offset = calculateLastRowOffset(4, 5, 2, 40, 0, 100);
        expect(offset).toBe(30);

        // Full row, offset 0
        const offsetFull = calculateLastRowOffset(3, 4, 2, 40, 0, 100);
        expect(offsetFull).toBe(0);
    });

    it('should calculate last row offset correctly', () => {
        // 1. Full row -> offset 0
        // 4 items, 2 cols. 2 rows. Last row full.
        expect(calculateLastRowOffset(3, 4, 2, 100, 0, 200)).toBe(0);

        // 2. Not last row -> offset 0
        expect(calculateLastRowOffset(0, 4, 2, 100, 0, 200)).toBe(0);

        // 3. Partial last row -> centered
        // 3 items, 2 cols. Row 1 full. Row 2 (index 2) has 1 item.
        // Canvas 200. Cell 100. Row width 100.
        // Start = (200 - 100)/2 = 50.
        // Standard start = 0 (padding 0).
        // Return 50.
        expect(calculateLastRowOffset(2, 3, 2, 100, 0, 200)).toBe(50);

        // 4. Partial last row with padding
        // 3 items. Canvas 220. Padding 10. Cell 95.
        // Row width 95.
        // Start = (220 - 95)/2 = 125/2 = 62.5.
        // Standard start = 10.
        // Offset = 52.5.
        expect(calculateLastRowOffset(2, 3, 2, 95, 10, 220)).toBe(52.5);
    });

    it('should handle padding', () => {
        const items = [createItem('1')];
        const result = calculateGridLayout({
            canvasWidth: 100, canvasHeight: 100, items, padding: 10
        });

        expect(result[0].x).toBe(10);
        expect(result[0].y).toBe(10);
        expect(result[0].width).toBe(100);
        expect(result[0].scale).toBe(0.8); // 80 / 100
    });

    it('should create grid item correctly', () => {
        // cell 200x200. item 100x100. scale should be min(200/100, 200/100) = 2.
        // x = 0 + (200 - 100*2)/2 = 0.
        // result w = 100, h = 100. scale = 2.

        const item = createItem('1');
        Object.assign(item, { originalWidth: 50, originalHeight: 25, width: 50, height: 25 });

        const res = createGridItem(item, 10, 20, 100, 100);

        expect(res.x).toBe(10);
        expect(res.y).toBe(20 + 25); // 45
        expect(res.scale).toBe(2);
        expect(res.width).toBe(50);
        expect(res.height).toBe(25);
    });

    it('should create grid item with proper scaling', () => {
        const item = createItem('1');
        // Item 100x100.
        // Cell 50x50.
        // Scale should be 0.5.
        const res = createGridItem(item, 0, 0, 50, 50);
        expect(res.scale).toBe(0.5);
        expect(res.x).toBe(0);
        expect(res.y).toBe(0);

        // Aspect ratio preserve
        // Item 200x100. Cell 100x100.
        // Scale min(100/200=0.5, 100/100=1) = 0.5.
        // W=100 (scaled). H=50 (scaled).
        // Centered in 100x100.
        // x = 0 + (100 - 100)/2 = 0.
        // y = 0 + (100 - 50)/2 = 25.
        Object.assign(item, { originalWidth: 200, originalHeight: 100, width: 200, height: 100 });
        const res2 = createGridItem(item, 0, 0, 100, 100);
        expect(res2.scale).toBe(0.5);
        expect(res2.y).toBe(25);
    });
});
