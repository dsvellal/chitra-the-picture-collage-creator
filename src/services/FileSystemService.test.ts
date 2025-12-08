
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
// cspell:ignore unstub
import { BrowserFileSystemService } from './FileSystemService';

describe('BrowserFileSystemService', () => {
    let service: BrowserFileSystemService;

    beforeEach(() => {
        service = new BrowserFileSystemService();
        vi.clearAllMocks();
        // Reset URL mocks
        vi.stubGlobal('URL', {
            createObjectURL: vi.fn(() => 'blob:url'),
            revokeObjectURL: vi.fn(),
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('should use showSaveFilePicker if available', async () => {
        const mockWrite = vi.fn();
        const mockClose = vi.fn();
        const mockHandle = {
            createWritable: vi.fn().mockResolvedValue({
                write: mockWrite,
                close: mockClose,
            }),
        };
        const showSaveFilePicker = vi.fn().mockResolvedValue(mockHandle);
        Object.defineProperty(window, 'showSaveFilePicker', {
            value: showSaveFilePicker,
            configurable: true
        });

        const blob = new Blob(['test']);
        await service.saveFile(blob, 'test.png', { types: [] });

        expect(showSaveFilePicker).toHaveBeenCalled();
        expect(mockHandle.createWritable).toHaveBeenCalled();
        expect(mockWrite).toHaveBeenCalledWith(blob);
        expect(mockClose).toHaveBeenCalled();
    });

    it('should handle AbortError in showSaveFilePicker gracefully', async () => {
        const abortError = new Error('User cancelled');
        abortError.name = 'AbortError';
        const showSaveFilePicker = vi.fn().mockRejectedValue(abortError);

        Object.defineProperty(window, 'showSaveFilePicker', {
            value: showSaveFilePicker,
            configurable: true
        });

        const blob = new Blob(['test']);
        // Should not throw
        await expect(service.saveFile(blob, 'test.png')).resolves.not.toThrow();
        expect(showSaveFilePicker).toHaveBeenCalled();
    });

    it('should throw unknown errors in showSaveFilePicker', async () => {
        const genericError = new Error('Disk full');
        const showSaveFilePicker = vi.fn().mockRejectedValue(genericError);

        Object.defineProperty(window, 'showSaveFilePicker', {
            value: showSaveFilePicker,
            configurable: true
        });

        const blob = new Blob(['test']);
        await expect(service.saveFile(blob, 'test.png')).rejects.toThrow('Disk full');
    });

    it('should fallback to anchor download if showSaveFilePicker unavailable', async () => {
        // Remove showSaveFilePicker
        Object.defineProperty(window, 'showSaveFilePicker', {
            value: undefined,
            configurable: true
        });

        const clickSpy = vi.fn();
        // Create a REAL element so appendChild accepts it
        const realAnchor = document.createElement('a');
        realAnchor.click = clickSpy;

        const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(realAnchor);
        const appendSpy = vi.spyOn(document.body, 'appendChild');
        const removeSpy = vi.spyOn(document.body, 'removeChild');

        const blob = new Blob(['test']);
        await service.saveFile(blob, 'test.png');

        expect(createElementSpy).toHaveBeenCalledWith('a');
        expect(realAnchor.download).toBe('test.png');
        expect(realAnchor.href).toBe('blob:url');
        expect(appendSpy).toHaveBeenCalledWith(realAnchor);
        expect(clickSpy).toHaveBeenCalled();
        expect(removeSpy).toHaveBeenCalledWith(realAnchor);
        expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:url');
    });
});
