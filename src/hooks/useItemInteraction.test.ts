
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
    it('should return handlers', () => {
        const mockUpdate = vi.fn();
        (useCollageStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            updateCollageItem: mockUpdate,
            collageItems: [],
            layoutMode: 'free'
        });

        const { result } = renderHook(() => useItemInteraction());
        expect(result.current.handleItemChange).toBeDefined();
    });

    it('should handle item swap on drag', () => {
        const mockSwap = vi.fn();
        const mockApplyLayout = vi.fn();
        const items = [{ id: '1', x: 0, y: 0, width: 100, height: 100 }, { id: '2', x: 200, y: 200, width: 100, height: 100 }];

        (useCollageStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            updateCollageItem: vi.fn(),
            swapCollageItems: mockSwap,
            collageItems: items,
            layoutMode: 'grid',
            applyLayout: mockApplyLayout
        });

        (isPointInItem as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true); // Simulate hit

        const { result } = renderHook(() => useItemInteraction());

        // Simulate drag change
        act(() => {
            result.current.handleItemChange(items[0] as unknown as import('../store/collageStore').CollageItem, { x: 200, y: 200 });
            result.current.handleItemChange(items[0] as CollageItem, { x: 200, y: 200 });
        });

        expect(mockSwap).toHaveBeenCalledWith('1', '2');
    });

    it('should handle item changes correctly', () => {
        const mockUpdate = vi.fn();
        const mockSwap = vi.fn();
        (useCollageStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            updateCollageItem: mockUpdate,
            swapCollageItems: mockSwap,
            applyLayout: vi.fn(),
            collageItems: [{ id: '2', x: 0, y: 0, width: 100, height: 100 }],
            layoutMode: 'free'
        });
        (isPointInItem as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);

        const { result } = renderHook(() => useItemInteraction());
        const item = { id: '1', x: 0, y: 0, width: 100, height: 100 } as CollageItem;

        act(() => {
            result.current.handleItemChange(item, { x: 50 });
        });

        expect(mockUpdate).toHaveBeenCalledWith('1', { x: 50 });
    });

    it('should swap items if dropped on another item', () => {
        const mockUpdate = vi.fn();
        const mockSwap = vi.fn();
        (useCollageStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            updateCollageItem: mockUpdate,
            swapCollageItems: mockSwap,
            applyLayout: vi.fn(),
            collageItems: [{ id: '2', x: 0, y: 0, width: 100, height: 100 }]
        });
        (isPointInItem as unknown as ReturnType<typeof vi.fn>).mockReturnValue('2');

        const { result } = renderHook(() => useItemInteraction());
        const item = { id: '1', x: 0, y: 0, width: 100, height: 100 } as CollageItem;

        act(() => {
            result.current.handleItemChange(item, { x: 50, y: 50 });
        });

        expect(mockSwap).toHaveBeenCalledWith('1', '2');
    });

    it('should re-apply grid layout if dropped in empty space', () => {
        const mockUpdate = vi.fn();
        const mockSwap = vi.fn();
        const mockApplyLayout = vi.fn();
        (useCollageStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            updateCollageItem: mockUpdate,
            swapCollageItems: mockSwap,
            applyLayout: mockApplyLayout,
            collageItems: [{ id: '2', x: 0, y: 0, width: 100, height: 100 }],
            layoutMode: 'grid'
        });
        (isPointInItem as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false); // No hit

        const { result } = renderHook(() => useItemInteraction());
        const item = { id: '1', x: 0, y: 0, width: 100, height: 100 } as CollageItem;
        act(() => {
            result.current.handleItemChange(item, { x: 500, y: 500 });
        });

        expect(mockSwap).not.toHaveBeenCalled();
        expect(mockApplyLayout).toHaveBeenCalledWith('grid');
    });

    it('should re-apply mosaic layout if dropped in empty space', () => {
        const mockUpdate = vi.fn();
        const mockSwap = vi.fn();
        const mockApplyLayout = vi.fn();
        (useCollageStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            updateCollageItem: mockUpdate,
            swapCollageItems: mockSwap,
            applyLayout: mockApplyLayout,
            collageItems: [{ id: '2', x: 0, y: 0, width: 100, height: 100 }],
            layoutMode: 'mosaic'
        });
        (isPointInItem as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);

        const { result } = renderHook(() => useItemInteraction());
        const item = { id: '1', x: 0, y: 0, width: 100, height: 100 } as CollageItem;
        act(() => {
            result.current.handleItemChange(item, { x: 500, y: 500 });
        });

        expect(mockApplyLayout).toHaveBeenCalledWith('mosaic');
    });

    it('should handle standard update in free mode', () => {
        const mockUpdate = vi.fn();
        (useCollageStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            updateCollageItem: mockUpdate,
            swapCollageItems: vi.fn(),
            collageItems: [],
            layoutMode: 'free',
            applyLayout: vi.fn()
        });

        const { result } = renderHook(() => useItemInteraction());
        act(() => {
            result.current.handleItemChange({ id: '1' } as CollageItem, { x: 10 });
        });

        expect(mockUpdate).toHaveBeenCalledWith('1', { x: 10 });
    });

    // Add more tests for interaction logic if needed
    it('should handle partial coordinates (only x)', () => {
        const mockUpdate = vi.fn();
        const mockApplyLayout = vi.fn();
        (useCollageStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            updateCollageItem: mockUpdate,
            swapCollageItems: vi.fn(),
            applyLayout: mockApplyLayout,
            collageItems: [{ id: '2', x: 0, y: 0, width: 100, height: 100 }],
            layoutMode: 'grid'
        });
        (isPointInItem as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);

        const { result } = renderHook(() => useItemInteraction());
        const item = { id: '1', x: 0, y: 0, width: 100, height: 100 } as CollageItem;
        act(() => {
            result.current.handleItemChange(item, { x: 50 });
        });

        expect(mockApplyLayout).toHaveBeenCalled();
    });

    it('should handle partial coordinates (only y)', () => {
        const mockUpdate = vi.fn();
        const mockApplyLayout = vi.fn();
        (useCollageStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            updateCollageItem: mockUpdate,
            swapCollageItems: vi.fn(),
            applyLayout: mockApplyLayout,
            collageItems: [{ id: '2', x: 0, y: 0, width: 100, height: 100 }],
            layoutMode: 'grid'
        });
        (isPointInItem as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);

        const { result } = renderHook(() => useItemInteraction());
        const item = { id: '1', x: 0, y: 0, width: 100, height: 100 } as CollageItem;
        act(() => {
            result.current.handleItemChange(item, { y: 50 });
        });

        expect(mockApplyLayout).toHaveBeenCalled();
    });
    it('should fall through for unknown layout mode', () => {
        const mockApplyLayout = vi.fn();
        (useCollageStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            updateCollageItem: vi.fn(),
            swapCollageItems: vi.fn(),
            applyLayout: mockApplyLayout,
            collageItems: [{ id: '2', x: 0, y: 0, width: 100, height: 100 }],
            layoutMode: 'unknown'
        });
        (isPointInItem as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);

        const { result } = renderHook(() => useItemInteraction());
        const item = { id: '1', x: 0, y: 0, width: 100, height: 100 } as CollageItem;
        act(() => {
            result.current.handleItemChange(item, { x: 500, y: 500 });
        });

        expect(mockApplyLayout).not.toHaveBeenCalled();
    });

    it('should handle missing width/height in drop coords', () => {
        const mockApplyLayout = vi.fn();
        (useCollageStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            updateCollageItem: vi.fn(),
            swapCollageItems: vi.fn(),
            applyLayout: mockApplyLayout,
            collageItems: [],
            layoutMode: 'grid'
        });
        (isPointInItem as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);

        const { result } = renderHook(() => useItemInteraction());
        // Item without width/height
        const item = { id: '1', x: 0, y: 0 } as CollageItem;
        act(() => {
            result.current.handleItemChange(item, { x: 50 });
        });
        expect(mockApplyLayout).toHaveBeenCalled();
    });
});
