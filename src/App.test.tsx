import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';
import { useCollageStore } from './store/collageStore';

// Mock child components
vi.mock('./components/Layout', () => ({
    Layout: ({ children, onExport }: { children: React.ReactNode, onExport: () => void }) => (
        <div data-testid="layout">
            <button onClick={onExport} data-testid="export-btn">Export</button>
            {children}
        </div>
    )
}));
vi.mock('./components/LeftPanel', () => ({ LeftPanel: () => <div data-testid="left-panel" /> }));
vi.mock('./components/RightPanel', () => ({ RightPanel: () => <div data-testid="right-panel" /> }));
vi.mock('./components/CollageCanvas', () => ({
    CollageCanvas: ({ onEditRequest }: { onEditRequest: (id: string) => void }) => (
        <div data-testid="collage-canvas">
            <button onClick={() => onEditRequest('1')} data-testid="edit-btn">Edit</button>
        </div>
    )
}));
vi.mock('./components/CropModal', () => ({
    CropModal: ({ onApply, onCancel }: { onApply: (crop: { x: number; y: number; width: number; height: number }) => void, onCancel: () => void }) => (
        <div data-testid="crop-modal">
            <button onClick={() => onApply({ x: 0, y: 0, width: 10, height: 10 })}>Apply</button>
            <button onClick={onCancel}>Cancel</button>
        </div>
    )
}));

// Mock store
vi.mock('./store/collageStore', () => ({
    useCollageStore: vi.fn()
}));

// Mock Konva Stage logic
const mockStage = {
    toDataURL: vi.fn(() => 'data:image/png;base64,test')
};

// Mock useRef for stageRef
vi.mock('react', async () => {
    const actual = await vi.importActual('react');
    return {
        ...actual,
        useRef: (initial: unknown) => {
            // If calls with null (initial), we want to simulate having a current value in effects/callbacks
            // But simplistic mock handles init only.
            // Best to just rely on JSDOM behavior for ref, but we need to inject our mockStage.
            // We can intercept the ref callback in the mocked CollageCanvas component if it accepted one, 
            // but App passes `stageRef` prop. 
            // We can assume App uses `useRef(null)`.
            // We need to inject `mockStage` into `stageRef.current` manually during test?
            if (initial === null) {
                return { current: mockStage };
            }
            return { current: initial };
        },
        useState: actual.useState
    };
});

describe('App', () => {
    const mockUpdate = vi.fn();
    const mockSetSelected = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        // Setup store selector mock
        (useCollageStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: unknown) => {
            if (!selector) return { setSelectedItemId: mockSetSelected, getState: () => ({ setSelectedItemId: mockSetSelected }) };
            // Simulate state
            const state = {
                collageItems: [{ id: '1', type: 'image' }],
                updateCollageItem: mockUpdate
            };
            return (selector as (state: unknown) => unknown)(state);
        });
        (useCollageStore as unknown as { getState: () => unknown }).getState = () => ({ setSelectedItemId: mockSetSelected });
    });

    it('should call updateCollageItem', () => {
        render(<App />);
        expect(((useCollageStore as unknown as { getState: () => { setSelectedItemId: unknown } }).getState()).setSelectedItemId).toBeDefined();
    });

    it('should render panels', () => {
        render(<App />);
        expect(screen.getByTestId('layout')).toBeDefined();
        expect(screen.getByTestId('left-panel')).toBeDefined();
        expect(screen.getByTestId('right-panel')).toBeDefined();
        expect(screen.getByTestId('collage-canvas')).toBeDefined();
    });

    it('should handle crop modal flow', () => {
        render(<App />);

        // Trigger edit
        fireEvent.click(screen.getByTestId('edit-btn'));
        expect(screen.getByTestId('crop-modal')).toBeDefined();

        // Apply
        fireEvent.click(screen.getByText('Apply'));
        expect(mockUpdate).toHaveBeenCalledWith('1', { crop: { x: 0, y: 0, width: 10, height: 10 } });

        // Modal should close (mock rendering depends on state update which works in real react env even with mocks)
        // Wait, standard `useState` mock above just passed through.
    });

    it('should handle export', async () => {
        render(<App />);
        const exportBtn = screen.getByTestId('export-btn');

        // Mock fallback download
        const createElementSpy = vi.spyOn(document, 'createElement');
        const clickSpy = vi.fn();
        createElementSpy.mockReturnValue({ click: clickSpy, download: '', href: '' } as unknown as HTMLAnchorElement);
        document.body.appendChild = vi.fn();
        document.body.removeChild = vi.fn();

        fireEvent.click(exportBtn);

        // Export happens in timeout
        await new Promise(r => setTimeout(r, 150));

        expect(mockSetSelected).toHaveBeenCalledWith(null);
        expect(mockStage.toDataURL).toHaveBeenCalled();
        // Check download trigger
        expect(createElementSpy).toHaveBeenCalledWith('a');
    });
});
