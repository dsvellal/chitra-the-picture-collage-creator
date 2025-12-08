import React from 'react';
import { Layers, Trash2 } from 'lucide-react';
import type { CollageItem } from '../../store/collageStore';

interface CommonActionsProps {
    item: CollageItem;
    onUpdate: (id: string, updates: Partial<CollageItem>) => void;
    onRemove: (id: string) => void;
}

export const CommonActions: React.FC<CommonActionsProps> = ({ item, onUpdate, onRemove }) => {
    return (
        <div className="flex gap-2">
            <button
                onClick={() => onUpdate(item.id, { zIndex: item.zIndex + 1 })}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium text-slate-300 flex justify-center gap-2"
            >
                <Layers size={14} /> Bring Fwd
            </button>
            <button
                onClick={() => onRemove(item.id)}
                className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-xs font-medium text-red-400 flex justify-center gap-2"
            >
                <Trash2 size={14} /> Remove
            </button>
        </div>
    );
};
