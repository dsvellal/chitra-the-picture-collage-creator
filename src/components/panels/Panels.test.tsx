import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCollageStore } from '../../store/collageStore';

// Mock dependencies
vi.mock('../../store/collageStore', () => ({
    useCollageStore: vi.fn()
}));
vi.mock('lucide-react', () => ({
    Upload: () => <div>Icon</div>,
    Plus: () => <div>Icon</div>,
    Trash2: () => <div>Icon</div>,
    Layers: () => <div>Icon</div>,
    Grid: () => <div>Icon</div>,
    Shuffle: () => <div>Icon</div>,
    Type: () => <div>Icon</div>,
    Smile: () => <div>Icon</div>,
    Sliders: () => <div>Icon</div>,
    Maximize2: () => <div>Icon</div>,
    RotateCw: () => <div>Icon</div>,
    FlipHorizontal: () => <div>Icon</div>,
    FlipVertical: () => <div>Icon</div>,
    Image: () => <div>Icon</div>,
    Sun: () => <div>Icon</div>,
    Maximize: () => <div>Icon</div>,
    Palette: () => <div>Icon</div>,
    Move: () => <div>Icon</div>,
    Layout: () => <div>Icon</div>,
    Sticker: () => <div>Icon</div>,
    ChevronDown: () => <div>Icon</div>,
    ChevronRight: () => <div>Icon</div>,
    Contrast: () => <div>Icon</div>,
}));

// Import Panels
import { UploadsPanel } from './UploadsPanel';
import { LayoutsPanel } from './LayoutsPanel';
import { TextPanel } from './TextPanel';
import { StickersPanel } from './StickersPanel';
import { CanvasProperties } from './CanvasProperties';
import { TextProperties } from './TextProperties';
import { ImageProperties } from './ImageProperties';

describe('Panels', () => {
    const mockStore = {
        uploadedImages: ['test.jpg'],
        collageItems: [],
        canvasSettings: { width: 1000, height: 1000, padding: 10, borderRadius: 0, backgroundColor: '#fff' },
        addUploadedImage: vi.fn(),
        removeUploadedImage: vi.fn(),
        addCollageItem: vi.fn(),
        setCanvasSettings: vi.fn(),
        resizeCanvas: vi.fn(),
        applyLayout: vi.fn(),
        shuffleLayout: vi.fn(),
        updateCollageItem: vi.fn(),
        selectedItemId: null
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useCollageStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: unknown) => {
            // If selector provided, mock return
            if (selector) return (selector as (s: unknown) => unknown)(mockStore);
            return mockStore;
        });
    });

    it('renders UploadsPanel', () => {
        render(<UploadsPanel />);
        // Basic exist check
        expect(screen.getAllByText('Icon').length).toBeGreaterThan(0);
    });

    it('renders LayoutsPanel', () => {
        render(<LayoutsPanel />);
        const gridBtn = screen.getByText('Grid');
        fireEvent.click(gridBtn);
        expect(mockStore.applyLayout).toHaveBeenCalledWith('grid');
    });

    it('renders TextPanel', () => {
        render(<TextPanel />);
        const addHead = screen.getByText('Heading');
        fireEvent.click(addHead);
        expect(mockStore.addCollageItem).toHaveBeenCalled();
    });

    it('renders StickersPanel', () => {
        render(<StickersPanel />);
        const shapesBtn = screen.getByText('Shapes');
        fireEvent.click(shapesBtn);
        expect(screen.getAllByRole('img')).toBeDefined();
    });

    it('renders CanvasProperties', () => {
        render(<CanvasProperties settings={mockStore.canvasSettings} onUpdate={mockStore.setCanvasSettings} />);
        expect(screen.getByText('Canvas Settings')).toBeDefined();
    });

    it('renders TextProperties', () => {
        const textItem = { id: '1', type: 'text', text: 'Hello', fontSize: 20, fill: '#000', scale: 1, rotation: 0 };
        render(<TextProperties item={textItem as unknown as import('../../store/collageStore').CollageItem} onUpdate={mockStore.updateCollageItem} />);
        expect(screen.getByDisplayValue('Hello')).toBeDefined();
    });

    it('renders ImageProperties', () => {
        const imgItem = { id: '1', type: 'image', width: 100, height: 100, scale: 1, rotation: 0 };
        render(<ImageProperties item={imgItem as unknown as import('../../store/collageStore').CollageItem} onUpdate={mockStore.updateCollageItem} />);
        expect(screen.getByText('Filters')).toBeDefined();
    });
});
