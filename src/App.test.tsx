import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import App from './App';
import { ToastProvider } from './contexts/ToastContext';
import { useCollageStore } from './store/collageStore';
import React from 'react';

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
            if (initial === null) {
                return { current: mockStage };
            }
            return { current: initial };
        },
        useState: actual.useState
    };
});

const renderApp = () => {
    return render(
        <ToastProvider>
            <App />
        </ToastProvider>
    );
};

describe('App', () => {
    const mockUpdate = vi.fn();
    const mockSetSelected = vi.fn();

    beforeEach(() => {
        vi.useFakeTimers();
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

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should call updateCollageItem', () => {
        renderApp();
        expect(((useCollageStore as unknown as { getState: () => { setSelectedItemId: unknown } }).getState()).setSelectedItemId).toBeDefined();
    });

    it('should render panels', () => {
        renderApp();
        expect(screen.getByTestId('layout')).toBeDefined();
        expect(screen.getByTestId('left-panel')).toBeDefined();
        expect(screen.getByTestId('right-panel')).toBeDefined();
        expect(screen.getByTestId('collage-canvas')).toBeDefined();
    });

    it('should handle crop modal flow', () => {
        renderApp();

        // Trigger edit
        fireEvent.click(screen.getByTestId('edit-btn'));
        expect(screen.getByTestId('crop-modal')).toBeDefined();

        // Apply
        fireEvent.click(screen.getByText('Apply'));
        expect(mockUpdate).toHaveBeenCalledWith('1', { crop: { x: 0, y: 0, width: 10, height: 10 } });
    });

    it('should handle export', async () => {
        renderApp();
        const exportBtn = screen.getByTestId('export-btn');

        // Mock fallback download
        const originalCreateElement = document.createElement.bind(document);
        const createElementSpy = vi.spyOn(document, 'createElement');
        const clickSpy = vi.fn();

        createElementSpy.mockImplementation((tag) => {
            if (tag === 'a') {
                return {
                    click: clickSpy,
                    setAttribute: vi.fn(),
                    download: '',
                    href: ''
                } as unknown as HTMLAnchorElement;
            }
            return originalCreateElement(tag);
        });

        document.body.appendChild = vi.fn();
        document.body.removeChild = vi.fn();

        fireEvent.click(exportBtn);

        // Should not have exported yet (debounce/timeout check)
        expect(mockStage.toDataURL).not.toHaveBeenCalled();

        // Export happens in timeout
        await act(async () => {
            vi.advanceTimersByTime(150);
        });

        expect(mockSetSelected).toHaveBeenCalledWith(null);
        expect(mockStage.toDataURL).toHaveBeenCalledWith({ pixelRatio: 2 });
        // Check download trigger
        expect(createElementSpy).toHaveBeenCalledWith('a');
    });
});
