import React, { useState } from 'react';
import { Maximize, Palette, Move, Sliders, ChevronDown, ChevronRight, Layout as LayoutIcon, Type, Sticker } from 'lucide-react';
import type { CanvasSettings } from '../../store/collageStore';
import { LayoutsPanel } from './LayoutsPanel';
import { TextPanel } from './TextPanel';
import { StickersPanel } from './StickersPanel';

interface CanvasPropertiesProps {
    settings: CanvasSettings;
    onUpdate: (settings: Partial<CanvasSettings>) => void;
}

const AccordionItem = ({ title, icon: Icon, children, defaultOpen = false }: { title: string, icon: React.ElementType, children: React.ReactNode, defaultOpen?: boolean }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-white/5 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-2 text-slate-300 font-medium text-sm">
                    <Icon size={16} className="text-indigo-400" />
                    {title}
                </div>
                {isOpen ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronRight size={14} className="text-slate-500" />}
            </button>
            {isOpen && <div className="p-4 pt-0">{children}</div>}
        </div>
    );
};

export const CanvasProperties: React.FC<CanvasPropertiesProps> = ({ settings, onUpdate }) => {
    return (
        <div className="w-72 h-full bg-slate-900/50 border-l border-white/10 flex flex-col backdrop-blur-xl">
            <div className="p-4 border-b border-white/10">
                <h2 className="font-semibold text-white flex items-center gap-2">
                    <Sliders size={16} className="text-indigo-400" />
                    Canvas Settings
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <AccordionItem title="Canvas Size" icon={Maximize} defaultOpen={true}>
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
                </AccordionItem>

                <AccordionItem title="Background" icon={Palette}>
                    <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl border border-white/5">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/20 shadow-inner">
                            <input
                                type="color"
                                value={settings.backgroundColor}
                                onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                                className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] p-0 m-0 cursor-pointer opacity-100"
                                data-testid="bg-color-picker"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-slate-400">Color</span>
                            <span className="text-sm font-mono text-slate-200 uppercase">{settings.backgroundColor}</span>
                        </div>
                    </div>
                </AccordionItem>

                <AccordionItem title="Global Styling" icon={Move}>
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
                                data-testid="padding-slider"
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
                </AccordionItem>

                <div className="border-t border-white/10 mt-4 pt-2">
                    <p className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Add to Collage</p>

                    <AccordionItem title="Layouts" icon={LayoutIcon}>
                        <LayoutsPanel />
                    </AccordionItem>

                    <AccordionItem title="Text" icon={Type}>
                        <TextPanel />
                    </AccordionItem>

                    <AccordionItem title="Stickers" icon={Sticker}>
                        <StickersPanel />
                    </AccordionItem>
                </div>
            </div>
        </div>
    );
};
