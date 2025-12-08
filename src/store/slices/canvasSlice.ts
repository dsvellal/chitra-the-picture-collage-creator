import type { StateCreator } from 'zustand';
import type { CollageItem, CanvasSettings } from '../../types';
import { calculateGridLayout, calculateMosaicLayout } from '../../utils/layoutUtils';
import type { UISlice } from './uiSlice';

export interface CanvasSlice {
    collageItems: CollageItem[];
    canvasSettings: CanvasSettings;
    layoutMode: 'grid' | 'mosaic' | 'free';

    // History
    past: CollageItem[][];
    future: CollageItem[][];
    undo: () => void;
    redo: () => void;

    addCollageItem: (item: CollageItem) => void;
    addCollageItems: (items: CollageItem[]) => void;
    updateCollageItem: (id: string, updates: Partial<CollageItem>) => void;
    removeCollageItem: (id: string) => void;
    setCanvasSettings: (settings: Partial<CanvasSettings>) => void;
    setCollageItems: (items: CollageItem[]) => void;
    resizeCanvas: (width: number, height: number) => void;
    applyLayout: (type: 'grid' | 'mosaic') => void;
    shuffleLayout: () => void;
    swapCollageItems: (id1: string, id2: string) => void;
}

const MAX_HISTORY = 50;

const recalculateLayoutIfActive = (
    items: CollageItem[],
    layoutMode: 'free' | 'grid' | 'mosaic',
    settings: CanvasSettings
) => {
    if (layoutMode === 'free') return items;

    const layoutFn = layoutMode === 'mosaic' ? calculateMosaicLayout : calculateGridLayout;
    return layoutFn({
        canvasWidth: settings.width,
        canvasHeight: settings.height,
        items,
        padding: settings.padding
    });
};

export const createCanvasSlice: StateCreator<CanvasSlice & UISlice, [], [], CanvasSlice> = (set) => ({
    collageItems: [],
    layoutMode: 'free',
    past: [],
    future: [],
    canvasSettings: {
        width: 800,
        height: 600,
        backgroundColor: '#ffffff',
        padding: 10,
        borderRadius: 0,
    },

    addCollageItem: (item) =>
        set((state) => {
            const newItems = [...state.collageItems, item];
            const finalItems = recalculateLayoutIfActive(newItems, state.layoutMode, state.canvasSettings);
            const newPast = [...state.past, state.collageItems];
            if (newPast.length > MAX_HISTORY) newPast.shift();

            return {
                past: newPast,
                future: [],
                collageItems: finalItems
            };
        }),

    addCollageItems: (items) =>
        set((state) => {
            const newItems = [...state.collageItems, ...items];
            const finalItems = recalculateLayoutIfActive(newItems, state.layoutMode, state.canvasSettings);
            const newPast = [...state.past, state.collageItems];
            if (newPast.length > MAX_HISTORY) newPast.shift();

            return {
                past: newPast,
                future: [],
                collageItems: finalItems
            };
        }),

    updateCollageItem: (id, updates) =>
        set((state) => {
            const newPast = [...state.past, state.collageItems];
            if (newPast.length > MAX_HISTORY) newPast.shift();

            return {
                past: newPast,
                future: [],
                collageItems: state.collageItems.map((item) =>
                    item.id === id ? { ...item, ...updates } : item
                ),
                layoutMode: 'free'
            };
        }),

    removeCollageItem: (id) =>
        set((state) => {
            const newItems = state.collageItems.filter((item) => item.id !== id);
            const finalItems = recalculateLayoutIfActive(newItems, state.layoutMode, state.canvasSettings);
            const newPast = [...state.past, state.collageItems];
            if (newPast.length > MAX_HISTORY) newPast.shift();

            return {
                past: newPast,
                future: [],
                collageItems: finalItems,
            };
        }),

    undo: () =>
        set((state) => {
            if (state.past.length === 0) return {};
            const previous = state.past[state.past.length - 1];
            const newPast = state.past.slice(0, state.past.length - 1);

            return {
                past: newPast,
                future: [state.collageItems, ...state.future],
                collageItems: previous
            };
        }),

    redo: () =>
        set((state) => {
            if (state.future.length === 0) return {};
            const next = state.future[0];
            const newFuture = state.future.slice(1);

            return {
                past: [...state.past, state.collageItems],
                future: newFuture,
                collageItems: next
            };
        }),

    setCollageItems: (items) =>
        set(() => ({ collageItems: items })),

    setCanvasSettings: (settings) =>
        set((state) => {
            const newSettings = { ...state.canvasSettings, ...settings };
            let newItems = state.collageItems;
            if (state.layoutMode !== 'free') {
                const layoutFn = state.layoutMode === 'mosaic' ? calculateMosaicLayout : calculateGridLayout;
                newItems = layoutFn({
                    canvasWidth: newSettings.width,
                    canvasHeight: newSettings.height,
                    items: state.collageItems,
                    padding: newSettings.padding
                });
            }
            return {
                canvasSettings: newSettings,
                collageItems: newItems
            };
        }),

    resizeCanvas: (width, height) =>
        set((state) => {
            const layoutFn = state.layoutMode === 'mosaic' ? calculateMosaicLayout : calculateGridLayout;

            const newLayoutItems = layoutFn({
                canvasWidth: width,
                canvasHeight: height,
                items: state.collageItems,
                padding: state.canvasSettings.padding,
            });

            return {
                canvasSettings: { ...state.canvasSettings, width, height },
                collageItems: newLayoutItems,
            };
        }),

    applyLayout: (type) =>
        set((state) => {
            const layoutFn = type === 'mosaic' ? calculateMosaicLayout : calculateGridLayout;
            const newItems = layoutFn({
                canvasWidth: state.canvasSettings.width,
                canvasHeight: state.canvasSettings.height,
                items: state.collageItems,
                padding: state.canvasSettings.padding
            });
            return { collageItems: newItems, layoutMode: type };
        }),

    shuffleLayout: () =>
        set((state) => {
            const shuffled = [...state.collageItems].sort(() => Math.random() - 0.5);
            const mode = state.layoutMode === 'free' ? 'grid' : state.layoutMode;
            const layoutFn = mode === 'mosaic' ? calculateMosaicLayout : calculateGridLayout;

            const newItems = layoutFn({
                canvasWidth: state.canvasSettings.width,
                canvasHeight: state.canvasSettings.height,
                items: shuffled,
                padding: state.canvasSettings.padding
            });

            return { collageItems: newItems, layoutMode: mode };
        }),

    swapCollageItems: (id1, id2) =>
        set((state) => {
            const idx1 = state.collageItems.findIndex(i => i.id === id1);
            const idx2 = state.collageItems.findIndex(i => i.id === id2);

            if (idx1 === -1 || idx2 === -1) return {};

            const newItems = [...state.collageItems];
            // Swap
            [newItems[idx1], newItems[idx2]] = [newItems[idx2], newItems[idx1]];

            const finalItems = recalculateLayoutIfActive(newItems, state.layoutMode, state.canvasSettings);
            return { collageItems: finalItems };
        }),
});
