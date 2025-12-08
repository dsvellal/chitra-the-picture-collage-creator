
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { processDroppedImages } from './imageProcessing';

// Mock layout Utils
vi.mock('./layoutUtils', () => ({
    calculateGridLayout: vi.fn(({ items }) => items.map((i: unknown) => ({ ...(i as object), layout: 'grid' })))
}));

// Mock UUID
vi.mock('uuid', () => ({ v4: () => 'test-uuid' }));

describe('processDroppedImages', () => {
    const mockAddItems = vi.fn();
    const mockAddItem = vi.fn();
    const mockStateItems: import('../store/collageStore').CollageItem[] = [];
    const mockSettings = { width: 1000, height: 1000, padding: 0, borderRadius: 0, backgroundColor: '#fff' };

    let originalImage: typeof Image;
    // Control variable for mock image dimensions
    let nextImageWidth = 200;
    let nextImageHeight = 200;

    beforeEach(() => {
        vi.clearAllMocks();
        originalImage = globalThis.Image;
        nextImageWidth = 200;
        nextImageHeight = 200;

        // Mock Image loading
        globalThis.Image = class {
            onload: () => void = () => { };
            src: string = '';
            width: number;
            height: number;
            constructor() {
                this.width = nextImageWidth;
                this.height = nextImageHeight;
                console.log('MockImage created. Width:', this.width);
                setTimeout(() => this.onload(), 10);
            }
        } as unknown as typeof Image;
    });

    afterEach(() => {
        globalThis.Image = originalImage;
    });

    it('should process single image drop', async () => {
        await processDroppedImages(
            ['img1.jpg'],
            mockStateItems,
            mockSettings,
            { x: 500, y: 500 },
            mockAddItems,
            mockAddItem
        );

        expect(mockAddItem).toHaveBeenCalled();
        const callArgs = mockAddItem.mock.calls[0][0];
        expect(callArgs.id).toBe('test-uuid');
        // MaxDim 300. Img 200. Scale 1.
        expect(callArgs.scale).toBe(1);
        expect(callArgs.x).toBe(400); // 500 - 200/2
        expect(callArgs.y).toBe(400); // 500 - 200/2
    });

    it('should scale down large images', async () => {
        nextImageWidth = 600;
        nextImageHeight = 600;

        await processDroppedImages(['big.jpg'], mockStateItems, mockSettings, { x: 100, y: 100 }, mockAddItems, mockAddItem);

        const callArgs = mockAddItem.mock.calls[0][0];
        expect(callArgs.scale).toBe(1);
        expect(callArgs.width).toBe(300);
        expect(callArgs.x).toBe(100 - 300 / 2); // -50
        expect(callArgs.y).toBe(100 - 300 / 2); // -50
        expect(callArgs.type).toBe('image');
    });

    it('should scale down wide images properly', async () => {
        nextImageWidth = 600;
        nextImageHeight = 100;

        await processDroppedImages(['wide.jpg'], mockStateItems, mockSettings, { x: 500, y: 500 }, mockAddItems, mockAddItem);

        const callArgs = mockAddItem.mock.calls[0][0];
        expect(callArgs.width).toBe(300); // 600 * 0.5
        expect(callArgs.height).toBe(50); // 100 * 0.5
        // x = 500 - 300/2 = 350
        // y = 500 - 50/2 = 475
        expect(callArgs.x).toBe(350);
        expect(callArgs.y).toBe(475);
    });

    it('should scale down tall images properly', async () => {
        nextImageWidth = 100;
        nextImageHeight = 600;

        await processDroppedImages(['tall.jpg'], mockStateItems, mockSettings, { x: 500, y: 500 }, mockAddItems, mockAddItem);

        const callArgs = mockAddItem.mock.calls[0][0];
        expect(callArgs.width).toBe(50); // 100 * 0.5
        expect(callArgs.height).toBe(300); // 600 * 0.5
        // x = 500 - 50/2 = 475
        // y = 500 - 300/2 = 350
        expect(callArgs.x).toBe(475);
        expect(callArgs.y).toBe(350);
    });

    it('should process multiple image drop', async () => {
        await processDroppedImages(
            ['img1.jpg', 'img2.jpg'],
            mockStateItems,
            mockSettings,
            null,
            mockAddItems,
            mockAddItem
        );

        expect(mockAddItems).toHaveBeenCalled();
        const calledItems = mockAddItems.mock.calls[0][0];
        expect(calledItems).toHaveLength(2);
        expect(calledItems[0]).toHaveProperty('layout', 'grid');
    });

    it('should handle no pointer pos default', async () => {
        await processDroppedImages(
            ['img1.jpg'],
            mockStateItems,
            mockSettings,
            null,
            mockAddItems,
            mockAddItem
        );
        expect(mockAddItem).toHaveBeenCalled();
        const callArgs = mockAddItem.mock.calls[0][0];
        // x/y defaults to 0 logic
        expect(callArgs.x).toBe(0);
        expect(callArgs.y).toBe(0);
    });
});
