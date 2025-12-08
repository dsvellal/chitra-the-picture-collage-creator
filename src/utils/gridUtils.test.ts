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
        const { cols, rows } = calculateGridDimensions(0, 1000, 1000, 10);
        expect(cols).toBe(1);
        expect(rows).toBe(1);
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
});
