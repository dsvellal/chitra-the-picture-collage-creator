
import { describe, it, expect } from 'vitest';
import { calculateGridLayout, calculateMosaicLayout } from './layoutUtils';
import type { CollageItem } from '../store/collageStore';

describe('layoutUtils', () => {
    const createItems = (count: number): CollageItem[] =>
        Array.from({ length: count }, (_, i) => ({
            id: `${i}`,
            type: 'image',
            x: 0, y: 0, width: 100, height: 100,
            originalWidth: 100, originalHeight: 100,
            rotation: 0, scale: 1, zIndex: 0
        }));

    describe('calculateGridLayout', () => {
        it('should correctly position items with padding', () => {
            const items = createItems(4);
            // 2x2 grid. Canvas 210x210. Padding 10.
            // Cell width/height approx (210 - 30) / 2 = 90.
            // Cols = 2.
            const layout = calculateGridLayout({
                canvasWidth: 210,
                canvasHeight: 210,
                items,
                padding: 10
            });

            expect(layout).toHaveLength(4);
            // First item: padding(10)
            expect(layout[0].x).toBeCloseTo(10);
            expect(layout[0].y).toBeCloseTo(10);

            // Second item: padding(10) + 90 + padding(10) = 110
            expect(layout[1].x).toBeGreaterThan(100);
            // Verify Item 1 is in Row 0 (kill Math.floor vs Math.ceil mutant)
            expect(layout[1].y).toBeCloseTo(10);

            // Verify integrity of dimensions (kill cellWidth/Height mutants)
            // Item width is 100. Cell width is 90. Scale should be 0.9.
            expect(layout[0].width).toBe(100);
            expect(layout[0].scale).toBe(0.9);
            // Effective width
            expect(layout[0].width * layout[0].scale).toBe(90);
        });

        it('should use default padding of 10 if undefined', () => {
            const items = createItems(1);
            const layout = calculateGridLayout({
                canvasWidth: 100, canvasHeight: 100, items,
                padding: undefined // Force default
            });
            expect(layout[0].x).toBe(10);
        });

        it('should center the last row (xOffset check)', () => {
            const items = createItems(3);
            // 2 cols. Row 1: 2 items. Row 2: 1 item.
            // Canvas 210. Padding 10. Cell 90.
            // Row 2 item should be centered.
            const layout = calculateGridLayout({
                canvasWidth: 210,
                canvasHeight: 210,
                items,
                padding: 10
            });

            // Item 2 (index 2) is in row 2.
            // Width of row content = 90.
            // Available width = 210 - 20 (padding) = 190.
            // Leftover = 190 - 90 = 100.
            // Offset = 50.
            // X = 10 + 0 + Offset = 60.

            // If offset was subtracted (-50), X would be -40.
            // If offset ignored (0), X would be 10.
            expect(layout[2].x).toBeGreaterThan(10);
            expect(layout[2].x).toBeLessThan(100);
            expect(layout[2].x).toBeCloseTo(60);
        });

        it('should handle zero padding', () => {
            const items = createItems(2);
            const layout = calculateGridLayout({
                canvasWidth: 200,
                canvasHeight: 100,
                items,
                padding: 0
            });
            // Cell width 100.
            expect(layout[0].x).toBe(0);
            expect(layout[1].x).toBe(100);
        });
    });

    describe('calculateMosaicLayout', () => {
        it('should stack rows correctly (yOffset check)', () => {
            const items = createItems(4); // 4 squares
            // Canvas 200 width.
            const layout = calculateMosaicLayout({
                canvasWidth: 200,
                canvasHeight: 400,
                items,
                padding: 0
            });

            // Should probably put 2 on top, 2 on bot? Or 1 per row?
            // With 100x100 aspect ratio (1).
            // Width 200. Target row height ? Default logic.

            // Just check that y increases.
            expect(layout[0].y).toBe(0);
            // If we have multiple rows, subsequent items should have y > 0.
            const lastItem = layout[layout.length - 1];
            expect(lastItem.y).toBeGreaterThan(0);

            // Check specific mutant: yOffset -= ... vs +=
            // If -=, lastItem.y would be negative or 0.
            expect(lastItem.y).toBeGreaterThan(50);
        });

        it('should respect padding in mosaic', () => {
            const items = createItems(1);
            const layout = calculateMosaicLayout({
                canvasWidth: 200,
                canvasHeight: 200,
                items,
                padding: 10
            });
            expect(layout[0].x).toBe(10);
            expect(layout[0].y).toBe(10);
        });
    });
});
