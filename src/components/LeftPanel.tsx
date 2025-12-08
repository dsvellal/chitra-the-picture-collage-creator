import React, { useState } from 'react';
import { Upload, Layout, Type, Sticker, Keyboard } from 'lucide-react';
import clsx from 'clsx';
import { UploadsPanel } from './panels/UploadsPanel';
import { LayoutsPanel } from './panels/LayoutsPanel';
import { TextPanel } from './panels/TextPanel';
import { StickersPanel } from './panels/StickersPanel';
import { ShortcutsDialog } from './ShortcutsDialog';

export const LeftPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'uploads' | 'layouts' | 'text' | 'stickers'>('uploads');
    const [showShortcuts, setShowShortcuts] = useState(false);

    return (
        <div className="flex h-full border-r border-white/10 bg-slate-900/50 backdrop-blur-xl">
            {/* ... Sidebar icons ... */}
            <div className="w-16 flex flex-col items-center py-6 gap-6 border-r border-white/5">
                <NavIcon icon={Upload} label="Uploads" active={activeTab === 'uploads'} onClick={() => setActiveTab('uploads')} testId="nav-uploads" />
                <NavIcon icon={Layout} label="Layouts" active={activeTab === 'layouts'} onClick={() => setActiveTab('layouts')} testId="nav-layouts" />
                <NavIcon icon={Type} label="Text" active={activeTab === 'text'} onClick={() => setActiveTab('text')} testId="nav-text" />
                <NavIcon icon={Sticker} label="Stickers" active={activeTab === 'stickers'} onClick={() => setActiveTab('stickers')} />

                <div className="mt-auto">
                    <NavIcon icon={Keyboard} label="Help" active={showShortcuts} onClick={() => setShowShortcuts(true)} />
                </div>
            </div>

            {/* Panel Content */}
            <div className="w-80 h-full flex flex-col bg-slate-800/50">
                {activeTab === 'uploads' && <UploadsPanel />}
                {activeTab === 'layouts' && <LayoutsPanel />}
                {activeTab === 'text' && <TextPanel />}
                {activeTab === 'stickers' && <StickersPanel />}
            </div>

            <ShortcutsDialog isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
        </div>
    );
};

const NavIcon = ({ icon: Icon, label, active, onClick, testId }: { icon: React.ElementType, label: string, active: boolean, onClick: () => void, testId?: string }) => (
    <button
        onClick={onClick}
        data-testid={testId}
        className={clsx(
            "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
            active ? "text-indigo-400 bg-indigo-500/10" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
        )}
    >
        <Icon size={24} strokeWidth={1.5} />
        <span className="text-[10px] font-medium">{label}</span>
    </button>
);
