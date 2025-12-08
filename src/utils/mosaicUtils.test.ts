import { describe, it, expect } from 'vitest';
import { calculateRowAspectRatio, processRowItems, finalizeMosaicLayout } from './mosaicUtils';
import { calculateMosaicLayout } from './layoutUtils';
import type { CollageItem } from '../store/collageStore';

describe('mosaicUtils', () => {
    const createItem = (id: string, aspect = 1): CollageItem => ({
        id, type: 'image', x: 0, y: 0, width: 100, height: 100 / aspect,
        rotation: 0, scale: 1, zIndex: 0,
        originalWidth: 100, originalHeight: 100 / aspect
    });

    it('should calculate layout for empty items', () => {
        const result = calculateMosaicLayout({
            canvasWidth: 800, canvasHeight: 600, items: [], padding: 0
        });
        expect(result).toHaveLength(0);
    });

    it('should calculate row aspect ratio correctly', () => {
        const items = [
            { id: '1', width: 100, height: 100 } as CollageItem,
            { id: '2', width: 200, height: 100 } as CollageItem
        ];
        // 100/100 + 200/100 = 1 + 2 = 3
        expect(calculateRowAspectRatio(items, 0, 2)).toBe(3);
    });

    it('should process row items correctly', () => {
        const items = [
            { id: '1', width: 100, height: 100 } as CollageItem,
            { id: '2', width: 200, height: 100 } as CollageItem
        ];
        // Calculate layout for 300px width. Ratio 3. Height SHOULD be 100.
        // processRowItems(items, start, end, height, yOffset, padding)
        const result = processRowItems(items, 0, 2, 100, 0, 0);

        expect(result).toHaveLength(2);
        expect(result[0].width).toBe(100);
        expect(result[0].height).toBe(100);
        expect(result[1].width).toBe(200);
        expect(result[1].height).toBe(100);
        expect(result[1].x).toBe(100);
    });

    it('should finalize layout and center vertically', () => {
        const items = [{ id: '1', x: 0, y: 0, width: 100, height: 100 }] as unknown as CollageItem[];
        // Canvas 200 height, Content 100 height. Padding 0. Shift = (200-100)/2 = 50.
        const result = finalizeMosaicLayout(items, 100, 200, 200, 0);
        expect(result[0].y).toBe(50);
    });

    it('should finalize layout and scale if too tall', () => {
        const items = [{ id: '1', x: 0, y: 0, width: 100, height: 300 }] as unknown as CollageItem[];
        // Canvas 200, Content 300. Padding 0. Scale = 200/300 = 0.666
        const result = finalizeMosaicLayout(items, 300, 200, 200, 0);
        expect(result[0].height).toBeCloseTo(200);
        expect(result[0].x).toBeCloseTo(33.33); // Centered X
    });

    it('should return items as is if no vertical shift needed', () => {
        const items = [{ id: '1', x: 0, y: 0, width: 100, height: 200 }] as unknown as CollageItem[];
        // Canvas 200, Content 200. Padding 0. Shift 0.
        const result = finalizeMosaicLayout(items, 200, 200, 200, 0);
        expect(result[0].y).toBe(0);
        expect(result).toBe(items); // Should return same ref or equal
    });
    it('should handle many items', () => {
        const items = Array.from({ length: 10 }, (_, i) => createItem(`${i}`));
        const result = calculateMosaicLayout({
            canvasWidth: 800, canvasHeight: 600, items, padding: 10
        });
        expect(result).toHaveLength(10);
        // Check that they are within bounds
        result.forEach(item => {
            expect(item.x).toBeGreaterThanOrEqual(0);
            expect(item.y).toBeGreaterThanOrEqual(0);
            expect(item.x + item.width).toBeLessThanOrEqual(800.1);
            // Note: floating point tolerance might be needed, but .1 buffer is safe for strict check
        });
    });
});
