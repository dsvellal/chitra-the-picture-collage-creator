import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCanvasItem } from './useCanvasItem';
import Konva from 'konva';
import { useCollageStore } from '../store/collageStore';

// Mock store
vi.mock('../store/collageStore', () => ({
    useCollageStore: vi.fn()
}));

describe('useCanvasItem', () => {
    const mockOnChange = vi.fn();
    const mockSetSelected = vi.fn();
    // const mockShapeRef = { current: { x: () => 100, y: () => 200, rotation: () => 45, scaleX: () => 2, scaleY: () => 2, width: () => 50, height: () => 50 } };
    // const mockTrRef = { current: { nodes: vi.fn(), getLayer: () => ({ batchDraw: vi.fn() }) } };

    beforeEach(() => {
        vi.clearAllMocks();
        // Setup store mock default return
        (useCollageStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: unknown) => {
            if (!selector) return { setSelectedItemId: mockSetSelected };
            return (selector as (s: unknown) => unknown)({
                setSelectedItemId: mockSetSelected,
                selectedItemId: null
            });
        });
    });

    it('should return refs and handlers', () => {
        const { result } = renderHook(() => useCanvasItem(false, mockOnChange));

        expect(result.current.shapeRef).toBeDefined();
        expect(result.current.trRef).toBeDefined();
        expect(result.current.handleDragEnd).toBeDefined();
        expect(result.current.handleTransformEnd).toBeDefined();
    });

    it('should handle drag end', () => {
        const { result } = renderHook(() => useCanvasItem(true, mockOnChange));
        const mockEvent = {
            target: { x: () => 100, y: () => 200 }
        } as unknown as Konva.KonvaEventObject<DragEvent>;

        act(() => {
            result.current.handleDragEnd(mockEvent);
        });

        expect(mockOnChange).toHaveBeenCalledWith({ x: 100, y: 200 });
        // selection is not cleared on drag end in this hook
    });

    it('should handle transform end', () => {
        const { result } = renderHook(() => useCanvasItem(true, mockOnChange));

        // Mock shape ref
        const mockNode = {
            scaleX: vi.fn().mockReturnValue(2),
            scaleY: vi.fn().mockReturnValue(2),
            rotation: vi.fn().mockReturnValue(45),
            x: vi.fn().mockReturnValue(100),
            y: vi.fn().mockReturnValue(100),
            width: vi.fn().mockReturnValue(50),
            height: vi.fn().mockReturnValue(50),
        };
        (result.current.shapeRef as unknown as { current: unknown }).current = mockNode;

        act(() => {
            result.current.handleTransformEnd();
        });

        expect(mockNode.scaleX).toHaveBeenCalledWith(1);
        expect(mockNode.scaleY).toHaveBeenCalledWith(1);
        expect(mockOnChange).toHaveBeenCalledWith({
            x: 100,
            y: 100,
            rotation: 45,
            width: 100, // 50 * 2
            height: 100, // 50 * 2
            scale: 1
        });
    });

    it('should safely ignore transform end if node is missing', () => {
        const { result } = renderHook(() => useCanvasItem(true, mockOnChange));
        (result.current.shapeRef as unknown as { current: unknown }).current = null;
        act(() => {
            result.current.handleTransformEnd();
        });
        // Should not crash and not call onChange
        // mockOnChange was called in previous tests, so we rely on clear in beforeEach if we had one,
        // but here we didn't add clear in beforeEach for mockOnChange variable specifically?
        // Ah, mockOnChange is defined inside describe but not cleared.
        // Let's rely on it being a new fn? No, it's const.
        // We should clear it.
        // mockOnChange was cleared in beforeEach
        mockOnChange.mockClear();

        act(() => {
            result.current.handleTransformEnd();
        });
        expect(mockOnChange).not.toHaveBeenCalled();
    });
});
