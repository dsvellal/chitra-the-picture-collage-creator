import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Konva from 'konva';
import { useCanvasDrop } from './useCanvasDrop';
import { useCollageStore } from '../store/collageStore';
import { processDroppedImages } from '../utils/imageProcessing';

// Mock dependencies
vi.mock('../store/collageStore', () => ({
    useCollageStore: vi.fn()
}));
vi.mock('../utils/imageProcessing', () => ({
    processDroppedImages: vi.fn()
}));

describe('useCanvasDrop', () => {
    const mockAddItems = vi.fn();
    const mockAddItem = vi.fn();
    const mockStageRef = {
        current: {
            getPointerPosition: vi.fn(),
            setPointersPositions: vi.fn(),
            getRelativePointerPosition: vi.fn(() => ({ x: 100, y: 100 }))
        }
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useCollageStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
            addCollageItem: mockAddItem,
            addCollageItems: mockAddItems,
            collageItems: [],
            canvasSettings: {}
        });
    });

    const setupHook = (stageRef: React.RefObject<Konva.Stage | null> = mockStageRef as unknown as React.RefObject<Konva.Stage | null>) => {
        return renderHook(() => useCanvasDrop(stageRef));
    };

    it('should handle drop with single image src', () => {
        const { result } = setupHook();
        const mockEvent = {
            preventDefault: vi.fn(),
            dataTransfer: {
                getData: (key: string) => key === 'imageSrc' ? 'test.jpg' : ''
            }
        };

        act(() => {
            result.current.handleDrop(mockEvent as unknown as React.DragEvent<HTMLDivElement>);
        });

        expect(mockEvent.preventDefault).toHaveBeenCalled();
        expect(processDroppedImages).toHaveBeenCalledWith(
            ['test.jpg'],
            expect.anything(),
            expect.anything(),
            { x: 100, y: 100 },
            expect.anything(),
            expect.anything()
        );
    });

    it('should handle invalid JSON in drop', () => {
        const { result } = setupHook();
        const mockEvent = {
            preventDefault: vi.fn(),
            dataTransfer: {
                getData: vi.fn((type) => {
                    if (type === 'imageSrcs') return '{invalid:json}';
                    return null;
                })
            }
        };
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        result.current.handleDrop(mockEvent as unknown as React.DragEvent<HTMLDivElement>);
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });

    it('should handle drop with multiple images json', () => {
        const { result } = setupHook();
        const srcs = ['img1.jpg', 'img2.jpg'];
        const mockEvent = {
            preventDefault: vi.fn(),
            dataTransfer: {
                getData: (key: string) => key === 'imageSrcs' ? JSON.stringify(srcs) : null
            }
        };

        act(() => {
            result.current.handleDrop(mockEvent as unknown as React.DragEvent<HTMLDivElement>);
        });

        expect(processDroppedImages).toHaveBeenCalledWith(
            srcs, expect.anything(), expect.anything(), expect.anything(), expect.anything(), expect.anything()
        );
    });

    it('should handle drag over', () => {
        const { result } = setupHook();
        const mockEvent = { preventDefault: vi.fn() };

        result.current.handleDragOver(mockEvent as unknown as React.DragEvent<HTMLDivElement>);
        expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should handle drop with null stage', () => {
        const { result } = setupHook({ current: null } as unknown as React.RefObject<Konva.Stage | null>);
        const mockEvent = { preventDefault: vi.fn(), dataTransfer: { getData: vi.fn() } };

        result.current.handleDrop(mockEvent as unknown as React.DragEvent<HTMLDivElement>);
        expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should handle drop with null pointer position', () => {
        const mockStageNoPointer = {
            current: {
                setPointersPositions: vi.fn(),
                getRelativePointerPosition: vi.fn(() => null)
            }
        };

        const { result } = setupHook(mockStageNoPointer as unknown as React.RefObject<Konva.Stage | null>);
        const mockEvent = { preventDefault: vi.fn(), dataTransfer: { getData: vi.fn() } };

        result.current.handleDrop(mockEvent as unknown as React.DragEvent<HTMLDivElement>);
        expect(mockStageNoPointer.current.getRelativePointerPosition).toHaveBeenCalled();
    });
    it('should ignore empty array in JSON', () => {
        const { result } = setupHook();
        const mockEvent = {
            preventDefault: vi.fn(),
            dataTransfer: {
                getData: (key: string) => key === 'imageSrcs' ? '[]' : ''
            }
        };

        act(() => {
            result.current.handleDrop(mockEvent as unknown as React.DragEvent<HTMLDivElement>);
        });

        expect(processDroppedImages).not.toHaveBeenCalled();
    });

    it('should use imageSrcs if both present', () => {
        const { result } = setupHook();
        const srcs = ['img1.jpg'];
        const mockEvent = {
            preventDefault: vi.fn(),
            dataTransfer: {
                getData: (key: string) => {
                    if (key === 'imageSrcs') return JSON.stringify(srcs);
                    if (key === 'imageSrc') return 'single.jpg';
                    return '';
                }
            }
        };

        act(() => {
            result.current.handleDrop(mockEvent as unknown as React.DragEvent<HTMLDivElement>);
        });

        expect(processDroppedImages).toHaveBeenCalledWith(
            ['img1.jpg'], expect.anything(), expect.anything(), expect.anything(), expect.anything(), expect.anything()
        );
        // Verify we didn't call it again for singleSrc?
        // processDroppedImages is mocked fn.
        expect(processDroppedImages).toHaveBeenCalledTimes(1);
    });

    it('should handle drop with no data', () => {
        const { result } = setupHook();
        const mockEvent = {
            preventDefault: vi.fn(),
            dataTransfer: {
                getData: () => ''
            }
        };

        act(() => {
            result.current.handleDrop(mockEvent as unknown as React.DragEvent<HTMLDivElement>);
        });

        expect(processDroppedImages).not.toHaveBeenCalled();
    });
});
