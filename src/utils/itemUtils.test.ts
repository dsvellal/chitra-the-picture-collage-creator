
import { describe, it, expect } from 'vitest';
import { getItemDims, isPointInItem } from './itemUtils';
import type { CollageItem } from '../store/collageStore';

describe('itemUtils', () => {
    const createItem = (updates: Partial<CollageItem>): CollageItem => ({
        id: '1', type: 'image', x: 0, y: 0, width: 100, height: 100,
        rotation: 0, scale: 1, zIndex: 0, ...updates
    } as CollageItem);

    describe('getItemDims', () => {
        it('should use originalWidth/Height if present', () => {
            const item = { originalWidth: 200, originalHeight: 300, width: 50, height: 50 } as unknown as CollageItem;
            expect(getItemDims(item)).toEqual({ w: 200, h: 300 });
        });

        it('should fallback to width/height if original is missing', () => {
            const item = { width: 50, height: 60 } as unknown as CollageItem;
            expect(getItemDims(item)).toEqual({ w: 50, h: 60 });
        });

        it('should fallback to default 100 if both are missing', () => {
            const item = {} as unknown as CollageItem;
            expect(getItemDims(item)).toEqual({ w: 100, h: 100 });
        });

        it('should handle 0 as falsy and fallback (if 0 is invalid)', () => {
            // Assuming 0 is invalid width for layout, so it should fallback
            const itemOriginal0 = { originalWidth: 0, width: 50, height: 50 } as unknown as CollageItem;
            expect(getItemDims(itemOriginal0)).toEqual({ w: 50, h: 50 }); // 0 falls back to 50
        });

        it('should handle 0 width and fallback to 100', () => {
            const item = { width: 0, height: 0 } as unknown as CollageItem;
            expect(getItemDims(item)).toEqual({ w: 100, h: 100 });
        });
    });

    describe('isPointInItem', () => {
        // Item: x=10, y=10, w=50, h=50. Range: [10, 60]
        const item = createItem({ x: 10, y: 10, width: 50, height: 50 });

        it('should return true for points strictly inside', () => {
            expect(isPointInItem(item, 11, 11)).toBe(true);
            expect(isPointInItem(item, 59, 59)).toBe(true);
            expect(isPointInItem(item, 35, 35)).toBe(true);
        });

        it('should return true for points exactly on the boundary (inclusive)', () => {
            expect(isPointInItem(item, 10, 10)).toBe(true); // Top-Left
            expect(isPointInItem(item, 60, 10)).toBe(true); // Top-Right
            expect(isPointInItem(item, 60, 60)).toBe(true); // Bottom-Right
            expect(isPointInItem(item, 10, 60)).toBe(true); // Bottom-Left
        });

        it('should return false for points just outside', () => {
            expect(isPointInItem(item, 9, 10)).toBe(false);   // Left of x
            expect(isPointInItem(item, 61, 10)).toBe(false);  // Right of x+w
            expect(isPointInItem(item, 10, 9)).toBe(false);   // Above y
            expect(isPointInItem(item, 10, 61)).toBe(false);  // Below y+h
        });

        it('should handle disjoint cases correctly', () => {
            // X matches, Y doesn't
            expect(isPointInItem(item, 35, 5)).toBe(false);
            expect(isPointInItem(item, 35, 65)).toBe(false);

            // Y matches, X doesn't
            expect(isPointInItem(item, 5, 35)).toBe(false);
            expect(isPointInItem(item, 65, 35)).toBe(false);
        });

        it('should calculate dimensions correctly when using originalWidth', () => {
            // If isPointInItem didn't use getItemDims internally, it might use item.width (50) instead of originalWidth (200)
            // This tests that it internally calls getItemDims or logic equivalent
            const itemWithOriginal = createItem({ x: 0, y: 0, width: 50, height: 50, originalWidth: 200, originalHeight: 200 });
            // Should extend to 200, not 50
            expect(isPointInItem(itemWithOriginal, 150, 150)).toBe(true);
            expect(isPointInItem(itemWithOriginal, 201, 201)).toBe(false);
        });
    });
});
