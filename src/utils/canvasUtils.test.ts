import { describe, it, expect } from 'vitest';
import { boundBoxFunc } from './canvasUtils';

describe('boundBoxFunc', () => {
    it('should return old box if new box is too small', () => {
        const oldBox = { x: 0, y: 0, width: 100, height: 100, rotation: 0 };
        const newBox = { x: 0, y: 0, width: 4, height: 100, rotation: 0 };
        expect(boundBoxFunc(oldBox, newBox)).toBe(oldBox);

        const newBox2 = { x: 0, y: 0, width: 100, height: 4, rotation: 0 };
        expect(boundBoxFunc(oldBox, newBox2)).toBe(oldBox);
    });

    it('should return new box if dimensions are valid', () => {
        const oldBox = { x: 0, y: 0, width: 100, height: 100, rotation: 0 };
        const newBox = { x: 10, y: 10, width: 50, height: 50, rotation: 0 };
        expect(boundBoxFunc(oldBox, newBox)).toBe(newBox);
    });
});
