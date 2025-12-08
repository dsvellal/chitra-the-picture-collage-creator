import React from 'react';
import { Maximize, Palette, Move, Sliders } from 'lucide-react';
import type { CanvasSettings } from '../../store/collageStore';

interface CanvasPropertiesProps {
    settings: CanvasSettings;
    onUpdate: (settings: Partial<CanvasSettings>) => void;
}

export const CanvasProperties: React.FC<CanvasPropertiesProps> = ({ settings, onUpdate }) => {
    return (
        <div className="w-72 h-full bg-slate-900/50 border-l border-white/10 flex flex-col backdrop-blur-xl">
            <div className="p-4 border-b border-white/10">
                <h2 className="font-semibold text-white flex items-center gap-2">
                    <Sliders size={16} className="text-indigo-400" />
                    Canvas Settings
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-8">
                {/* Canvas Dimensions */}
                <section>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Maximize size={12} /> Canvas Size
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-medium text-slate-400">Width (px)</label>
                            <input
                                type="number"
                                value={settings.width}
                                onChange={(e) => onUpdate({ width: Number(e.target.value) })}
                                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/10 text-slate-200 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-medium text-slate-400">Height (px)</label>
                            <input
                                type="number"
                                value={settings.height}
                                onChange={(e) => onUpdate({ height: Number(e.target.value) })}
                                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/10 text-slate-200 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                            />
                        </div>
                    </div>
                </section>

                {/* Background */}
                <section>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Palette size={12} /> Background
                    </h3>
                    <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl border border-white/5">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/20 shadow-inner">
                            <input
                                type="color"
                                value={settings.backgroundColor}
                                onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                                className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] p-0 m-0 cursor-pointer opacity-100"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-slate-400">Color</span>
                            <span className="text-sm font-mono text-slate-200 uppercase">{settings.backgroundColor}</span>
                        </div>
                    </div>
                </section>

                {/* Global Styling */}
                <section>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Move size={12} /> Global Styling
                    </h3>

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-xs font-medium text-slate-400">Spacing</label>
                                <span className="text-xs text-slate-500">{settings.padding}px</span>
                            </div>
                            <input
                                type="range"
                                min="0" max="100"
                                value={settings.padding}
                                onChange={(e) => onUpdate({ padding: Number(e.target.value) })}
                                className="w-full h-1 bg-slate-700 rounded-full appearance-none accent-indigo-500 cursor-pointer"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-xs font-medium text-slate-400">Corner Radius</label>
                                <span className="text-xs text-slate-500">{settings.borderRadius}px</span>
                            </div>
                            <input
                                type="range"
                                min="0" max="100"
                                value={settings.borderRadius}
                                onChange={(e) => onUpdate({ borderRadius: Number(e.target.value) })}
                                className="w-full h-1 bg-slate-700 rounded-full appearance-none accent-indigo-500 cursor-pointer"
                            />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};
