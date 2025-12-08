import { useEffect } from 'react';
import { useCollageStore } from '../store/collageStore';

export const useCanvasShortcuts = () => {
    const { removeCollageItem, selectedItemId, setSelectedItemId, undo, redo } = useCollageStore();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedItemId) {
                removeCollageItem(selectedItemId);
                setSelectedItemId(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedItemId, removeCollageItem, setSelectedItemId]);

    useEffect(() => {
        const handleHistoryKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
                e.preventDefault();
                if (e.shiftKey) {
                    redo();
                } else {
                    undo();
                }
            }
        };
        window.addEventListener('keydown', handleHistoryKey);
        return () => window.removeEventListener('keydown', handleHistoryKey);
    }, [undo, redo]);
};
