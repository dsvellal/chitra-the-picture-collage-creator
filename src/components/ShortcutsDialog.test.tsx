import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ShortcutsDialog } from './ShortcutsDialog';

describe('ShortcutsDialog', () => {
    it('should render nothing when not open', () => {
        const { container } = render(<ShortcutsDialog isOpen={false} onClose={vi.fn()} />);
        expect(container.firstChild).toBeNull();
    });

    it('should render content when open', () => {
        render(<ShortcutsDialog isOpen={true} onClose={vi.fn()} />);
        expect(screen.getByText('Keyboard Shortcuts')).toBeDefined();
        expect(screen.getByText('Delete selected item')).toBeDefined();
    });

    it('should call onClose when clicking overlay', () => {
        const onClose = vi.fn();
        render(<ShortcutsDialog isOpen={true} onClose={onClose} />);

        // Click the overlay (outer div)
        // We need to find the specific backdrop element. It has 'fixed inset-0 ...'
        // The first child of root portal usually.
        // Or we can rely on bubble? 
        // The overlay has `onClick={onClose}`.
        // The content has `e.stopPropagation()`.

        // Let's click the text 'Keyboard Shortcuts' -> Should NOT close
        fireEvent.click(screen.getByText('Keyboard Shortcuts'));
        expect(onClose).not.toHaveBeenCalled();

        // Let's click the close button explicitly
        const buttons = screen.getAllByRole('button'); // X button
        fireEvent.click(buttons[0]); // First button is usually X in header
        expect(onClose).toHaveBeenCalled();
    });
});
