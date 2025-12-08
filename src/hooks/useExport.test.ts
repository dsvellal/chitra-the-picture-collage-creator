import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Konva from 'konva';
import { useExport } from './useExport';
import { useCollageStore } from '../store/collageStore';
import { fileSystemService } from '../services/FileSystemService';

// Mock dependencies
vi.mock('../store/collageStore', () => ({
    useCollageStore: vi.fn()
}));

const mockAddToast = vi.fn();
vi.mock('../contexts/ToastContext', () => ({
    useToast: () => ({ addToast: mockAddToast })
}));

// Mock FileSystemService
vi.mock('../services/FileSystemService', () => ({
    fileSystemService: {
        saveFile: vi.fn()
    }
}));

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
    });

    afterEach(() => {
        global.fetch = originalFetch;
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('should export using FileSystemService', async () => {
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

        // Verify Service Call
        expect(fileSystemService.saveFile).toHaveBeenCalledWith(
            expect.any(Blob),
            expect.stringMatching(/Chitra_Premium_\d{4}-\d{2}-\d{2}_[\d-]+\.png/),
            expect.objectContaining({
                types: [{
                    description: 'PNG Image',
                    accept: { 'image/png': ['.png'] }
                }]
            })
        );

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
        expect(fileSystemService.saveFile).not.toHaveBeenCalled();
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
