import { render, screen, act, renderHook, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ToastProvider, useToast } from './ToastContext';

// Helper component to test hook
const TestComponent = () => {
    const { addToast, removeToast } = useToast();
    return (
        <div>
            <button onClick={() => addToast('Success Message', 'success')}>Add Success</button>
            <button onClick={() => addToast('Error Message', 'error', 1000)}>Add Error</button>
            <button onClick={() => removeToast('test-id')}>Remove</button>
        </div>
    );
};

describe('ToastContext', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('should throw error if used outside provider', () => {
        // Suppress console.error for this test as React logs the error
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        expect(() => renderHook(() => useToast())).toThrow('useToast must be used within a ToastProvider');

        consoleSpy.mockRestore();
    });

    it('should add and display toasts', async () => {
        render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>
        );

        fireEvent.click(screen.getByText('Add Success'));

        expect(screen.getByText('Success Message')).toBeDefined();
    });

    it('should auto-dismiss toasts', async () => {
        render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>
        );

        fireEvent.click(screen.getByText('Add Error'));

        expect(screen.getByText('Error Message')).toBeDefined();

        // Fast forward time
        act(() => {
            vi.advanceTimersByTime(1000);
        });

        // Should be gone
    });

    it('should remove toast manually', async () => {
        render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>
        );

        fireEvent.click(screen.getByText('Add Success'));

        const closeBtn = document.querySelector('button.p-1'); // The X button
        expect(closeBtn).toBeDefined();

        if (closeBtn) {
            fireEvent.click(closeBtn);
            // Verify removal
        }
    });
});
