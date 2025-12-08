import { Grid, Layers, Shuffle } from 'lucide-react';
import { useCollageStore } from '../../store/collageStore';
import { PRESETS } from '../../utils/layoutUtils';

export const LayoutsPanel = () => {
    const { applyLayout, shuffleLayout, resizeCanvas } = useCollageStore();

    return (
        <div className="flex flex-col h-full overflow-y-auto custom-scrollbar p-4 space-y-8">
            <section>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Auto Layouts</h3>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => applyLayout('grid')} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-800 border border-white/5 hover:border-indigo-500/50 hover:bg-slate-700 transition" data-testid="layout-grid">
                        <Grid size={24} className="text-indigo-400" />
                        <span className="text-xs font-medium text-slate-300">Grid</span>
                    </button>
                    <button onClick={() => applyLayout('mosaic')} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-800 border border-white/5 hover:border-indigo-500/50 hover:bg-slate-700 transition" data-testid="layout-mosaic">
                        <Layers size={24} className="text-pink-400" />
                        <span className="text-xs font-medium text-slate-300">Mosaic</span>
                    </button>
                    <button onClick={shuffleLayout} className="col-span-2 flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800 border border-white/5 hover:border-indigo-500/50 hover:bg-slate-700 transition group">
                        <Shuffle size={16} className="text-teal-400 group-hover:rotate-180 transition-transform duration-500" />
                        <span className="text-xs font-medium text-slate-300">Shuffle Current</span>
                    </button>
                </div>
            </section>

            <section>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Canvas Presets</h3>
                <div className="space-y-2">
                    {PRESETS.map((preset) => (
                        <button
                            key={preset.name}
                            onClick={() => resizeCanvas(preset.width, preset.height)}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-slate-800 border border-white/5 hover:bg-slate-700 hover:border-white/10 transition group"
                        >
                            <span className="text-sm text-slate-300 group-hover:text-white">{preset.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{preset.width}x{preset.height}</span>
                        </button>
                    ))}
                </div>
            </section>
        </div>
    );
};
