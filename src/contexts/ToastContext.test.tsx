import { render, screen, act, renderHook, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ToastProvider, useToast } from './ToastContext';

// Mock framer-motion to skip animations
vi.mock('framer-motion', () => ({
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
        div: ({ children, className, ...props }: React.ComponentProps<'div'>) => <div className={className} {...props}>{children}</div>
    }
}));

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

    it('should add and display toasts with default type info', async () => {
        render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>
        );

        // Manually trigger addToast with default
        const { result } = renderHook(() => useToast(), {
            wrapper: ToastProvider
        });

        act(() => {
            result.current.addToast('Default Message');
        });

        const toast = screen.getByText('Default Message');
        expect(toast).toBeDefined();
        // Check for info icon/style
        const container = toast.closest('div');
        expect(container?.className).toContain('border-indigo-500/20'); // Info style
    });

    it('should auto-dismiss toasts after duration', async () => {
        render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>
        );

        const { result } = renderHook(() => useToast(), {
            wrapper: ToastProvider
        });

        act(() => {
            result.current.addToast('Auto Dismiss', 'error', 1000);
        });

        expect(screen.getByText('Auto Dismiss')).toBeDefined();

        // Fast forward time for duration AND animation
        act(() => {
            vi.advanceTimersByTime(1000 + 500);
        });

        expect(screen.queryByText('Auto Dismiss')).toBeNull();
    });

    it('should NOT auto-dismiss if duration is 0', async () => {
        const { result } = renderHook(() => useToast(), {
            wrapper: ToastProvider
        });

        act(() => {
            result.current.addToast('Persistent', 'success', 0);
        });

        expect(screen.getByText('Persistent')).toBeDefined();

        act(() => {
            vi.advanceTimersByTime(5000);
        });

        expect(screen.getByText('Persistent')).toBeDefined();
    });

    it('should remove toast manually', async () => {
        render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>
        );

        fireEvent.click(screen.getByText('Add Success'));
        // Wait for toast to appear
        const toast = screen.getByText('Success Message');

        const closeBtn = toast.parentElement?.querySelector('button');
        expect(closeBtn).toBeDefined();

        if (closeBtn) {
            fireEvent.click(closeBtn);
            // Advance for animation
            act(() => {
                vi.advanceTimersByTime(500);
            });
            expect(screen.queryByText('Success Message')).toBeNull();
        }
    });
});
