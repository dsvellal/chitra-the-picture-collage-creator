import { v4 as uuidv4 } from 'uuid';
import { calculateGridLayout } from './layoutUtils';
import type { CollageItem, CanvasSettings } from '../types';

export const processDroppedImages = async (
    srcs: string[],
    collageItems: CollageItem[],
    canvasSettings: CanvasSettings,
    pointerPos: { x: number, y: number } | null,
    addCollageItems: (items: CollageItem[]) => void,
    addCollageItem: (item: CollageItem) => void
) => {
    const loadPromises = srcs.map(src => new Promise<HTMLImageElement>((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
    }));

    const loadedImages = await Promise.all(loadPromises);

    if (srcs.length > 1) {
        const tempItems: CollageItem[] = loadedImages.map((img, i) => ({
            id: uuidv4(),
            type: 'image',
            src: srcs[i],
            x: 0,
            y: 0,
            width: img.width,
            height: img.height,
            originalWidth: img.width,
            originalHeight: img.height,
            rotation: 0,
            scale: 1,
            zIndex: collageItems.length + i
        }));

        const layoutItems = calculateGridLayout({
            canvasWidth: canvasSettings.width,
            canvasHeight: canvasSettings.height,
            items: tempItems,
            padding: canvasSettings.padding || 10
        });

        addCollageItems(layoutItems);
    } else {
        const img = loadedImages[0];
        const maxDim = 300;
        const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
        const x = pointerPos ? pointerPos.x - (img.width * scale) / 2 : 0;
        const y = pointerPos ? pointerPos.y - (img.height * scale) / 2 : 0;

        addCollageItem({
            id: uuidv4(),
            type: 'image',
            src: srcs[0],
            x,
            y,
            rotation: 0,
            scale: 1,
            width: img.width * scale,
            height: img.height * scale,
            originalWidth: img.width,
            originalHeight: img.height,
            zIndex: collageItems.length,
        });
    }
};
