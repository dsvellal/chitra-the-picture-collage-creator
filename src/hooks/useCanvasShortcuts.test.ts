
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCanvasShortcuts } from './useCanvasShortcuts';
import { useCollageStore } from '../store/collageStore';

vi.mock('../store/collageStore', () => ({
    useCollageStore: vi.fn()
}));

describe('useCanvasShortcuts', () => {
    const mockRemove = vi.fn();
    const mockUndo = vi.fn();
    const mockRedo = vi.fn();
    const mockSetSelected = vi.fn();
    let keydownHandlers: ((e: KeyboardEvent) => void)[] = [];

    beforeEach(() => {
        vi.clearAllMocks();
        (useCollageStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            removeCollageItem: mockRemove,
            undo: mockUndo,
            redo: mockRedo,
            setSelectedItemId: mockSetSelected,
            selectedItemId: '1'
        });

        keydownHandlers = [];
        // Capture the handler
        vi.spyOn(window, 'addEventListener').mockImplementation((event, handler) => {
            if (event === 'keydown') {
                keydownHandlers.push(handler as (e: KeyboardEvent) => void);
            }
        });
        vi.spyOn(window, 'removeEventListener').mockImplementation((event, handler) => {
            if (event === 'keydown') {
                const index = keydownHandlers.indexOf(handler as (e: KeyboardEvent) => void);
                if (index > -1) {
                    keydownHandlers.splice(index, 1);
                }
            }
        });
    });

    const trigger = (props: Partial<KeyboardEvent>) => {
        const event = {
            key: '',
            ctrlKey: false,
            metaKey: false,
            shiftKey: false,
            preventDefault: vi.fn(),
            ...props
        } as unknown as KeyboardEvent;

        keydownHandlers.forEach(handler => handler(event));
        return event;
    };

    it('should remove item on Delete key', () => {
        renderHook(() => useCanvasShortcuts());
        trigger({ key: 'Delete' });
        expect(mockRemove).toHaveBeenCalledWith('1');
    });

    it('should remove item on Backspace key', () => {
        renderHook(() => useCanvasShortcuts());
        trigger({ key: 'Backspace' });
        expect(mockRemove).toHaveBeenCalledWith('1');
    });

    it('should undo on Ctrl+Z with preventDefault', () => {
        renderHook(() => useCanvasShortcuts());
        const event = trigger({ key: 'z', ctrlKey: true });
        expect(mockUndo).toHaveBeenCalled();
        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should redo on Shift+Ctrl+Z with preventDefault', () => {
        renderHook(() => useCanvasShortcuts());
        const event = trigger({ key: 'z', ctrlKey: true, shiftKey: true });
        expect(mockRedo).toHaveBeenCalled();
        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should undo on Meta+Z', () => {
        renderHook(() => useCanvasShortcuts());
        trigger({ key: 'z', metaKey: true });
        expect(mockUndo).toHaveBeenCalled();
    });

    it('should not trigger if key is wrong', () => {
        renderHook(() => useCanvasShortcuts());
        trigger({ key: 'y', ctrlKey: true });
        expect(mockUndo).not.toHaveBeenCalled();
    });

    it('should not delete if no item selected', () => {
        (useCollageStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            removeCollageItem: mockRemove,
            undo: mockUndo,
            redo: mockRedo,
            setSelectedItemId: mockSetSelected,
            selectedItemId: null // No selection
        });
        renderHook(() => useCanvasShortcuts());
        trigger({ key: 'Delete' });
        expect(mockRemove).not.toHaveBeenCalled();
    });

    it('should not undo if modifier missing', () => {
        renderHook(() => useCanvasShortcuts());
        trigger({ key: 'z', ctrlKey: false, metaKey: false });
        expect(mockUndo).not.toHaveBeenCalled();
    });

    it('should remove event listener on unmount', () => {
        const { unmount } = renderHook(() => useCanvasShortcuts());
        unmount();
        // We know we added at least one 'keydown' listener
        // Verify removeEventListener was called with 'keydown'
        expect(window.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('should update listener when dependencies change', () => {
        // 1. Initial render with Item 1
        (useCollageStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            removeCollageItem: mockRemove,
            undo: mockUndo,
            redo: mockRedo,
            setSelectedItemId: mockSetSelected,
            selectedItemId: '1'
        });

        const { rerender } = renderHook(() => useCanvasShortcuts());

        // 2. Clear mocks to track new calls
        vi.clearAllMocks(); // Clears removeCollageItem history

        // 3. Update store to Item 2
        (useCollageStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            removeCollageItem: mockRemove,
            undo: mockUndo,
            redo: mockRedo,
            setSelectedItemId: mockSetSelected,
            selectedItemId: '2'
        });

        rerender();

        // 4. Trigger Delete
        // If dependency array was [], the old listener is still active with closure '1'.
        // If dependency array was correct, new listener with closure '2'.
        // Note: mockRemove is the SAME function ref, but the ARGUMENT depends on closure.
        trigger({ key: 'Delete' });

        expect(mockRemove).toHaveBeenCalledWith('2');
    });

    it('should not delete if selected but wrong key', () => {
        // Selection exists
        (useCollageStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            removeCollageItem: mockRemove,
            undo: mockUndo,
            redo: mockRedo,
            setSelectedItemId: mockSetSelected,
            selectedItemId: '1'
        });
        renderHook(() => useCanvasShortcuts());

        // Trigger Enter (Wrong key)
        trigger({ key: 'Enter' });

        expect(mockRemove).not.toHaveBeenCalled();
    });



    it('should call removeEventListener twice on unmount', () => {
        // One for delete, one for undo/redo
        const { unmount } = renderHook(() => useCanvasShortcuts());
        // Verify addEventListener called twice initially
        expect(window.addEventListener).toHaveBeenCalledTimes(2);

        unmount();

        expect(window.removeEventListener).toHaveBeenCalledTimes(2);
        const calls = (window.removeEventListener as unknown as ReturnType<typeof vi.fn>).mock.calls;
        const keydownCalls = calls.filter(c => c[0] === 'keydown');
        expect(keydownCalls).toHaveLength(2);
    });
});
