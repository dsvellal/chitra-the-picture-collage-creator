import React from 'react';
import type { CollageItem } from '../../store/collageStore';

interface ImageTransformProps {
    item: CollageItem;
    onUpdate: (id: string, updates: Partial<CollageItem>) => void;
}

export const ImageTransform: React.FC<ImageTransformProps> = ({ item, onUpdate }) => {
    return (
        <section className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Transform</h3>
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label className="text-[10px] text-slate-400">X Position</label>
                    <input
                        type="number"
                        value={Math.round(item.x)}
                        onChange={(e) => onUpdate(item.id, { x: Number(e.target.value) })}
                        className="w-full bg-slate-800 border-white/10 rounded px-2 py-1 text-xs text-slate-300"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] text-slate-400">Y Position</label>
                    <input
                        type="number"
                        value={Math.round(item.y)}
                        onChange={(e) => onUpdate(item.id, { y: Number(e.target.value) })}
                        className="w-full bg-slate-800 border-white/10 rounded px-2 py-1 text-xs text-slate-300"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] text-slate-400">Rotation</label>
                    <input
                        type="number"
                        value={Math.round(item.rotation)}
                        onChange={(e) => onUpdate(item.id, { rotation: Number(e.target.value) })}
                        className="w-full bg-slate-800 border-white/10 rounded px-2 py-1 text-xs text-slate-300"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] text-slate-400">Scale</label>
                    <input
                        type="number"
                        step="0.1"
                        value={Number(item.scale.toFixed(2))}
                        onChange={(e) => onUpdate(item.id, { scale: Number(e.target.value) })}
                        className="w-full bg-slate-800 border-white/10 rounded px-2 py-1 text-xs text-slate-300"
                    />
                </div>
            </div>
        </section>
    );
};
