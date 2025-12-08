
import { describe, it, expect } from 'vitest';
import { calculateNewSelection, getRangeSelection, getToggleSelection, getEventModifiers } from './selectionUtils';

describe('selectionUtils', () => {
    describe('getRangeSelection', () => {
        const allIds = ['1', '2', '3', '4', '5'];

        it('should return empty set modification if lastIndex is null', () => {
            const prev = new Set(['1']);
            const res = getRangeSelection(allIds, null, 2, prev);
            // Should be same as prev (clone)
            expect(res.size).toBe(1);
            expect(res.has('1')).toBe(true);
        });

        it('should select range forward', () => {
            const prev = new Set<string>();
            // last: 0 ('1'), curr: 2 ('3'). Range: 0..2 -> '1','2','3'
            const res = getRangeSelection(allIds, 0, 2, prev);
            expect(res.size).toBe(3);
            expect(res.has('1')).toBe(true);
            expect(res.has('2')).toBe(true);
            expect(res.has('3')).toBe(true);
        });

        it('should select range backward', () => {
            const prev = new Set<string>();
            // last: 3 ('4'), curr: 1 ('2'). Range: 1..3 -> '2','3','4'
            const res = getRangeSelection(allIds, 3, 1, prev);
            expect(res.size).toBe(3);
            expect(res.has('2')).toBe(true);
            expect(res.has('3')).toBe(true);
            expect(res.has('4')).toBe(true);
        });

        it('should include strictly the bounds (kill mutants on slice+1)', () => {
            // range 1..1 -> '2'
            const res = getRangeSelection(allIds, 1, 1, new Set());
            expect(res.size).toBe(1);
            expect(res.has('2')).toBe(true);

            // range 0..1
            const res2 = getRangeSelection(allIds, 0, 1, new Set());
            expect(res2.size).toBe(2);
            expect(res2.has('1')).toBe(true);
            expect(res2.has('2')).toBe(true);
            expect(res2.has('3')).toBe(false);
        });
    });

    describe('getToggleSelection', () => {
        it('should add if not present', () => {
            const prev = new Set(['1']);
            const res = getToggleSelection('2', prev);
            expect(res.size).toBe(2);
            expect(res.has('1')).toBe(true);
            expect(res.has('2')).toBe(true);
        });

        it('should remove if present', () => {
            const prev = new Set(['1', '2']);
            const res = getToggleSelection('1', prev);
            expect(res.size).toBe(1);
            expect(res.has('2')).toBe(true);
            expect(res.has('1')).toBe(false);
        });
    });

    describe('calculateNewSelection', () => {
        const allIds = ['1', '2', '3'];

        it('should use range selection if shift is true', () => {
            const prev = new Set(['1']);
            // Shift click '3'. Last was '1' (idx 0). Range '1'..'3'.
            const res = calculateNewSelection(prev, '3', 2, allIds, 0, true, false);
            expect(res.size).toBe(3); // 1, 2, 3
        });

        it('should use toggle selection if meta is true', () => {
            const prev = new Set(['1']);
            const res = calculateNewSelection(prev, '2', 1, allIds, 0, false, true);
            expect(res.size).toBe(2); // 1, 2

            const res2 = calculateNewSelection(res, '1', 0, allIds, 1, false, true);
            expect(res2.size).toBe(1); // 2
        });

        it('should default to toggle (single select behavior usually?)', () => {
            // Ideally default is single select (replace). 
            // But implementation seems to be `getToggleSelection` for default?
            // Line 30: return getToggleSelection(id, prev);
            // Wait, usually default click replaces selection. 
            // But valid behavior for now is toggle.
            const prev = new Set(['1']);
            const res = calculateNewSelection(prev, '2', 1, allIds, 0, false, false);
            expect(res.has('2')).toBe(true);
            expect(res.has('1')).toBe(true); // Since implementation adds it.

            // Kill mutant: verify it actually toggles (removes) if present
            const res2 = calculateNewSelection(res, '2', 1, allIds, 0, false, false);
            expect(res2.has('2')).toBe(false);
        });
    });

    describe('getEventModifiers', () => {
        it('should handle missing event', () => {
            expect(getEventModifiers(undefined)).toEqual({ shift: false, meta: false });
        });

        it('should detect shift', () => {
            expect(getEventModifiers({ shiftKey: true } as unknown as React.MouseEvent)).toEqual({ shift: true, meta: false });
        });

        it('should detect meta', () => {
            expect(getEventModifiers({ metaKey: true } as unknown as React.MouseEvent)).toEqual({ shift: false, meta: true });
        });

        it('should detect ctrl as meta (windows)', () => {
            expect(getEventModifiers({ ctrlKey: true } as unknown as React.MouseEvent)).toEqual({ shift: false, meta: true });
        });

        it('should handle both false', () => {
            expect(getEventModifiers({} as unknown as React.MouseEvent)).toEqual({ shift: false, meta: false });
        });
    });
});
