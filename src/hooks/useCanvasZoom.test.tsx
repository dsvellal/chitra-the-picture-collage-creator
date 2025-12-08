import { renderHook, act, render, screen, fireEvent } from '@testing-library/react';
import { useEffect } from 'react';
import { describe, it, expect } from 'vitest';
import { useCanvasZoom } from './useCanvasZoom';

describe('useCanvasZoom', () => {
    it('should initialize zoom', () => {
        const { result } = renderHook(() => useCanvasZoom());
        expect(result.current.zoom).toBe(1);
    });

    it('should handle zoom change', () => {
        const { result } = renderHook(() => useCanvasZoom());
        act(() => {
            result.current.handleZoom(0.1);
        });
        expect(result.current.zoom).toBe(1.1);

        act(() => {
            result.current.setZoom(2);
        });
        expect(result.current.zoom).toBe(2);
    });

    it('should clamp zoom', () => {
        const { result } = renderHook(() => useCanvasZoom());
        act(() => {
            result.current.handleZoom(10); // +10 to current 1
        });
        expect(result.current.zoom).toBe(5); // Max

        act(() => {
            result.current.handleZoom(-10);
        });
        expect(result.current.zoom).toBe(0.1); // Min
    });



    it('should handle wheel zoom via ref', () => {
        let hookResult: { zoom: number } | undefined;
        const TestComp = () => {
            const { containerRef, ...rest } = useCanvasZoom();
            useEffect(() => {
                hookResult = { zoom: rest.zoom };
            });
            return <div ref={containerRef} data-testid="zoom-container" />;
        };

        render(<TestComp />);
        const container = screen.getByTestId('zoom-container');

        // Zoom in (Ctrl + Wheel Up/Negative)
        fireEvent.wheel(container, { deltaY: -100, ctrlKey: true });
        expect(hookResult!.zoom).toBeGreaterThan(1); // 1.1

        // Zoom out (Ctrl + Wheel Down/Positive)
        fireEvent.wheel(container, { deltaY: 100, ctrlKey: true });
        expect(hookResult!.zoom).toBeCloseTo(1);
    });

    it('should ignore wheel without ctrl/meta', () => {
        let hookResult: { zoom: number } | undefined;
        const TestComp = () => {
            const { containerRef, ...rest } = useCanvasZoom();
            useEffect(() => {
                hookResult = { zoom: rest.zoom };
            });
            return <div ref={containerRef} data-testid="zoom-container" />;
        };

        render(<TestComp />);
        const container = screen.getByTestId('zoom-container');

        const preventDefault = vi.fn();
        const event = new WheelEvent('wheel', {
            deltaY: -100,
            ctrlKey: false,
            metaKey: false,
            cancelable: true
        });

        Object.defineProperty(event, 'preventDefault', { value: preventDefault });

        act(() => {
            container.dispatchEvent(event);
        });

        expect(preventDefault).not.toHaveBeenCalled();
        expect(hookResult!.zoom).toBe(1); // Ensure zoom didn't change
    });
});
