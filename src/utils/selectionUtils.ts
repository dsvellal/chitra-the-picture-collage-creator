
export const getRangeSelection = (allIds: string[], lastIndex: number | null, index: number, prev: Set<string>) => {
    const newSet = new Set(prev);
    if (lastIndex !== null) {
        const start = Math.min(lastIndex, index);
        const end = Math.max(lastIndex, index);
        allIds.slice(start, end + 1).forEach(i => newSet.add(i));
    }
    return newSet;
};

export const getToggleSelection = (id: string, prev: Set<string>) => {
    const newSet = new Set(prev);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    return newSet;
};

export const calculateNewSelection = (
    prev: Set<string>,
    id: string,
    index: number,
    allIds: string[],
    lastIndex: number | null,
    shift: boolean,
    meta: boolean
) => {
    if (shift) return getRangeSelection(allIds, lastIndex, index, prev);
    if (meta) return getToggleSelection(id, prev);
    return getToggleSelection(id, prev);
};


export const getEventModifiers = (event?: React.MouseEvent) => {
    if (!event) return { shift: false, meta: false };
    return {
        shift: !!event.shiftKey,
        meta: !!event.metaKey || !!event.ctrlKey
    };
};
