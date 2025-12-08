
import React from 'react';
import { useCollageStore } from '../store/collageStore';
import { Github, Undo2, Redo2, Download } from 'lucide-react';

import Logo from '../assets/logo.png';

interface LayoutProps {
    children: React.ReactNode;
    onExport?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onExport }) => {
    const { undo, redo, past, future } = useCollageStore();

    return (
        <div className="h-screen w-screen overflow-hidden bg-slate-900 text-slate-100 font-sans flex flex-col">
            <header className="h-14 bg-slate-800/80 backdrop-blur-md border-b border-white/10 shrink-0 flex items-center justify-between px-4 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden bg-white/5">
                        <img src={Logo} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="font-bold text-lg tracking-tight">Chitra <span className="text-[10px] px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30 align-middle ml-1">PREMIUM</span></h1>

                    {/* Undo/Redo */}
                    <div className="h-6 w-px bg-white/10 mx-2" />
                    <div className="flex items-center gap-1">
                        <button
                            onClick={undo}
                            disabled={past.length === 0}
                            className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition"
                            title="Undo (Ctrl+Z)"
                        >
                            <Undo2 size={18} />
                        </button>
                        <button
                            onClick={redo}
                            disabled={future.length === 0}
                            className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition"
                            title="Redo (Ctrl+Shift+Z)"
                        >
                            <Redo2 size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onExport}
                        className="px-4 py-1.5 bg-white text-indigo-900 font-semibold rounded-lg hover:bg-slate-200 transition text-sm flex items-center gap-2 active:scale-95 duration-75"
                    >
                        <Download size={16} /> Export
                    </button>
                    <a
                        href="https://github.com/dsvellal/picture-collage-creator"
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-full hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
                    >
                        <Github size={20} />
                    </a>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {children}
            </main>
        </div>
    );
};
