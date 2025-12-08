import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Konva from 'konva';
import { useExport } from './useExport';
import { useCollageStore } from '../store/collageStore';

// Mock dependencies
vi.mock('../store/collageStore', () => ({
    useCollageStore: vi.fn()
}));

const mockAddToast = vi.fn();
vi.mock('../contexts/ToastContext', () => ({
    useToast: () => ({ addToast: mockAddToast })
}));

// Mock Window extension
interface ExtendedWindow extends Window {
    showSaveFilePicker?: (options?: unknown) => Promise<{
        createWritable: () => Promise<{
            write: (blob: Blob) => Promise<void>;
            close: () => Promise<void>;
        }>;
    }>;
}

describe('useExport', () => {
    const mockSetSelectedItemId = vi.fn();
    const mockStats = { setSelectedItemId: mockSetSelectedItemId };

    // Mock Stage
    const mockToDataURL = vi.fn(() => 'data:image/png;base64,test');

    // STRICT TYPE MOCK
    const mockStage = {
        toDataURL: mockToDataURL,
    } as unknown as Konva.Stage;

    const mockStageRef = {
        current: mockStage
    };

    // Global mocks
    const originalFetch = global.fetch;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
        (useCollageStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockStats);

        // Mock fetch for blob creation
        global.fetch = vi.fn(() => Promise.resolve({
            blob: () => Promise.resolve(new Blob(['test'], { type: 'image/png' }))
        })) as unknown as typeof fetch;

        vi.spyOn(HTMLAnchorElement.prototype, 'setAttribute');

        const originalCreateElement = document.createElement.bind(document);
        vi.spyOn(document, 'createElement').mockImplementation((tag) => {
            const el = originalCreateElement(tag);
            if (tag === 'a') {
                vi.spyOn(el, 'click');
            }
            return el;
        });
        vi.spyOn(document.body, 'appendChild');
        vi.spyOn(document.body, 'removeChild');

        // Ensure showSaveFilePicker is undefined by default
        delete (window as unknown as ExtendedWindow).showSaveFilePicker;
    });

    afterEach(() => {
        global.fetch = originalFetch;
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('should export using fallback method when showSaveFilePicker is not available', async () => {
        const { result } = renderHook(() => useExport(mockStageRef));

        await act(async () => {
            await result.current.exportCollage();
        });

        // Should wait for timeout
        expect(mockSetSelectedItemId).toHaveBeenCalledWith(null);
        expect(mockToDataURL).not.toHaveBeenCalled();

        await act(async () => {
            vi.advanceTimersByTime(150);
        });

        expect(mockToDataURL).toHaveBeenCalledWith({ pixelRatio: 2 });
        expect(document.body.appendChild).toHaveBeenCalled();

        expect(HTMLAnchorElement.prototype.setAttribute).toHaveBeenCalledWith('download', expect.stringMatching(/Chitra_Premium_\d{4}-\d{2}-\d{2}_[\d-]+\.png/));
        expect(HTMLAnchorElement.prototype.setAttribute).toHaveBeenCalledWith('href', 'data:image/png;base64,test');

        expect(document.body.removeChild).toHaveBeenCalled();
        expect(mockAddToast).toHaveBeenCalledWith('Export downloaded', 'success');
    });

    it('should use showSaveFilePicker if available', async () => {
        const mockWrite = vi.fn();
        const mockClose = vi.fn();
        const mockCreateWritable = vi.fn().mockResolvedValue({
            write: mockWrite,
            close: mockClose
        });

        // Mock the API (need to mock BEFORE renderHook if possible, but here it's window method)
        // Note: showSaveFilePicker needs to be defined
        (window as unknown as ExtendedWindow).showSaveFilePicker = vi.fn().mockResolvedValue({
            createWritable: mockCreateWritable
        });

        const { result } = renderHook(() => useExport(mockStageRef));

        await act(async () => {
            await result.current.exportCollage();
            vi.advanceTimersByTime(150);
        });

        expect((window as unknown as ExtendedWindow).showSaveFilePicker).toHaveBeenCalledWith(
            expect.objectContaining({
                suggestedName: expect.stringMatching(/Chitra_Premium_\d{4}-\d{2}-\d{2}_[\d-]+\.png/),
                types: [{
                    description: 'PNG Image',
                    accept: { 'image/png': ['.png'] }
                }]
            })
        );
        expect(mockCreateWritable).toHaveBeenCalled();
        expect(mockWrite).toHaveBeenCalled();
        expect(mockClose).toHaveBeenCalled();
        expect(mockAddToast).toHaveBeenCalledWith('Collage exported successfully!', 'success');
    });

    it('should handle export error gracefully', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        mockToDataURL.mockImplementationOnce(() => { throw new Error('Konva Error'); });

        const { result } = renderHook(() => useExport(mockStageRef));

        await act(async () => {
            await result.current.exportCollage();
            vi.advanceTimersByTime(150);
        });

        expect(consoleSpy).toHaveBeenCalledWith('Export failed:', expect.any(Error));
        expect(mockAddToast).toHaveBeenCalledWith('Failed to export collage', 'error');
        consoleSpy.mockRestore();
    });

    it('should do nothing if stageRef is null', async () => {
        const { result } = renderHook(() => useExport({ current: null }));

        await act(async () => {
            await result.current.exportCollage();
            vi.advanceTimersByTime(150);
        });

        expect(mockToDataURL).not.toHaveBeenCalled();
    });
});
