import React from 'react';
import type { CollageItem } from '../../store/collageStore';

interface TextPropertiesProps {
    item: CollageItem;
    onUpdate: (id: string, updates: Partial<CollageItem>) => void;
}

export const TextProperties: React.FC<TextPropertiesProps> = ({ item, onUpdate }) => {
    return (
        <section className="space-y-4">
            <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400">Content</label>
                <textarea
                    value={item.text || ''}
                    onChange={(e) => onUpdate(item.id, { text: e.target.value })}
                    className="w-full bg-slate-800 border-white/10 rounded-lg p-2 text-sm text-white"
                    rows={3}
                />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-400">Size</label>
                    <input
                        type="number"
                        value={item.fontSize || 20}
                        onChange={(e) => onUpdate(item.id, { fontSize: Number(e.target.value) })}
                        className="w-full bg-slate-800 border-white/10 rounded-lg p-2 text-sm text-white"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-400">Color</label>
                    <div className="flex items-center gap-2 h-9 bg-slate-800 rounded-lg px-2 border border-white/10">
                        <input
                            type="color"
                            value={item.fill || '#000000'}
                            onChange={(e) => onUpdate(item.id, { fill: e.target.value })}
                            className="w-6 h-6 rounded border-none cursor-pointer bg-transparent"
                        />
                        <span className="text-xs text-slate-400 font-mono">{item.fill}</span>
                    </div>
                </div>
            </div>
        </section>
    );
};
