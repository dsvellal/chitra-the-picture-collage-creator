import type { CollageItem } from '../store/collageStore';

export const getItemStyles = (item: CollageItem) => {
    const shadow = item.shadow || { color: 'black', blur: 0, offset: { x: 0, y: 0 }, opacity: 0 };
    const filter = item.filter || { brightness: 0, contrast: 0 };

    return {
        shadowColor: shadow.color,
        shadowBlur: shadow.blur,
        shadowOffsetX: shadow.offset.x,
        shadowOffsetY: shadow.offset.y,
        shadowOpacity: shadow.opacity,
        brightness: filter.brightness,
        contrast: filter.contrast,
    };
};
