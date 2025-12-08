import type { StateCreator } from 'zustand';
import type { CanvasSlice } from './canvasSlice';

export interface UISlice {
    uploadedImages: string[];
    addUploadedImage: (src: string) => void;
    removeUploadedImage: (src: string) => void;
    selectedItemId: string | null;
    setSelectedItemId: (id: string | null) => void;
}

// Optimization: We can access other slices here if needed, but UI slice is mostly independent
export const createUISlice: StateCreator<UISlice & CanvasSlice, [], [], UISlice> = (set) => ({
    uploadedImages: [],
    selectedItemId: null,

    setSelectedItemId: (id) => set({ selectedItemId: id }),

    addUploadedImage: (src) =>
        set((state) => ({ uploadedImages: [...state.uploadedImages, src] })),

    removeUploadedImage: (src) =>
        set((state) => ({
            uploadedImages: state.uploadedImages.filter((s) => s !== src),
        })),
});
