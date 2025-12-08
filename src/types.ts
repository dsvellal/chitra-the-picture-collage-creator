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
