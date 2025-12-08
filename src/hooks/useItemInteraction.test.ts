
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useItemInteraction } from './useItemInteraction';
import { useCollageStore } from '../store/collageStore';
import type { CollageItem } from '../store/collageStore';
import { isPointInItem } from '../utils/itemUtils';

vi.mock('../store/collageStore', () => ({
    useCollageStore: vi.fn()
}));

vi.mock('../utils/itemUtils', () => ({
    isPointInItem: vi.fn(),
    getItemDims: vi.fn(() => ({ w: 100, h: 100 }))
}));

describe('useItemInteraction', () => {
    const defaultItem = { id: '1', x: 0, y: 0, width: 100, height: 100 } as CollageItem;

    const setupHook = (storeOverrides = {}, pointInItemValue: boolean | string = false) => {
        const mockUpdate = vi.fn();
        const mockSwap = vi.fn();
        const mockApplyLayout = vi.fn();

        (useCollageStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            updateCollageItem: mockUpdate,
            swapCollageItems: mockSwap,
            applyLayout: mockApplyLayout,
            collageItems: [],
            layoutMode: 'free',
            ...storeOverrides
        });

        (isPointInItem as unknown as ReturnType<typeof vi.fn>).mockReturnValue(pointInItemValue);

        const { result } = renderHook(() => useItemInteraction());
        return { result, mockUpdate, mockSwap, mockApplyLayout };
    };

    it('should return handlers', () => {
        const { result } = setupHook();
        expect(result.current.handleItemChange).toBeDefined();
    });

    it('should handle item swap on drag', () => {
        const items = [{ id: '1', x: 0, y: 0, width: 100, height: 100 }, { id: '2', x: 200, y: 200, width: 100, height: 100 }];
        const { result, mockSwap } = setupHook({
            collageItems: items,
            layoutMode: 'grid'
        }, true);

        act(() => {
            result.current.handleItemChange(items[0] as unknown as CollageItem, { x: 200, y: 200 });
        });

        expect(mockSwap).toHaveBeenCalledWith('1', '2');
    });

    it('should handle item changes correctly', () => {
        const { result, mockUpdate } = setupHook({
            collageItems: [{ id: '2', x: 0, y: 0, width: 100, height: 100 }]
        });

        act(() => {
            result.current.handleItemChange(defaultItem, { x: 50 });
        });

        expect(mockUpdate).toHaveBeenCalledWith('1', { x: 50 });
    });

    it('should swap items if dropped on another item', () => {
        const { result, mockSwap } = setupHook({
            collageItems: [{ id: '2', x: 0, y: 0, width: 100, height: 100 }],
            layoutMode: 'grid'
        }, '2');

        act(() => {
            result.current.handleItemChange(defaultItem, { x: 50, y: 50 });
        });

        expect(mockSwap).toHaveBeenCalledWith('1', '2');
    });

    const setupGridMode = () => setupHook({
        collageItems: [{ id: '2', x: 0, y: 0, width: 100, height: 100 }],
        layoutMode: 'grid'
    });

    it('should re-apply grid layout if dropped in empty space', () => {
        const { result, mockSwap, mockApplyLayout } = setupGridMode();

        act(() => {
            result.current.handleItemChange(defaultItem, { x: 500, y: 500 });
        });

        expect(mockSwap).not.toHaveBeenCalled();
        expect(mockApplyLayout).toHaveBeenCalledWith('grid');
    });

    it('should re-apply mosaic layout if dropped in empty space', () => {
        const { result, mockApplyLayout } = setupHook({
            collageItems: [{ id: '2', x: 0, y: 0, width: 100, height: 100 }],
            layoutMode: 'mosaic'
        });

        act(() => {
            result.current.handleItemChange(defaultItem, { x: 500, y: 500 });
        });

        expect(mockApplyLayout).toHaveBeenCalledWith('mosaic');
    });

    it('should handle standard update in free mode', () => {
        const { result, mockUpdate } = setupHook();

        act(() => {
            result.current.handleItemChange({ id: '1' } as CollageItem, { x: 10 });
        });

        expect(mockUpdate).toHaveBeenCalledWith('1', { x: 10 });
    });

    it.each([
        { update: { x: 50 }, desc: 'only x' },
        { update: { y: 50 }, desc: 'only y' }
    ])('should handle partial coordinates ($desc)', ({ update }) => {
        const { result, mockApplyLayout } = setupGridMode();

        act(() => {
            result.current.handleItemChange(defaultItem, update);
        });

        expect(mockApplyLayout).toHaveBeenCalled();
    });

    it('should fall through for unknown layout mode', () => {
        const { result, mockApplyLayout } = setupHook({
            collageItems: [{ id: '2', x: 0, y: 0, width: 100, height: 100 }],
            layoutMode: 'unknown'
        });

        act(() => {
            result.current.handleItemChange(defaultItem, { x: 500, y: 500 });
        });

        expect(mockApplyLayout).not.toHaveBeenCalled();
    });

    it('should handle missing width/height in drop coords', () => {
        const { result, mockApplyLayout } = setupHook({ layoutMode: 'grid' });

        act(() => {
            result.current.handleItemChange({ id: '1', x: 0, y: 0 } as CollageItem, { x: 50 });
        });

        expect(mockApplyLayout).toHaveBeenCalled();
    });
});
