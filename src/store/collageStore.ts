import { create } from 'zustand';
import { createUISlice, type UISlice } from './slices/uiSlice';
import { createCanvasSlice, type CanvasSlice } from './slices/canvasSlice';

export type CollageState = UISlice & CanvasSlice;

export const useCollageStore = create<CollageState>()((...a) => ({
    ...createUISlice(...a),
    ...createCanvasSlice(...a),
}));

export type { CollageItem, CanvasSettings } from '../types';
