import { describe, it, expect } from 'vitest';
import { getItemStyles } from './styleUtils';
import type { CollageItem } from '../store/collageStore';

describe('styleUtils', () => {
    const baseItem: CollageItem = {
        id: '1', type: 'image', x: 0, y: 0, width: 100, height: 100, rotation: 0, scale: 1, zIndex: 0
    };

    it('should return default styles if none present', () => {
        const styles = getItemStyles(baseItem);
        expect(styles.shadowColor).toBe('black');
        expect(styles.brightness).toBe(0);
    });

    it('should return custom styles', () => {
        const item = {
            ...baseItem,
            shadow: { color: 'red', blur: 10, offset: { x: 5, y: 5 }, opacity: 0.5 },
            filter: { brightness: 0.5, contrast: 0.2 }
        };
        const styles = getItemStyles(item);
        expect(styles.shadowColor).toBe('red');
        expect(styles.brightness).toBe(0.5);
    });
});
