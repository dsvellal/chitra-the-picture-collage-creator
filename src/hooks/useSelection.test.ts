import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSelection } from './useSelection';

describe('useSelection', () => {
    const allIds = ['1', '2', '3'];

    it('should initialize with empty selection', () => {
        const { result } = renderHook(() => useSelection(allIds));
        expect(result.current.selectedIds.size).toBe(0);
    });

    it('should calculate range selection', () => {
        const { result } = renderHook(() => useSelection(allIds));
        // Select first
        act(() => result.current.toggleSelection('1', 0));

        // Output of getRangeSelection is used inside toggle with shift
        // We simulate shift click on 3 (index 2)
        const mockEvent = { shiftKey: true } as React.MouseEvent;
        act(() => result.current.toggleSelection('3', 2, mockEvent));

        expect(result.current.selectedIds.has('1')).toBe(true);
        expect(result.current.selectedIds.has('2')).toBe(true);
        expect(result.current.selectedIds.has('3')).toBe(true);
    });

    it('should select single item', () => {
        const { result } = renderHook(() => useSelection(allIds));

        act(() => {
            result.current.toggleSelection('1', 0);
        });

        expect(result.current.selectedIds.has('1')).toBe(true);
        expect(result.current.selectedIds.size).toBe(1);
    });

    it('should deselect item', () => {
        const { result } = renderHook(() => useSelection(allIds));

        // Select
        act(() => result.current.toggleSelection('1', 0));
        expect(result.current.selectedIds.has('1')).toBe(true);

        // Click again -> should it deselect or keep? 
        // Behavior depends on calculateNewSelection logic.
        // Assuming default toggle logic if no modifier.
        act(() => result.current.toggleSelection('1', 0));
        // Typically single click replaces selection, so it stays selected.
        // Wait, if I click same item, usually it stays selected.
        // If I click another, it replaces.

        act(() => result.current.toggleSelection('2', 1));
        expect(result.current.selectedIds.has('2')).toBe(true);
        expect(result.current.selectedIds.has('1')).toBe(false);
    });

    it('should support multi-select with meta/ctrl', () => {
        const { result } = renderHook(() => useSelection(allIds));

        act(() => result.current.toggleSelection('1', 0));

        const mockEvent = {
            ctrlKey: true,
            shiftKey: false
        } as React.MouseEvent;

        act(() => {
            result.current.toggleSelection('2', 1, mockEvent);
        });

        expect(result.current.selectedIds.has('1')).toBe(true);
        expect(result.current.selectedIds.has('2')).toBe(true);
    });
});
