import { describe, it, expect, vi, afterEach } from 'vitest';
import { downloadCollage } from './exportUtils';
import Konva from 'konva';

describe('downloadCollage', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should not do anything if stage is null', () => {
        const result = downloadCollage(null as unknown as Konva.Stage);
        expect(result).toBeUndefined();
    });

    it('should download collage', () => {
        const mockToDataURL = vi.fn().mockReturnValue('data:image/jpeg;base64,fake');
        const stage = {
            toDataURL: mockToDataURL,
        } as unknown as Konva.Stage;

        const mockLink = {
            click: vi.fn(),
            download: '',
            href: '',
        };
        const mockCreateElement = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLAnchorElement);
        const mockAppend = vi.spyOn(document.body, 'appendChild').mockReturnValue(mockLink as unknown as HTMLAnchorElement);
        const mockRemove = vi.spyOn(document.body, 'removeChild').mockReturnValue(mockLink as unknown as HTMLAnchorElement);

        downloadCollage(stage);

        expect(mockToDataURL).toHaveBeenCalledWith({
            pixelRatio: 3,
            mimeType: 'image/jpeg',
            quality: 0.9,
        });
        expect(mockCreateElement).toHaveBeenCalledWith('a');
        expect(mockLink.download).toMatch(/collage-\d+\.jpg/);
        expect(mockLink.href).toBe('data:image/jpeg;base64,fake');
        expect(mockAppend).toHaveBeenCalledWith(mockLink);
        expect(mockLink.click).toHaveBeenCalled();
        expect(mockRemove).toHaveBeenCalledWith(mockLink);
    });
});
