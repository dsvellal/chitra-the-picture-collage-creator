import { useState } from 'react';

import { calculateNewSelection, getEventModifiers } from '../utils/selectionUtils';

export const useSelection = (allIds: string[]) => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null);

    const toggleSelection = (id: string, index: number, event?: React.MouseEvent) => {
        const { shift, meta } = getEventModifiers(event);

        setSelectedIds(prev => calculateNewSelection(prev, id, index, allIds, lastClickedIndex, shift, meta));

        if (!shift) {
            setLastClickedIndex(index);
        }
    };

    return { selectedIds, toggleSelection };
};
