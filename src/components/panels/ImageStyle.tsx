import React from 'react';
import type { CollageItem } from '../../store/collageStore';

interface ImageStyleProps {
    item: CollageItem;
    onUpdate: (id: string, updates: Partial<CollageItem>) => void;
}

export const ImageStyle: React.FC<ImageStyleProps> = ({ item, onUpdate }) => {
    return (
        <section className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Style</h3>

            <button
                onClick={() => onUpdate(item.id, {
                    borderColor: '#ffffff',
                    borderWidth: 15,
                    borderRadius: 0,
                    shadow: { color: 'black', blur: 20, offset: { x: 5, y: 5 }, opacity: 0.3 }
                })}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-xs font-medium text-white mb-2 shadow-lg shadow-indigo-500/20"
            >
                ✨ Apply Polaroid Style
            </button>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label className="text-[10px] text-slate-400">Border Width</label>
                    <input
                        type="number"
                        value={item.borderWidth || 0}
                        onChange={(e) => onUpdate(item.id, { borderWidth: Number(e.target.value) })}
                        className="w-full bg-slate-800 border-white/10 rounded px-2 py-1 text-xs text-slate-300"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] text-slate-400">Radius</label>
                    <input
                        type="number"
                        value={item.borderRadius !== undefined ? item.borderRadius : ''}
                        placeholder="Global"
                        onChange={(e) => onUpdate(item.id, { borderRadius: Number(e.target.value) })}
                        className="w-full bg-slate-800 border-white/10 rounded px-2 py-1 text-xs text-slate-300"
                    />
                </div>
            </div>
            <div className="space-y-1">
                <label className="text-[10px] text-slate-400">Border Color</label>
                <div className="flex gap-2">
                    <input
                        type="color"
                        value={item.borderColor || '#ffffff'}
                        onChange={(e) => onUpdate(item.id, { borderColor: e.target.value })}
                        className="w-8 h-8 rounded cursor-pointer bg-transparent border border-white/10"
                    />
                    <div className="flex-1 flex items-center px-2 bg-slate-800 rounded border border-white/10 text-xs font-mono text-slate-400">
                        {item.borderColor || '#ffffff'}
                    </div>
                </div>
            </div>
        </section>
    );
};
