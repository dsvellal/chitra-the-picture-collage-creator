import { create } from 'zustand';
import { calculateGridLayout, calculateMosaicLayout } from '../utils/layoutUtils';

export interface CollageItem {
    id: string;
    type: 'image' | 'text' | 'sticker';
    src?: string; // Required for image/sticker
    text?: string; // Required for text

    // Position & Transform
    x: number;
    y: number;
    rotation: number;
    scale: number;
    width: number;
    height: number;
    zIndex: number;

    // Original Dimensions (for restoring after layout changes)
    originalWidth?: number;
    originalHeight?: number;

    // Image Specific
    crop?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    filter?: {
        brightness?: number;
        contrast?: number;
        blur?: number;
        grayscale?: number;
    };

    // Style
    borderRadius?: number;
    borderColor?: string;
    borderWidth?: number;
    shadow?: {
        color: string;
        blur: number;
        offset: { x: number, y: number };
        opacity: number;
    };

    // Text Specific
    fontSize?: number;
    fontFamily?: string;
    fill?: string;
    fontStyle?: string;
    align?: string;
}

export interface CanvasSettings {
    width: number;
    height: number;
    backgroundColor: string;
    padding: number;
    borderRadius: number;
}

// Helper to avoid duplication
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

interface CollageState {
    uploadedImages: string[];
    collageItems: CollageItem[];
    canvasSettings: CanvasSettings;
    layoutMode: 'grid' | 'mosaic' | 'free';

    // History
    past: CollageItem[][];
    future: CollageItem[][];
    undo: () => void;
    redo: () => void;

    addUploadedImage: (src: string) => void;
    removeUploadedImage: (src: string) => void;
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

    // Selection
    selectedItemId: string | null;
    setSelectedItemId: (id: string | null) => void;
}

export const useCollageStore = create<CollageState>((set) => ({
    uploadedImages: [],
    collageItems: [],
    layoutMode: 'free',
    past: [],
    future: [],
    // ...
    selectedItemId: null,
    setSelectedItemId: (id) => set({ selectedItemId: id }),
    canvasSettings: {
        width: 800,
        height: 600,
        backgroundColor: '#ffffff',
        padding: 10,
        borderRadius: 0,
    },

    addUploadedImage: (src) =>
        set((state) => ({ uploadedImages: [...state.uploadedImages, src] })),

    removeUploadedImage: (src) =>
        set((state) => ({
            uploadedImages: state.uploadedImages.filter((s) => s !== src),
            // Optional: also remove from selection if present
        })),

    addCollageItem: (item) =>
        set((state) => {
            const newItems = [...state.collageItems, item];
            const finalItems = recalculateLayoutIfActive(newItems, state.layoutMode, state.canvasSettings);

            return {
                past: [...state.past, state.collageItems],
                future: [],
                collageItems: finalItems
            };
        }),

    addCollageItems: (items) =>
        set((state) => {
            const newItems = [...state.collageItems, ...items];
            const finalItems = recalculateLayoutIfActive(newItems, state.layoutMode, state.canvasSettings);

            return {
                past: [...state.past, state.collageItems],
                future: [],
                collageItems: finalItems
            };
        }),

    updateCollageItem: (id, updates) =>
        set((state) => {
            // Optimization: Maybe only push history on drag end (already happening implicitly via separate high-level updates? drag updates happen frequently)
            // Ideally we debounce history for drags, but for now let's push.
            // Wait, this will flood history during drag.
            // The Canvas handles drag end update.
            return {
                past: [...state.past, state.collageItems],
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

            return {
                past: [...state.past, state.collageItems],
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

            // If in a managed layout mode, re-apply layout with new settings (padding etc)
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
            // When resizing, re-calculate positions.
            // Use Mosaic layout if in Mosaic mode, otherwise default to Grid algorithm (even for Free mode)
            // to ensure items fit in the new canvas size.
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
            // Simple shuffle:
            const shuffled = [...state.collageItems].sort(() => Math.random() - 0.5);

            // Re-run current layout mode
            // If strictly 'free' we might default to grid, or arguably just shuffle Z-index? 
            // The user expectation "Shuffle" usually implies position shuffle in a layout.
            // Let's default to Grid if free, else use current mode.
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

            // If we are in a structured layout, re-calculate positions immediately
            const finalItems = recalculateLayoutIfActive(newItems, state.layoutMode, state.canvasSettings);
            return { collageItems: finalItems };
        }),
}));
